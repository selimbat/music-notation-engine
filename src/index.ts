import intervals, { getIntervalForSemitones, getTonalDistance } from "./models/intervals";
import WalkingBassGenerator from "./models/walkers/wanderingWalkingBass";
import { renderAbc } from "abcjs";
import { changesBySong } from "./data/songs";
import { NoteName, NoteRelativeValues, noteRelativeValues } from "./models/definitions";
import ArpeggiosGenerator from "./models/walkers/simpleWalkingBass";
import GuideTonesGenerator from "./models/walkers/guideTonesGenerator";

type SelectOption = {
    value: string;
    label: string;
}

function buildSelect(id: string, label: string, options: SelectOption[], onChange: () => void) {

    const labelEl = document.createElement('label');
    labelEl.setAttribute("for", id);
    labelEl.style.marginLeft = '1.5rem';
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

const getSelectValue = (selectId: string) => {
    const selectEl = document.getElementById(selectId) as HTMLSelectElement;
    return selectEl.options[selectEl.selectedIndex].value;
}

const getSongId = () => getSelectValue("songSelect");
const getTonality = () => getSelectValue("tonaSelect");
const getExercise = () => getSelectValue("exerciseSelect") as keyof typeof generators;


function drawNotation() {

    const songId = getSongId();
    const tona = getTonality();
    const exercise = getExercise();

    const [key, changes] = changesBySong[songId];

    const tonalDist = getTonalDistance(noteRelativeValues[key], noteRelativeValues[tona as NoteName]);

    const transposition = getIntervalForSemitones((tonalDist < 0 ? tonalDist + 12 : tonalDist) as NoteRelativeValues);

    const generatorClass = generators[exercise];
    const generator = new generatorClass(changes, transposition);

    const ABCNotation = generator.walk();

    console.log(ABCNotation);
    renderAbc(renderEl, ABCNotation);
}

const onSongChanged = () => {
    const songId = getSongId();
    const [key] = changesBySong[songId];

    const tonaSelect = document.getElementById("tonaSelect") as HTMLSelectElement;
    tonaSelect.value = key;
    drawNotation();
};

const possibleKeys = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
] as const;

const generators = {
    'Arpèges': ArpeggiosGenerator,
    'Walking bass': WalkingBassGenerator,
    'Guide notes': GuideTonesGenerator,
}

buildSelect("songSelect", "Grille : ", Object.keys(changesBySong).map(k => ({ value: k, label: k })), onSongChanged);
buildSelect("tonaSelect", "Tonalité : ", possibleKeys.map(k => ({ value: k, label: k })), drawNotation);
buildSelect("exerciseSelect", "Exercice : ", Object.keys(generators).map(k => ({ value: k, label: k })), drawNotation);


const renderEl = document.createElement('div');
document.body.appendChild(renderEl);

onSongChanged()