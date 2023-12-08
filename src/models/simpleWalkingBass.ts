import ChordParser from "./chordParser";
import chords, { getNotesOfChord } from "./chords";
import intervals, { getIntervalNote } from "./intervals";
import NotationBuilder from "./notationBuilder";
import Note from "./note";
import Pitch from "./pitch";
import { ChordNotation, Interval } from "./types";

type RepeatChord = '%';

export default class SimpleWalkingBassGenerator {
    // Builds a walking bass that arpeggiates one chord per bar
    // starting from the bass and ascending.
    // Only works for 4/4.
    // For triads, randomly pick 8th or 3rd for the fourth beat.

    chordChanges: readonly (ChordNotation | RepeatChord)[];
    transpositionInterval: Interval;

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        this.chordChanges = changes;
        this.transpositionInterval = transposition;
    }

    public walk(): string {
        let previousChord: ChordNotation | RepeatChord | null = null;
        const ABCBuilder = new NotationBuilder();
        this.chordChanges.forEach(ch => {
            const chordSymbol = ch === '%' ? previousChord : ch;
            const [root, chord] = ChordParser.parse(chordSymbol as ChordNotation);

            const transposedPitch = getIntervalNote(new Pitch(root), this.transpositionInterval, "down");

            const chordTones = getNotesOfChord(chord, transposedPitch).map(p => new Note(0.25, p));

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