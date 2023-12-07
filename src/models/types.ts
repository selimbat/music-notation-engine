export type IntervalTypes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;

export type Interval<T extends IntervalTypes = IntervalTypes> = {
    intervalType: T,
    quality: T extends 1 | 4 | 5 | 8 | 11
    ? 'perfect' | 'augmented' | 'diminished'
    : 'major' | 'minor' | 'augmented' | 'diminished',
}
