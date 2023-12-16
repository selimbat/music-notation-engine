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

        this.maxRange = new Pitch('F', 4);
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

    private duplicatePitchesOverRange(pitches: Pitch[]): Pitch[] {
        const duplicatedPitches: Pitch[] = [];

        pitches.forEach(p => {
            let dupUpPitch: Pitch = p;
            do {
                if (this.isInRange(dupUpPitch)) {
                    duplicatedPitches.push(dupUpPitch);
                }
                dupUpPitch = new Pitch(dupUpPitch.name, dupUpPitch.getOctave() + 1);
            } while (dupUpPitch && this.isInRange(dupUpPitch));

            let dupDownPitch: Pitch = new Pitch(p.name, p.getOctave() - 1);
            do {
                if (this.isInRange(dupDownPitch)) {
                    duplicatedPitches.push(dupDownPitch);
                }
                dupDownPitch = new Pitch(dupDownPitch.name, dupDownPitch.getOctave() - 1);
            } while (dupDownPitch && this.isInRange(dupDownPitch));
        })

        return duplicatedPitches;
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

            const duplicatedGuideTones = this.duplicatePitchesOverRange(guideTones);

            const notesToAdd = [
                duplicatedGuideTones.map(t => new Note(0.25, t)),
                duplicatedGuideTones.map(t => new Note(0.25, t)),
                new Note(0.25, null),
                duplicatedGuideTones.map(t => new Note(0.25, t)),
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