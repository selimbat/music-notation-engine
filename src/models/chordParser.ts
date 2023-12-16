import chords from "./chords";
import { NoteName, orderedNotes } from "./definitions";
import { ChordFormula, ChordNotation, ChordQuality } from "./types";


class ChordParser {
    public static parse(chordNotation: ChordNotation): [NoteName, ChordFormula, ChordQuality] {
        if (!chordNotation) {
            throw new TypeError("Empty chord notation.");
        }
        if (!(orderedNotes as readonly string[]).includes(chordNotation[0])) {
            throw new TypeError(`Unknown note name ${chordNotation[0]}.`);
        }

        let offset = chordNotation.split('').findIndex((c, i) => {
            if (i === 0) {
                // The first character is always the note name
                return false;
            }
            return !['b', '#'].includes(c);
        });
        offset = offset === -1 ? chordNotation.length : offset;
        const root = chordNotation.substring(0, offset) as NoteName;

        const quality = chordNotation.substring(offset);
        if (!Object.keys(chords).includes(quality)) {
            console.log(quality, offset);
            throw new TypeError(`Unknown chord quality ${chordNotation}.`);
        }
        const chord = chords[quality as ChordQuality];
        return [root, chord, quality as ChordQuality];
    }
}

export default ChordParser;
