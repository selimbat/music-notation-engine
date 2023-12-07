import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import chords from "./models/chords";
import scales, { getNotesOfScale } from "./models/scales";

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const chordTones = getNotesOfChord(chords.triad.minor, new Pitch(r));
    console.log(`Minor chord of ${r} is ${chordTones.map(t => t.name).join(', ')}`);
});

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const scaleTones = getNotesOfScale(scales.major, new Pitch(r));
    console.log(`Major scale of ${r} is ${scaleTones.map(t => t.name).join(', ')}`);
})
