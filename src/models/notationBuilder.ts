import { BareNoteName, NoteName, orderedNotes } from "./definitions";
import Note, { NoteDuration } from "./note";
import { Octave } from "./types";

type MeterLower = 1 | 2 | 4 | 8;
type Meter = `${number}/${MeterLower}`
type Key = `${NoteName}${'m' | ''}`;
type Clef = 'bass' | 'treble';
export type Accidentals = Record<BareNoteName, '#' | 'b' | ''>;

export const ABCMusicAccidentals: Record<'#' | 'b', '^' | '_'> = {
    '#': '^',
    'b': '_',
}

export const ABCMusicOctaveSymbols: Record<Octave, string> = {
    0: ',,,,',
    1: ',,,',
    2: ',,',
    3: ',',
    4: '',
    5: '\'',
    6: '\'\'',
    7: '\'\'\'',
    8: '\'\'\'\'',
}

export default class NotationBuilder {
    meter: Meter;
    key: Key;
    tempo?: number;
    clef: Clef;
    notes: (Note | Note[])[];
    barLength: number;
    nbBarsPerLine: number;
    // @ts-expect-error This property is defined through a method called in the constructor
    accidentals: Accidentals;

    constructor(meter: Meter = '4/4', key: Key = 'C', clef: Clef = 'treble') {
        this.meter = meter;

        const [upper, lower] = meter.split('/');
        this.barLength = parseInt(upper) / parseFloat(lower);
        this.nbBarsPerLine = 4;

        this.key = key;
        this.clef = clef;
        this.notes = [];
        this.resetAccidentals();
    }

    public addNotes(...note: (Note | Note[])[]) {
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
        let result = 'L: 1/4\n';

        if (this.clef === 'bass') {
            result += 'V: tr clef=bass\n'
        }

        let currentBarLength = 0;
        let nbBuiltBars = 0;

        this.notes.forEach(note => {
            if (currentBarLength === this.barLength) {
                // Current bar is full.
                result += ' | ';
                if (nbBuiltBars % this.nbBarsPerLine === this.nbBarsPerLine - 1) {
                    result += '\n';
                }
                nbBuiltBars += 1;

                currentBarLength = 0;
                this.resetAccidentals();
            }

            if (Array.isArray(note)) {
                if (new Set(note.map(n => n.duration)).size !== 1) {
                    throw Error(`Stacked notes have different durations : ${note.map(n => n.toString()).join('-')}.`);
                }
            }
            const toAdd = Array.isArray(note)
                ? `"${note.find(n => n.accompaniment)?.accompaniment ?? ''}"[${note.map(n => {
                    n.setAccompaniment(undefined);
                    return n.toABCMusicString(this.accidentals);
                }).join('')}]`
                : note.toABCMusicString(this.accidentals);
            const duration = Array.isArray(note)
                ? note[0].duration
                : note.duration;

            if (currentBarLength + duration <= this.barLength) {
                // Still room in current bar
                result += toAdd;
                currentBarLength += duration;

                if (Array.isArray(note)) {
                    note.forEach(n => {
                        this.setAccidental(n);
                    })
                } else if (note.pitch !== null) {
                    this.setAccidental(note);
                }
                return;
            }
            // Note to add overflows the current bar
            const remainingInBar = this.barLength - currentBarLength as NoteDuration;
            const toAddToFullBar = Array.isArray(note)
                ? `"${note.find(n => n.accompaniment)?.accompaniment ?? ''}"[${note
                    .map(n => new Note(remainingInBar, n.pitch)
                        .toABCMusicString(this.accidentals))
                    .join('')}]`
                : new Note(remainingInBar, note.pitch).toABCMusicString(this.accidentals);
            const toAddNextBar = Array.isArray(note)
                ? `[${note
                    .map(n => new Note(duration - remainingInBar as NoteDuration, n.pitch)
                        .toABCMusicString(this.accidentals))
                    .join('')}]`
                : new Note(duration - remainingInBar as NoteDuration, note.pitch).toABCMusicString(this.accidentals);

            result += '(';
            result += toAddToFullBar;
            result += ' | ';

            if (nbBuiltBars % this.nbBarsPerLine === this.nbBarsPerLine - 1) {
                result += '\n';
            }
            nbBuiltBars += 1;

            result += toAddNextBar;
            result += ')';

            currentBarLength = Math.min(this.barLength, duration - remainingInBar);
            this.resetAccidentals();
            if (Array.isArray(note)) {
                note.forEach(n => {
                    this.setAccidental(n);
                })
            } else if (note.pitch !== null) {
                this.setAccidental(note);
            }
        });

        return result;
    }

}