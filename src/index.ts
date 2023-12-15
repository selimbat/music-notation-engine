import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import scales, { getNotesOfScale } from "./models/scales";
import ChordParser from "./models/chordParser";
import { ChordNotation } from "./models/types";
import Note from "./models/note";
import NotationBuilder from "./models/notationBuilder";
import intervals from "./models/intervals";
import WanderingWalkingBassGenerator from "./models/walkers/wanderingWalkingBass";
import { renderAbc } from "abcjs";
import { RepeatChord } from "./models/walkers/abstractWalkingBass";


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

const changesBySong: Record<string, readonly (ChordNotation | RepeatChord)[]> = {
    'All of Me': [
        'Cmaj7', '%', 'E7', '%',
        'A7', '%', 'D-', '%',
        'E7', '%', 'A-', '%',
        'D7', '%', 'D-7', 'G7',

        'Cmaj7', '%', 'E7', '%',
        'A7', '%', 'D-', '%',
        'F', 'F-', 'Cmaj7', 'A7',
        'D-7', 'G7', 'C6', '%',
    ],
    'Beautiful Love': [
        'Eø', 'A7', 'D-', '%',
        'G-7', 'C7', 'Fmaj7', 'Eø',
        'D-', 'G-7', 'Bb7', 'Eø',
        'D-', 'G7', 'Eø', 'A7',

        'Eø', 'A7', 'D-', '%',
        'G-7', 'C7', 'Fmaj7', 'Eø',
        'D-', 'G-7', 'Bb7', 'Eø',
        'D-', 'Bb7', 'D-', '%',
    ],
    '12-bar Blues': [
        'Bb7', '%', '%', '%',
        'Eb7', '%', 'Bb7', '%',
        'F7', 'Eb7', 'Bb7', '%',
    ],
    'Grille de test': [
        'Eaug', 'F-7', 'Bb7', 'Eb-7',
        'Fb-', '%', 'A', 'D'
    ],
};

type SelectOption = {
    value: string;
    label: string;
}

function buildSelect(id: string, label: string, options: SelectOption[], onChange: () => void) {

    const labelEl = document.createElement('label');
    labelEl.appendChild(document.createTextNode(label));
    document.body.appendChild(labelEl);

    const selectEl = document.createElement('select');
    selectEl.id = id;
    selectEl.onchange = onChange;
    options.forEach(o => {
        const optionEl = document.createElement('option');
        optionEl.value = o.value;
        optionEl.appendChild(document.createTextNode(o.label));
        selectEl.appendChild(optionEl);
    })
    document.body.appendChild(selectEl);
}

function drawNotation() {

    const songSelect = document.getElementById("songSelect") as HTMLSelectElement;
    const songId = songSelect.options[songSelect.selectedIndex].value;

    const changes = changesBySong[songId];

    const walkingBass = new WanderingWalkingBassGenerator(changes, intervals[8].perfect);
    renderAbc(renderEl, walkingBass.walk());
}

buildSelect("songSelect", "Grille :", Object.keys(changesBySong).map(k => ({ value: k, label: k })), drawNotation);


const renderEl = document.createElement('div');
document.body.appendChild(renderEl);
