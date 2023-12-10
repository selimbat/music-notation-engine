import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import scales, { getNotesOfScale } from "./models/scales";
import ChordParser from "./models/chordParser";
import { ChordNotation } from "./models/types";
import Note from "./models/note";
import NotationBuilder from "./models/notationBuilder";
import intervals from "./models/intervals";
import WanderingWalkingBassGenerator from "./models/walkers/wanderingWalkingBass";


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

const allOfMe = [
    'Cmaj7', '%', 'E7', '%',
    'A7', '%', 'D-', '%',
    'E7', '%', 'A-', '%',
    'D7', '%', 'D-7', 'G7',

    'Cmaj7', '%', 'E7', '%',
    'A7', '%', 'D-', '%',
    'F', 'F-', 'Cmaj7', 'A7',
    'D-7', 'G7', 'C6', '%',
] as const

const beautifulLove = [
    'Eø', 'A7', 'D-', '%',
    'G-7', 'C7', 'Fmaj7', 'Eø',
    'D-', 'G-7', 'Bb7', 'Eø',
    'D-', 'G7', 'Eø', 'A7',

    'Eø', 'A7', 'D-', '%',
    'G-7', 'C7', 'Fmaj7', 'Eø',
    'D-', 'G-7', 'Bb7', 'Eø',
    'D-', 'Bb7', 'D-', '%',
] as const

const myChanges = [
    'Eaug', 'F-7', 'Bb7', 'Eb-7',
    'Fb-', '%', 'A', 'D'
] as const

const twelveBarBlues = [
    'Bb7', '%', '%', '%',
    'Eb7', '%', 'Bb7', '%',
    'F7', 'Eb7', 'Bb7', '%',
] as const


const walkingBass = new WanderingWalkingBassGenerator(allOfMe, intervals[8].perfect);
console.log(`ABCMusic notation of all of me is:`);
console.log(walkingBass.walk());
