import ChordParser from "../chordParser";
import { getNotesOfChord } from "../chords";
import { getIntervalNote } from "../intervals";
import NotationBuilder from "../notationBuilder";
import Note from "../note";
import Pitch from "../pitch";
import { ChordNotation } from "../types";
import AbstractWalkingBassGenerator, { RepeatChord } from "./abstractWalkingBass";

export default class SimpleWalkingBassGenerator extends AbstractWalkingBassGenerator {
    // Builds a walking bass that arpeggiates one chord per bar
    // starting from the bass and ascending.
    // Only works for 4/4.
    // For triads, randomly pick 8th or 3rd for the fourth beat.

    public walk(): string {
        let previousChord: ChordNotation | RepeatChord | null = null;
        const ABCBuilder = new NotationBuilder("4/4", "C", "bass");
        this.chordChanges.forEach(ch => {
            const chordSymbol = ch === '%' ? previousChord : ch;
            const [root, chord] = ChordParser.parse(chordSymbol as ChordNotation);

            // TODO: do the transposition in the abstract class' constructor.
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