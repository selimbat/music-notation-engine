import ChordParser from "./chordParser";
import { NoteName, NoteRelativeValues } from "./definitions";
import intervals, { getIntervalNote, getTonalDistance } from "./intervals";
import Pitch from "./pitch";
import { ChordFormula, ChordNotation, ChordQuality, Interval } from "./types";
import { RepeatChord } from "./walkers/abstractWalkingBass";

export const getNotesOfChord = (chord: ChordFormula, root: Pitch): Pitch[] => {
    return chord.map((i: Interval) => {
        return getIntervalNote(root, i);
    })
}

export const transposeChordNotation = (
    chordNotation: ChordNotation | RepeatChord,
    interval: Interval
): ChordNotation | RepeatChord => {
    if (chordNotation === '%') {
        return chordNotation;
    }
    const [root, _, quality] = ChordParser.parse(chordNotation);
    const rootPitch = new Pitch(root);
    const transposedRootPitch = getIntervalNote(rootPitch, interval);
    return `${transposedRootPitch.name}${quality}` as ChordNotation;
}

const chords: Record<ChordQuality, ChordFormula> = {
    '': [intervals[1].perfect, intervals[3].major, intervals[5].perfect],
    '-': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect],
    'dim': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished],
    'aug': [intervals[1].perfect, intervals[3].major, intervals[5].augmented],
    'sus2': [intervals[1].perfect, intervals[2].major, intervals[5].perfect],
    'sus4': [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect],
    'maj7': [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].major],
    '6': [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[6].major],
    '7': [intervals[1].perfect, intervals[3].major, intervals[5].perfect, intervals[7].minor],
    '-7': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].minor],
    '-maj7': [intervals[1].perfect, intervals[3].minor, intervals[5].perfect, intervals[7].major],
    'ø': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].minor],
    'dim7': [intervals[1].perfect, intervals[3].minor, intervals[5].diminished, intervals[7].diminished],
    '7sus2': [intervals[1].perfect, intervals[2].major, intervals[5].perfect, intervals[7].minor],
    '7sus4': [intervals[1].perfect, intervals[4].perfect, intervals[5].perfect, intervals[7].minor],
} as const;

export default chords;

class Chord {

    private root: NoteName;
    private formula: ChordFormula;

    constructor(notation: ChordNotation) {
        [this.root, this.formula] = ChordParser.parse(notation);
    }
}