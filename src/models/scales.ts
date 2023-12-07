import itvs, { getIntervalNote } from "./intervals";
import Pitch from "./pitch";
import { Interval } from "./types";

type HeptatonicScale = readonly [
    Interval<1>,
    Interval<2>,
    Interval<3>,
    Interval<4>,
    Interval<5>,
    Interval<6>,
    Interval<7>,
];
type Scale = HeptatonicScale;

export const getNotesOfScale = (scale: Scale, root: Pitch): Pitch[] => {
    return scale.map((i: Interval) => {
        return getIntervalNote(root, i);
    })
}

const scales = {
    major: [
        itvs[1].perfect,
        itvs[2].major,
        itvs[3].major,
        itvs[4].perfect,
        itvs[5].perfect,
        itvs[6].major,
        itvs[7].major,
    ],
    minor: [
        itvs[1].perfect,
        itvs[2].major,
        itvs[3].minor,
        itvs[4].perfect,
        itvs[5].perfect,
        itvs[6].minor,
        itvs[7].minor,
    ],
    harmonicMinor: [
        itvs[1].perfect,
        itvs[2].major,
        itvs[3].minor,
        itvs[4].perfect,
        itvs[5].perfect,
        itvs[6].minor,
        itvs[7].major,
    ],
    melodicMinor: [
        itvs[1].perfect,
        itvs[2].major,
        itvs[3].minor,
        itvs[4].perfect,
        itvs[5].perfect,
        itvs[6].major,
        itvs[7].major,
    ],
} as const;

export default scales;
