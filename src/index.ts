const orderedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

type BareNoteName = typeof orderedNotes[number];
type NoteName = `${BareNoteName}${'#' | 'b' | ''}`

const noteRelativeValues = {
    "B#": 0,
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "E#": 5,
    "Fb": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
    "Cb": 11,
} as const

type NoteRelativeValues = typeof noteRelativeValues[NoteName]

const noteNameFromRelativeValue = Object.entries(noteRelativeValues).reduce(
    (agg, [k, v]) => Object.assign(agg, { [v]: k }), {} as Record<NoteRelativeValues, NoteName>
)

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

class Pitch {
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

    getOctave(): number {
        return Math.floor(this.value / 12);
    }

    isSamePitch(other: Pitch) {
        return this.value === other.value;
    }

    isSameRelativePitch(other: Pitch) {
        return this.value % 12 === other.value % 12;
    }
}

const findEnharmony = (value: NoteRelativeValues, targetBareNoteName: BareNoteName): `${NoteName}${'' | '#' | 'b'}` => {
    const targetPitch = new Pitch(targetBareNoteName, 0);

    const distance = Math.min(
        Math.abs(targetPitch.value - value),
        Math.abs((targetPitch.value + 6) % 12 - (value + 6) % 12)
    );

    const currentPitch = new Pitch(value);
    if (targetPitch.isSameRelativePitch(currentPitch)) {
        return targetBareNoteName;
    }

    const shouldSharpen = (value - targetPitch.value) > 6
        ? Math.sign(value - targetPitch.value) * Math.sign(
            (value - targetPitch.value) * ((value + 6) % 12 - (targetPitch.value + 6) % 12)
        )
        : Math.sign(value - targetPitch.value)

    //  const shouldSharpen = Math.sign(value - targetPitch.value) * Math.sign(
    //    (value - targetPitch.value) * ((value + 6) % 12 - (targetPitch.value + 6) % 12)
    //  );

    if (shouldSharpen === 1) {
        return targetBareNoteName.padEnd(distance + 1, '#') as `${NoteName}${'' | '#' | 'b'}`;
    }
    return targetBareNoteName.padEnd(distance + 1, 'b') as `${NoteName}${'' | '#' | 'b'}`;
}

type IntervalTypes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;

type Interval<T extends IntervalTypes = IntervalTypes> = {
    intervalType: T,
    quality: T extends 1 | 4 | 5 | 8 | 11
    ? 'perfect' | 'augmented' | 'diminished'
    : 'major' | 'minor' | 'augmented' | 'diminished',
}

const getSemitoneForInterval = (i: IntervalTypes): number => {
    if (i > 8) {
        return 12 + getSemitoneForInterval(i - 7 as IntervalTypes);
    }
    const st = (i - 2) * 2 + 2;
    const reduction = Math.floor(i / 4);
    return st - reduction;
}

function intervalCanBePerfect(interval: Interval): interval is Interval<1 | 4 | 5 | 8 | 11> {
    return [1, 4, 5, 8, 11].includes(interval.intervalType);
}

