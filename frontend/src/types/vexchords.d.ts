declare module "vexchords" {
  interface ChordBoxParams {
    numStrings?: number;
    numFrets?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    strokeWidth?: number;
    showTuning?: boolean;
    defaultColor?: string;
    bgColor?: string;
    labelColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontWeight?: string;
    labelWeight?: string;
    bridgeColor?: string;
    stringColor?: string;
    fretColor?: string;
    strokeColor?: string;
    textColor?: string;
    stringWidth?: number;
    fretWidth?: number;
  }

  interface ChordData {
    chord: (number | string)[][];
    position?: number;
    barres?: { fromString: number; toString: number; fret: number }[];
    tuning?: string[];
  }

  export class ChordBox {
    constructor(sel: string | HTMLElement, params?: ChordBoxParams);
    draw(chord: ChordData): ChordBox;
  }

  export function draw(
    sel: string | HTMLElement,
    chord: ChordData,
    opts?: ChordBoxParams
  ): ChordBox;

  export const POSITIONS: Record<string, unknown>;
  export const SHAPES: Record<string, unknown>;
  export function build(
    key: string,
    shape: string,
    suffix: string
  ): ChordData;
}
