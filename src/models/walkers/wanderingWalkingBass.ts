import ChordParser from "../chordParser";
import chords, { getNotesOfChord } from "../chords";
import { NoteName, NoteRelativeValues } from "../definitions";
import intervals, { getIntervalNote, getTonalDistance } from "../intervals";
import NotationBuilder from "../notationBuilder";
import Note from "../note";
import Pitch from "../pitch";
import { ChordNotation, Interval } from "../types";
import AbstractWalkingBassGenerator, { RepeatChord } from "./abstractWalkingBass";

export default class WanderingWalkingBassGenerator extends AbstractWalkingBassGenerator {
    // Builds a walking bass that plays the chord tones, starting from the root
    // and aiming for the root of the next chord.
    // Only works for 4/4.

    private maxRange: Pitch;
    private minRange: Pitch;

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        super(changes, transposition);

        this.maxRange = new Pitch('F', 4);
        this.minRange = new Pitch('E', 2);
    }

    private isInRange(pitch: Pitch): boolean {
        return pitch.value >= this.minRange.value && pitch.value <= this.maxRange.value;
    }

    private getRootOfChord(note: NoteName, previous4thBeat: Pitch | null): Pitch {
        const pitch = new Pitch(note);
        if (previous4thBeat) {
            return new Pitch(
                note,
                Math.floor((previous4thBeat.value + getTonalDistance(
                    previous4thBeat.value % 12 as NoteRelativeValues,
                    pitch.value % 12 as NoteRelativeValues,
                )) / 12)
            );
        }
        if (this.isInRange(pitch)) {
            return pitch;
        }
        if (pitch.value > this.maxRange.value) {
            const dist = pitch.value - this.minRange.value;
            return new Pitch(note, pitch.getOctave() - Math.floor(dist / 12));
        }
        const dist = this.minRange.value - pitch.value;
        return new Pitch(note, pitch.getOctave() + (Math.floor(dist / 12) + 1));

    }

    public walk(): string {
        const ABCBuilder = new NotationBuilder();

        const fullRange = (this.maxRange.value - this.minRange.value);

        let previousChord: ChordNotation | RepeatChord | null = null;
        let previous4thBeat: Pitch | null;
        let previousDirection: 'up' | 'down' = 'down';

        this.chordChanges.forEach((ch, i) => {
            const chordSymbol = ch === '%' && previousChord ? previousChord : ch;
            const [root, chord] = ChordParser.parse(chordSymbol as ChordNotation);

            const rootPitch = this.getRootOfChord(root, previous4thBeat);

            let chordTones = getNotesOfChord(
                chord,
                rootPitch,
            ).map(p => new Note(0.25, p));

            const canGoUp = chordTones.every(t => !t.pitch || this.isInRange(t.pitch));

            const distFromMinRange = (rootPitch.value - this.minRange.value) / fullRange;
            const isInUpperHalf = distFromMinRange > 0.5;

            if (!canGoUp || (isInUpperHalf && previousDirection === 'up')) {
                // Change the order of the notes to play 1 (-> 7) -> 5 -> 3 instead of 1 -> 3 -> 5 (-> 7)
                // And also lower the notes by one octave
                const descendingChordTones = [chordTones.shift()!, ...chordTones.reverse()].map((t, i) => {
                    if (i === 0 || !t.pitch) {
                        return t;
                    }
                    return new Note(t.duration, t.pitch.name, t.pitch.getOctave() - 1);
                });

                chordTones = descendingChordTones;
                previousDirection = 'down';
            } else {
                previousDirection = 'up';
            }

            let nextChordSymbol: ChordNotation | RepeatChord | null = null;
            if (i + 1 < this.chordChanges.length) {
                nextChordSymbol = this.chordChanges[i + 1] === '%' ? chordSymbol : this.chordChanges[i + 1];
            }

            if (nextChordSymbol !== null) {
                const [nextRoot, nextChord] = ChordParser.parse(nextChordSymbol as ChordNotation);

                const nextChordRootPitch = getNotesOfChord(
                    nextChord, new Pitch(nextRoot)
                ).find(Boolean);

                let chordToneClosestToNextRoot: Note | null = null as Note | null;
                let minDist = Infinity;
                chordTones.forEach((t, i) => {
                    if (i === 0) return; // We don't want to consider the root

                    const dist = Math.abs(getTonalDistance(
                        t.pitch!.value % 12 as NoteRelativeValues,
                        nextChordRootPitch!.value % 12 as NoteRelativeValues,
                    ));
                    if (dist < minDist) {
                        minDist = dist;
                        chordToneClosestToNextRoot = t.copy();
                    }
                });

                if (chordToneClosestToNextRoot) {
                    if (getTonalDistance(
                        rootPitch.value % 12 as NoteRelativeValues,
                        chordToneClosestToNextRoot.pitch?.value! % 12 as NoteRelativeValues,
                    ) === -5) {
                        // The chord tone closest to the next chord root is the fifth.
                        const nextRootCorrectedForOctave = this.getRootOfChord(
                            nextChordRootPitch!.name as NoteName,
                            chordToneClosestToNextRoot.pitch
                        );
                        const chromaticApproachPitch = new Pitch(nextRootCorrectedForOctave!.value - 1)

                        chordTones[3] = new Note(0.25, chromaticApproachPitch);
                    } else {
                        // Set fourth beat
                        chordTones[3] = chordToneClosestToNextRoot;
                    }
                }
            }

            if (ch !== previousChord && ch !== '%') {
                chordTones[0].setAccompaniment(ch);
            }

            if (chordTones.length === 3) {
                let fourthBeatPitch: Pitch;
                if (Math.random() < 0.5) {
                    fourthBeatPitch = new Pitch(chordTones[0].pitch?.name!, chordTones[0].pitch?.getOctave()! + 1);
                } else {
                    fourthBeatPitch = chordTones[1].pitch!;
                }
                const fourthBeatNote = new Note(0.25, fourthBeatPitch)
                chordTones.push(fourthBeatNote);
            }

            ABCBuilder.addNotes(...chordTones);
            previousChord = chordSymbol;
            previous4thBeat = chordTones[chordTones.length - 1].pitch;
        })

        return ABCBuilder.toString();

    }
}