import ChordParser from "../chordParser";
import { getNotesOfChord } from "../chords";
import { NoteName } from "../definitions";
import intervals from "../intervals";
import NotationBuilder from "../notationBuilder";
import Note from "../note";
import Pitch from "../pitch";
import { ChordNotation, Interval } from "../types";
import AbstractWalkingBassGenerator, { RepeatChord } from "./abstractWalkingBass";

export default class GuideTonesGenerator extends AbstractWalkingBassGenerator {


    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        super(changes, transposition);

        this.maxRange = new Pitch('B', 3);
        this.minRange = new Pitch('C', 3);
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

            const chordTones = getNotesOfChord(chord, rootPitch);

            const guideTones = [chordTones[1]]; // the third

            if (chordTones.length > 3) {
                guideTones.push(chordTones[3]); // the seventh
            }

            const notesToAdd = [
                guideTones.map(t => new Note(0.25, t)),
                guideTones.map(t => new Note(0.25, t)),
                new Note(0.25, null),
                guideTones.map(t => new Note(0.25, t)),
            ]

            if (ch !== previousChord && ch !== '%') {
                const firstBeatNotes = notesToAdd[0];
                if (Array.isArray(firstBeatNotes)) {
                    firstBeatNotes[0].setAccompaniment(ch);
                } else {
                    firstBeatNotes.setAccompaniment(ch);
                }
            }

            ABCBuilder.addNotes(...notesToAdd);
            previousChord = chordSymbol;
        })

        return ABCBuilder.toString();

    }
}