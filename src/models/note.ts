import { BareNoteName } from "./definitions";
import { ABCMusicAccidentals, ABCMusicOctaveSymbols, Accidentals } from "./notationBuilder";
import Pitch from "./pitch";

type UndottedNoteDuration = 0.125 | 0.25 | 0.5 | 1 | 2 | 4;
// Doesn't allow dotting the smallest duration because otherwise
// we would need to introduce a smaller subdivision.
type DottedNoteDuration = 0.375 | 0.75 | 1.5 | 3 | 6;
export type NoteDuration = UndottedNoteDuration | DottedNoteDuration;

export default class Note {
    pitch: Pitch | null;
    duration: NoteDuration;

    constructor(duration: NoteDuration, silence: null);
    constructor(duration: NoteDuration, pitch: Pitch | null);
    constructor(duration: NoteDuration, note: string, octave: number);
    constructor(duration: NoteDuration, pitchOrNote: Pitch | string | null, octave?: number) {
        if (pitchOrNote === null) {
            this.pitch = null;
        } else if (typeof pitchOrNote === 'string') {
            this.pitch = new Pitch(pitchOrNote, octave);
        } else {
            this.pitch = pitchOrNote;
        }
        this.duration = duration;
    }

    public toString() {
        return `${this.pitch?.name ?? 'z'}-${this.duration}`;
    }

    public toABCMusicString(accidentals: Accidentals, defaultNoteLength = 0.25) {
        const noteDuration = this.duration / defaultNoteLength;
        const noteDurationStr = noteDuration === 1 ? '' : noteDuration.toString();
        if (this.pitch === null) {
            // the note is a silence
            return `z${noteDurationStr}`;
        }
        const noteName = this.pitch.name.replace(/[#b]/g, '') as BareNoteName;
        const accidental = this.pitch.name.split('').find(c => ['#', 'b'].includes(c));
        const currentAccidental = accidentals[noteName];

        const result = `${noteName}${ABCMusicOctaveSymbols[this.pitch.getOctave()]}${noteDurationStr}`;
        if (currentAccidental === '') {
            if (accidental) {
                return `${ABCMusicAccidentals[accidental as '#' | 'b']}${result}`
            }
            return result;
        }
        if (currentAccidental !== accidental) {
            return `${accidental === undefined ? '=' : ABCMusicAccidentals[accidental as '#' | 'b']}${result}`;
        }
        return result;
    }
}