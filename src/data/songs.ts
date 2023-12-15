import { NoteName } from "../models/definitions";
import { ChordNotation } from "../models/types";
import { RepeatChord } from "../models/walkers/abstractWalkingBass";

type Song = [NoteName, readonly (ChordNotation | RepeatChord)[]]

export const changesBySong: Record<string, Song> = {
    'All of Me': ['C', [
        'Cmaj7', '%', 'E7', '%',
        'A7', '%', 'D-', '%',
        'E7', '%', 'A-', '%',
        'D7', '%', 'D-7', 'G7',

        'Cmaj7', '%', 'E7', '%',
        'A7', '%', 'D-', '%',
        'F', 'F-', 'Cmaj7', 'A7',
        'D-7', 'G7', 'C6', '%',
    ]],
    'Blue bossa': ['C', [
        'C-7', '%', 'F-7', '%',
        'Dø', 'G7', 'C-7', '%',
        'Eb-7', 'Ab7', 'Dbmaj7', '%',
        'Dø', 'G7', 'C-7', 'G7',
    ]],
    'Beautiful Love': ['D', [
        'Eø', 'A7', 'D-', '%',
        'G-7', 'C7', 'Fmaj7', 'Eø',
        'D-', 'G-7', 'Bb7', 'Eø',
        'D-', 'G7', 'Eø', 'A7',

        'Eø', 'A7', 'D-', '%',
        'G-7', 'C7', 'Fmaj7', 'Eø',
        'D-', 'G-7', 'Bb7', 'Eø',
        'D-', 'Bb7', 'D-', '%',
    ]],
    '12-bar Blues': ['Bb', [
        'Bb7', '%', '%', '%',
        'Eb7', '%', 'Bb7', '%',
        'F7', 'Eb7', 'Bb7', '%',
    ]],
    'In a Mellow Tone': ['Ab', [
        'Bb7', 'Eb7', 'Abmaj7', '%',
        'Eb-7', 'Ab7', 'Dbmaj7', '%',
        'Db', 'Ddim7', 'Abmaj7', 'F7',
        'Bb7', '%', 'Eb7', 'F7',

        'Bb7', 'Eb7', 'Abmaj7', '%',
        'Eb-7', 'Ab7', 'Dbmaj7', 'Db7',
        'Db7', 'Ddim7', 'Abmaj7', 'F7',
        'Bb7', 'Eb7', 'Ab', 'Gb7',
    ]],

    // 'Grille de test': [
    //     'Eaug', 'F-7', 'Bb7', 'Eb-7',
    //     'Fb-', '%', 'A', 'D'
    // ],
};