const getIntervalNote = (root: Pitch, interval: Interval, direction: 'up' | 'down' = 'up'): Pitch => {
    const semitones = getSemitoneForInterval(interval.intervalType);

    const rootBareNoteName = root.name.replace(/[#b]/g, '') as BareNoteName;
    const rootIndex = orderedNotes.indexOf(rootBareNoteName);
    if (rootIndex === -1) {
        throw new Error(`Could not find bare note name for ${root.name}`);
    }
    const dir: -1 | 1 = direction === 'up' ? 1 : -1;

    const targetNoteIndex = ((rootIndex + dir * (interval.intervalType - 1) % 7) + 7) % 7;
    const targetNote = orderedNotes[targetNoteIndex];

    if (['major', 'perfect'].includes(interval.quality)) {
        return new Pitch(
            findEnharmony(
                (((root.value + dir * semitones) % 12) + 12) % 12 as NoteRelativeValues,
                targetNote,
            ),
            root.getOctave(),
        );
    }
    let pitchDelta = 0;
    if (intervalCanBePerfect(interval)) {
        pitchDelta = interval.quality === 'augmented' ? 1 : -1;
    } else {
        switch (interval.quality) {
            case 'minor':
                pitchDelta = -1;
                break;
            case 'augmented':
                pitchDelta = 1;
                break;
            case 'diminished':
                pitchDelta = -2;
                break;
        }
    }

    return new Pitch(
        findEnharmony(
            (((root.value + dir * (semitones + pitchDelta)) % 12) + 12) % 12 as NoteRelativeValues,
            targetNote
        ),
        root.getOctave(),
    );
}

type Triad = [Interval<1>, Interval<3>, Interval<5>];
type Tetrad = [Interval<1>, Interval<3>, Interval<5>, Interval<7>];

type Intervals = {
    [K in IntervalTypes]: {
        [q in Interval<K>['quality']]: Interval<K>;
    };
}

const intervals: Intervals = {
    1: {
        diminished: { intervalType: 1, quality: 'diminished' },
        perfect: { intervalType: 1, quality: 'perfect' },
        augmented: { intervalType: 1, quality: 'augmented' },
    },
    2: {
        diminished: { intervalType: 2, quality: 'diminished' },
        minor: { intervalType: 2, quality: 'minor' },
        major: { intervalType: 2, quality: 'major' },
        augmented: { intervalType: 2, quality: 'augmented' },
    },
    3: {
        diminished: { intervalType: 3, quality: 'diminished' },
        minor: { intervalType: 3, quality: 'minor' },
        major: { intervalType: 3, quality: 'major' },
        augmented: { intervalType: 3, quality: 'augmented' },
    },
    4: {
        diminished: { intervalType: 4, quality: 'diminished' },
        perfect: { intervalType: 4, quality: 'perfect' },
        augmented: { intervalType: 4, quality: 'augmented' },
    },
    5: {
        diminished: { intervalType: 5, quality: 'diminished' },
        perfect: { intervalType: 5, quality: 'perfect' },
        augmented: { intervalType: 5, quality: 'augmented' },
    },
    6: {
        diminished: { intervalType: 6, quality: 'diminished' },
        minor: { intervalType: 6, quality: 'minor' },
        major: { intervalType: 6, quality: 'major' },
        augmented: { intervalType: 6, quality: 'augmented' },
    },
    7: {
        diminished: { intervalType: 7, quality: 'diminished' },
        minor: { intervalType: 7, quality: 'minor' },
        major: { intervalType: 7, quality: 'major' },
        augmented: { intervalType: 7, quality: 'augmented' },
    },
    8: {
        diminished: { intervalType: 8, quality: 'diminished' },
        perfect: { intervalType: 8, quality: 'perfect' },
        augmented: { intervalType: 8, quality: 'augmented' },
    },
    9: {
        diminished: { intervalType: 9, quality: 'diminished' },
        minor: { intervalType: 9, quality: 'minor' },
        major: { intervalType: 9, quality: 'major' },
        augmented: { intervalType: 9, quality: 'augmented' },
    },
    11: {
        diminished: { intervalType: 11, quality: 'diminished' },
        perfect: { intervalType: 11, quality: 'perfect' },
        augmented: { intervalType: 11, quality: 'augmented' },
    },
    13: {
        diminished: { intervalType: 13, quality: 'diminished' },
        minor: { intervalType: 13, quality: 'minor' },
        major: { intervalType: 13, quality: 'major' },
        augmented: { intervalType: 13, quality: 'augmented' },
    },

};

const majorTriad: Triad = [intervals[1].perfect, intervals[3].major, intervals[5].perfect];
const minorTriad: Triad = [intervals[1].perfect, intervals[3].minor, intervals[5].perfect];
const dimTriad: Triad = [intervals[1].perfect, intervals[3].minor, intervals[5].diminished];
const augTriad: Triad = [intervals[1].perfect, intervals[3].major, intervals[5].augmented];

const getNotesOfChord = (chord: Triad | Tetrad, root: Pitch): Pitch[] => {
    return chord.map((i) => {
        return getIntervalNote(root, i);
    })
}

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const chordTones = getNotesOfChord(minorTriad, new Pitch(r));
    console.log(`Minor chord of ${r} is ${chordTones.map(t => t.name).join(', ')}`);
})
