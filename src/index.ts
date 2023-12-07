import { getNotesOfChord } from "./models/chords";
import Pitch from "./models/pitch";
import chords from "./models/chords";

['C#', 'B', 'Cb', 'F#', 'Gb', 'E', 'Fb', 'A#'].forEach(r => {
    const chordTones = getNotesOfChord(chords.triad.minor, new Pitch(r));
    console.log(`Minor chord of ${r} is ${chordTones.map(t => t.name).join(', ')}`);
})
