import { BareNoteName, NoteName, NoteRelativeValues, orderedNotes } from "./definitions";
import Pitch from "./pitch";
import { Interval, IntervalTypes } from "./types";


const getTonalDistance = (a: NoteRelativeValues, b: NoteRelativeValues): number => {
    const dist = (b - a + 6) % 12 - 6;
    return dist < -6 ? dist + 12 : dist;
}

const findEnharmony = (value: NoteRelativeValues, targetBareNoteName: BareNoteName): `${NoteName}${'' | '#' | 'b'}` => {
    const targetPitch = new Pitch(targetBareNoteName, 0);

    const currentPitch = new Pitch(value);
    if (targetPitch.isSameRelativePitch(currentPitch)) {
        return targetBareNoteName;
    }

    const dist = getTonalDistance(value, targetPitch.value % 12 as NoteRelativeValues);
    const shouldSharpen = dist < 0;
    const nbSemitones = Math.abs(dist);

    if (shouldSharpen) {
        return targetBareNoteName.padEnd(nbSemitones + 1, '#') as `${NoteName}${'' | '#' | 'b'}`;
    }
    return targetBareNoteName.padEnd(nbSemitones + 1, 'b') as `${NoteName}${'' | '#' | 'b'}`;
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

export const getIntervalNote = (root: Pitch, interval: Interval, direction: 'up' | 'down' = 'up'): Pitch => {
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

export default intervals;