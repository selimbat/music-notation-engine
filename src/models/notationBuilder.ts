import { BareNoteName, NoteName, orderedNotes } from "./definitions";
import Note, { NoteDuration } from "./note";

type MeterLower = 1 | 2 | 4 | 8;
type Meter = `${number}/${MeterLower}`
type Key = `${NoteName}${'m' | ''}`;
type Clef = 'bass' | 'treble';
export type Accidentals = Record<BareNoteName, '#' | 'b' | ''>;

export const ABCMusicAccidentals: Record<'#' | 'b', '^' | '_'> = {
    '#': '^',
    'b': '_',
}

export default class NotationBuilder {
    meter: Meter;
    key: Key;
    tempo?: number;
    clef: Clef;
    notes: Note[];
    barLength: number;
    // @ts-expect-error This property is defined through a method called in the constructor
    accidentals: Accidentals;

    constructor(meter: Meter = '4/4', key: Key = 'C', clef: Clef = 'treble') {
        this.meter = meter;

        const [upper, lower] = meter.split('/');
        this.barLength = parseInt(upper) / parseFloat(lower);

        this.key = key;
        this.clef = clef;
        this.notes = [];
        this.resetAccidentals();
    }

    public addNotes(...note: Note[]) {
        this.notes.push(...note);
    }

    private setAccidental(note: Note) {
        if (note.pitch === null) {
            return;
        }
        const noteName = note.pitch.name.replace(/[#b]/g, '') as BareNoteName;
        const accidental = note.pitch.name.split('').find(c => ['#', 'b'].includes(c)) as '#' | 'b' | undefined;
        this.accidentals[noteName] = accidental ?? '';
    }

    private resetAccidentals() {
        // TODO: Account for key signature
        this.accidentals = orderedNotes.reduce(
            (agg, curr) => Object.assign(agg, { [curr]: '' }),
            {} as Accidentals
        );
    }

    public toString() {
        let result = '';

        let currentBarLength = 0;

        this.notes.forEach(note => {
            if (currentBarLength === this.barLength) {
                // Current bar is full.
                result += ' | ';
                currentBarLength = 0;
                this.resetAccidentals();
            }

            if (currentBarLength + note.duration <= this.barLength) {
                // Still room in current bar
                result += note.toABCMusicString(this.accidentals);
                currentBarLength += note.duration;

                if (note.pitch !== null) {
                    this.setAccidental(note);
                }
                return;
            }
            // Note to add overflows the current bar
            const remainingInBar = this.barLength - currentBarLength as NoteDuration;
            const noteToFullBar = new Note(remainingInBar, note.pitch);
            const noteNextBar = new Note(note.duration - remainingInBar as NoteDuration, note.pitch);

            result += `(${noteToFullBar.toABCMusicString(this.accidentals)
                } | ${noteNextBar.toABCMusicString(this.accidentals)
                })`

            currentBarLength = Math.min(this.barLength, noteNextBar.duration);
            this.resetAccidentals();
            this.setAccidental(note);
        });

        return result;
    }

}