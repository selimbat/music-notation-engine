export const orderedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export type BareNoteName = typeof orderedNotes[number];
export type NoteName = `${BareNoteName}${'#' | 'b' | ''}`

export const noteRelativeValues = {
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

export type NoteRelativeValues = typeof noteRelativeValues[NoteName]

export const noteNameFromRelativeValue = Object.entries(noteRelativeValues).reduce(
    (agg, [k, v]) => Object.assign(agg, { [v]: k }), {} as Record<NoteRelativeValues, NoteName>
)
