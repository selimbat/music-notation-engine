import { NoteName, noteNameFromRelativeValue, noteRelativeValues, NoteRelativeValues } from "./definitions";
import { Octave } from "./types";


const resolveEnharmony = (value: string, depth: number = 0): NoteRelativeValues => {
    if (depth > 2) {
        throw new Error(`Too many sharps or flats for ${value}. Keep it simple.`);
    }
    if (value in noteRelativeValues) {
        return noteRelativeValues[value as NoteName];
    }
    if (value.endsWith('#')) {
        const pitchSemitoneLower = resolveEnharmony(value.replace(/#$/, ''), depth + 1);
        return (pitchSemitoneLower + 1) % 12 as NoteRelativeValues;
    }
    if (value.endsWith('b')) {
        const pitchSemitoneHigher = resolveEnharmony(value.replace(/b$/, ''), depth + 1);
        return (pitchSemitoneHigher - 1 + 12) % 12 as NoteRelativeValues;
    }
    throw new TypeError(`Couldn't resolve enharmony for pitch ${value}.`);
}


export default class Pitch {
    value: number; // from 0 to 96 (8 octaves from C0 to C8)
    name: string;

    constructor(value: string, octave?: number)
    constructor(value: number)
    constructor(value: number | string, octave: number = 4) {

        if (typeof value === 'number') {
            if (value < 0 || value > 8 * 12) {
                throw new TypeError("Note pitch is out of range.");
            }
            this.value = value;
            this.name = this.getName();
            return;
        }
        this.name = value;
        this.value = octave * 12 + resolveEnharmony(value);
    }

    getName(): NoteName {
        return noteNameFromRelativeValue[this.value % 12 as NoteRelativeValues];
    }

    getOctave(): Octave {
        const octave = Math.floor(this.value / 12) as Octave;

        // Ugly fix but western music theory is messed up (and we love it anyway)
        if (this.name.startsWith('B#')) {
            return octave - 1 as Octave;
        }
        if (this.name.startsWith('Cb')) {
            return octave + 1 as Octave;
        }

        return octave;
    }

    isSamePitch(other: Pitch) {
        return this.value === other.value;
    }

    isSameRelativePitch(other: Pitch) {
        return this.value % 12 === other.value % 12;
    }

    toString() {
        return `${this.name}${this.getOctave()}`;
    }
}

