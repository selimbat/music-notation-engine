import { NoteName } from "./definitions";
import intervals, { getIntervalNote } from "./intervals";
import Pitch from "./pitch";
import { Interval } from "./types";

type Triad = readonly [Interval<1>, Interval<2 | 3 | 4>, Interval<5>];
type Tetrad = readonly [Interval<1>, Interval<2 | 3 | 4>, Interval<5>, Interval<7>];
type Chord = Triad | Tetrad;

export const getNotesOfChord = (chord: Chord, root: Pitch): Pitch[] => {
    return chord.map((i: Interval) => {
        return getIntervalNote(root, i);
    })
}

type TriadChordQuality = '' | '-' | 'aug' | 'dim' | 'sus2' | 'sus4';
type SeventhChordQuality = '7' | 'maj7' | '-7' | '-maj7' | 'ø' | 'dim7' | '7sus2' | '7sus4';
type ChordQuality = TriadChordQuality | SeventhChordQuality
type ChordNotation = `${NoteName}${ChordQuality}`;



const chords = {
    triad: {
        major: [intervals[1].perfect, intervals[3].major, intervals[5].perfect],
        minor: [intervals[1].perfect, intervals[3].minor, intervals[5].perfect],
        diminished: [intervals[1].perfect, intervals[3].minor, intervals[5].diminished],
        augmented: [intervals[1].perfect, intervals[3].major, intervals[5].augmented],
        sus2: [intervals[1].perfect, intervals[2].major, intervals[5].perfect],
        sus4: [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect],
    },
    tetrads: {
        maj7: [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].major],
        dom7: [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].minor],
        minor7: [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].minor],
        minorMaj7: [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].major],
        halfDim: [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].minor],
        diminished: [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].diminished],
        sus2: [intervals[1].perfect, intervals[2].major, intervals[5].perfect, intervals[7].minor],
        sus4: [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect, intervals[7].minor],
    },
} as const;

export default chords;
