import intervals from "../intervals";
import { ChordNotation, Interval } from "../types";

export type RepeatChord = '%';

export default abstract class AbstractWalkingBassGenerator {
    protected chordChanges: readonly (ChordNotation | RepeatChord)[];
    protected transpositionInterval: Interval;

    constructor(changes: readonly (ChordNotation | RepeatChord)[], transposition: Interval = intervals[1].perfect) {
        this.chordChanges = changes;
        this.transpositionInterval = transposition;
    }

    public abstract walk(): string;
}