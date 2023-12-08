import { NoteName } from "./definitions";

export type IntervalTypes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;

export type Interval<T extends IntervalTypes = IntervalTypes> = {
    intervalType: T,
    quality: T extends 1 | 4 | 5 | 8 | 11
    ? 'perfect' | 'augmented' | 'diminished'
    : 'major' | 'minor' | 'augmented' | 'diminished',
}

type Triad = readonly [Interval<1>, Interval<2 | 3 | 4>, Interval<5>];
type Tetrad = readonly [Interval<1>, Interval<2 | 3 | 4>, Interval<5>, Interval<7>];
export type Chord = Triad | Tetrad;

type TriadChordQuality = '' | '-' | 'aug' | 'dim' | 'sus2' | 'sus4';
type SeventhChordQuality = '7' | 'maj7' | '-7' | '-maj7' | 'ø' | 'dim7' | '7sus2' | '7sus4';
export type ChordQuality = TriadChordQuality | SeventhChordQuality


export type ChordNotation = `${NoteName}${ChordQuality}`;
