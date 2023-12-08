import intervals, { getIntervalNote } from "./intervals";
import Pitch from "./pitch";
import { Chord, ChordQuality, Interval } from "./types";

export const getNotesOfChord = (chord: Chord, root: Pitch): Pitch[] => {
    return chord.map((i: Interval) => {
        return getIntervalNote(root, i);
    })
}

const chords: Record<ChordQuality, Chord> = {
    '': [intervals[1].perfect, intervals[3].major, intervals[5].perfect],
    '-': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect],
    'dim': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished],
    'aug': [intervals[1].perfect, intervals[3].major, intervals[5].augmented],
    'sus2': [intervals[1].perfect, intervals[2].major, intervals[5].perfect],
    'sus4': [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect],
    'maj7': [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].major],
    '7': [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].minor],
    '-7': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].minor],
    '-maj7': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].major],
    'ø': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].minor],
    'dim7': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].diminished],
    '7sus2': [intervals[1].perfect, intervals[2].major, intervals[5].perfect, intervals[7].minor],
    '7sus4': [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect, intervals[7].minor],
} as const;

export default chords;
