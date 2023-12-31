import ChordParser from "../chordParser";
import { getNotesOfChord } from "../chords";
import { NoteName } from "../definitions";
import intervals, { getIntervalNote } from "../intervals";
import NotationBuilder from "../notationBuilder";
import Note from "../note";
import Pitch from "../pitch";
import { ChordNotation, Interval } from "../types";
import AbstractWalkingBassGenerator, { RepeatChord } from "./abstractWalkingBass";

export default class ArpeggiosGenerator extends AbstractWalkingBassGenerator {
    // Builds a walking bass that arpeggiates one chord per bar
    // starting from the bass and ascending.
    // Only works for 4/4.
    // For triads, randomly pick 8th or 3rd for the fourth beat.

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        super(changes, transposition);

        this.maxRange = new Pitch('B', 3);
        this.minRange = new Pitch('E', 2);
    }

    private getRootOfChord(note: NoteName): Pitch {
        const pitch = new Pitch(note);
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
        const ABCBuilder = new NotationBuilder("4/4", "C", "bass");
        this.chordChanges.forEach(ch => {
            const chordSymbol = ch === '%' ? previousChord : ch;
            const [root, chord] = ChordParser.parse(chordSymbol as ChordNotation);

            const rootPitch = this.getRootOfChord(root);

            const chordTones = getNotesOfChord(chord, rootPitch).map(p => new Note(0.25, p));

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

            if (ch !== previousChord && ch !== '%') {
                chordTones[0].setAccompaniment(ch);
            }

            ABCBuilder.addNotes(...chordTones);
            previousChord = chordSymbol;
        })

        return ABCBuilder.toString();

    }
}