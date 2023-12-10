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
    // Only works for 4/4.

    private maxRange: Pitch;
    private minRange: Pitch;

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        super(changes, transposition);

        this.maxRange = new Pitch('A', 4);
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
        let previousChord: ChordNotation | RepeatChord | null = null;
        const ABCBuilder = new NotationBuilder();

        let previous4thBeat: Pitch | null;

        this.chordChanges.forEach((ch, i) => {
            const chordSymbol = ch === '%' && previousChord ? previousChord : ch;
            const [root, chord] = ChordParser.parse(chordSymbol as ChordNotation);

            let chordTones = getNotesOfChord(chord, this.getRootOfChord(root, previous4thBeat)).map(p => new Note(0.25, p));

            const canGoUp = chordTones.every(t => !t.pitch || this.isInRange(t.pitch));

            if (!canGoUp) {
                // Change the order of the notes to play 1 (-> 7) -> 5 -> 3 instead of 1 -> 3 -> 5 (-> 7)
                // And also lower the notes by one octave
                chordTones = [chordTones.shift()!, ...chordTones.reverse()].map((t, i) => {
                    if (i === 0 || !t.pitch) {
                        return t;
                    }
                    return new Note(t.duration, t.pitch.name, t.pitch.getOctave() - 1);
                })
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

                let chordToneClosestToNextRoot: Note | null = null;
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

                if (chordToneClosestToNextRoot !== null) {
                    // Set fourth beat
                    chordTones[3] = chordToneClosestToNextRoot;
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
            previous4thBeat = chordTones[3].pitch;
        })

        return ABCBuilder.toString();

    }
}