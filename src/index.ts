import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import chords from "./models/chords";
import scales, { getNotesOfScale } from "./models/scales";
import ChordParser from "./models/chordParser";
import { ChordNotation } from "./models/types";
import Note from "./models/note";
import NotationBuilder from "./models/notationBuilder";


['C', 'Cdim', 'Cmaj7', 'C7', 'Cø', 'C-maj7', 'Caug', 'C-'].forEach((ch) => {
    const [root, chord] = ChordParser.parse(ch as ChordNotation);
    const chordTones = getNotesOfChord(chord, new Pitch(root));

    const accidentals = {
        'C': '#',
        'D': '#',
        'E': '#',
        'F': '#',
        'G': '#',
        'A': '#',
        'B': '',
    } as const

    console.log(`Notes of chord ${ch} is ${chordTones.map(
        t => new Note(1, t).toABCMusicString(accidentals)
    ).join(' | ')}`);
});

['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'].forEach(r => {
    const scaleNotes = getNotesOfScale(scales.major, new Pitch(r)).map(p => new Note(0.25, p));

    const ABCBuilder = new NotationBuilder();

    ABCBuilder.addNotes(...scaleNotes);

    console.log(`ABCMusic notation for major scale of ${r} is ${ABCBuilder.toString()}`);
});

const ABCBuilder = new NotationBuilder();
[ // Basic 12-bar blues in C
    'C7', 'C7', 'C7', 'C7',
    'F7', 'F7', 'C7', 'C7',
    'G7', 'F7', 'C7', 'C7',
].forEach(ch => {
    const [root, chord] = ChordParser.parse(ch as ChordNotation);
    const chordTones = getNotesOfChord(chord, new Pitch(root)).map(p => new Note(0.25, p));

    console.log(`Notes for chord ${ch} are ${chordTones.map((n) => n.pitch?.name + '-' + n.pitch?.getOctave()).join(', ')}`)
    ABCBuilder.addNotes(...chordTones);
})

console.log(`ABCMusic notation a 12-bar blues in C is:`);
console.log(ABCBuilder.toString());
