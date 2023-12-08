import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import chords from "./models/chords";
import scales, { getNotesOfScale } from "./models/scales";
import ChordParser from "./models/chordParser";
import { ChordNotation } from "./models/types";

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const chordTones = getNotesOfChord(chords['-'], new Pitch(r));
    console.log(`Minor chord of ${r} is ${chordTones.map(t => t.name).join(', ')}`);
});

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const scaleTones = getNotesOfScale(scales.major, new Pitch(r));
    console.log(`Major scale of ${r} is ${scaleTones.map(t => t.name).join(', ')}`);
});

['C', 'Cdim', 'Cmaj7', 'C7', 'Cø', 'C-maj7', 'Caug', 'C-'].forEach((ch) => {
    const [root, chord] = ChordParser.parse(ch as ChordNotation);
    const chordTones = getNotesOfChord(chord, new Pitch(root));
    console.log(`Notes of chord ${ch} is ${chordTones.map(t => t.name).join(', ')}`);
});
