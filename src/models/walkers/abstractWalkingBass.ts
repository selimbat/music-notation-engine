import { transposeChordNotation } from "../chords";
import intervals from "../intervals";
import Pitch from "../pitch";
import { ChordNotation, Interval } from "../types";

export type RepeatChord = '%';

export default abstract class AbstractWalkingBassGenerator {
    protected chordChanges: readonly (ChordNotation | RepeatChord)[];
    protected transpositionInterval: Interval;
    protected maxRange: Pitch;
    protected minRange: Pitch;

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        this.chordChanges = changes.map(ch => transposeChordNotation(ch, transposition));
        this.transpositionInterval = transposition;

        this.maxRange = new Pitch('F', 4);
        this.minRange = new Pitch('E', 2);
    }

    protected isInRange(pitch: Pitch): boolean {
        return pitch.value >= this.minRange.value && pitch.value <= this.maxRange.value;
    }

    public abstract walk(): string;
}