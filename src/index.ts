import intervals from "./models/intervals";
import WanderingWalkingBassGenerator from "./models/walkers/wanderingWalkingBass";
import { renderAbc } from "abcjs";
import { changesBySong } from "./data/songs";
import { noteRelativeValues } from "./models/definitions";

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

const getSongId = () => {
    const songSelect = document.getElementById("songSelect") as HTMLSelectElement;
    return songSelect.options[songSelect.selectedIndex].value;
}
const getTonality = () => {
    const tonaSelect = document.getElementById("tonaSelect") as HTMLSelectElement;
    return tonaSelect.options[tonaSelect.selectedIndex].value;
}

function drawNotation() {

    const songId = getSongId();
    const tona = getTonality();

    console.log(tona);

    const song = changesBySong[songId];

    const walkingBass = new WanderingWalkingBassGenerator(song[1], intervals[8].perfect);
    renderAbc(renderEl, walkingBass.walk());
}

const onSongChanged = () => {
    const songId = getSongId();
    const [key] = changesBySong[songId];

    const tonaSelect = document.getElementById("tonaSelect") as HTMLSelectElement;
    tonaSelect.value = key;
    drawNotation();
};

buildSelect("songSelect", "Grille : ", Object.keys(changesBySong).map(k => ({ value: k, label: k })), onSongChanged);
buildSelect("tonaSelect", "Tonalité : ", Object.keys(noteRelativeValues).map(k => ({ value: k, label: k })), drawNotation);


const renderEl = document.createElement('div');
document.body.appendChild(renderEl);

onSongChanged()