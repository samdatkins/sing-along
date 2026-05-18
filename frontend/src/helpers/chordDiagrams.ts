import guitarData from "@tombatossals/chords-db/lib/guitar.json";

interface ChordsDbPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi?: number[];
}

interface ChordsDbChord {
  key: string;
  suffix: string;
  positions: ChordsDbPosition[];
}

export interface VexchordData {
  chord: (number | string)[][];
  position: number;
  barres: { fromString: number; toString: number; fret: number }[];
}

const SHARP_TO_FLAT: Record<string, string> = {
  "C#": "C#",
  "D#": "Eb",
  "E#": "F",
  "F#": "F#",
  "G#": "Ab",
  "A#": "Bb",
  "B#": "C",
};

const CHORDS_DB_KEY_MAP: Record<string, string> = {
  c: "C",
  "c#": "Csharp",
  db: "Csharp",
  d: "D",
  "d#": "Eb",
  eb: "Eb",
  e: "E",
  f: "F",
  "f#": "Fsharp",
  gb: "Fsharp",
  g: "G",
  "g#": "Ab",
  ab: "Ab",
  a: "A",
  "a#": "Bb",
  bb: "Bb",
  b: "B",
};

const SUFFIX_MAP: Record<string, string> = {
  "": "major",
  m: "minor",
  min: "minor",
  maj: "major",
  dim: "dim",
  aug: "aug",
  "7": "7",
  maj7: "maj7",
  m7: "m7",
  min7: "m7",
  dim7: "dim7",
  aug7: "aug7",
  sus2: "sus2",
  sus4: "sus4",
  "7sus4": "7sus4",
  "6": "6",
  m6: "m6",
  "9": "9",
  m9: "m9",
  maj9: "maj9",
  add9: "add9",
  "11": "11",
  m11: "m11",
  maj11: "maj11",
  "13": "13",
  maj13: "maj13",
  "69": "69",
  m69: "m69",
  "7b5": "7b5",
  "9b5": "9b5",
  aug9: "aug9",
  "7b9": "7b9",
  "7#9": "7#9",
  "9#11": "9#11",
  mmaj7: "mmaj7",
  m7b5: "m7b5",
  maj7b5: "maj7b5",
  "maj7#5": "maj7#5",
  mmaj9: "mmaj9",
  "mmaj7b5": "mmaj7b5",
  mmaj11: "mmaj11",
  madd9: "madd9",
  "5": "alt",
  alt: "alt",
};

function parseChordName(chordName: string): { root: string; suffix: string } | null {
  const trimmed = chordName.trim();
  if (!trimmed) return null;

  const rootMatch = trimmed.match(/^([A-Ga-g])([#b]?)/);
  if (!rootMatch) return null;

  const rootNote = rootMatch[1].toUpperCase();
  const accidental = rootMatch[2];
  const root = rootNote + accidental;
  const suffix = trimmed.slice(rootMatch[0].length);

  return { root, suffix };
}

function convertToVexchords(position: ChordsDbPosition): VexchordData {
  const chord: (number | string)[][] = [];
  const { frets, fingers, baseFret, barres } = position;

  for (let i = 0; i < frets.length; i++) {
    const stringNum = 6 - i; // index 0 = string 6 (low E), index 5 = string 1 (high E)
    const fretVal = frets[i];
    const fingerVal = fingers[i];

    if (fretVal === -1) {
      chord.push([stringNum, "x"]);
    } else if (fretVal === 0) {
      chord.push([stringNum, 0]);
    } else {
      if (fingerVal > 0) {
        chord.push([stringNum, fretVal, String(fingerVal)]);
      } else {
        chord.push([stringNum, fretVal]);
      }
    }
  }

  const vexBarres = (barres || []).map((barreFret: number) => {
    const stringsAtFret = frets
      .map((f, i) => (f === barreFret ? 6 - i : -1))
      .filter((s) => s !== -1);
    return {
      fromString: Math.max(...stringsAtFret),
      toString: Math.min(...stringsAtFret),
      fret: barreFret,
    };
  });

  return {
    chord,
    position: baseFret === 1 ? 0 : baseFret,
    barres: vexBarres,
  };
}

export function getChordDiagram(chordName: string): VexchordData | null {
  const parsed = parseChordName(chordName);
  if (!parsed) return null;

  let { root, suffix } = parsed;

  if (root.includes("#") && SHARP_TO_FLAT[root]) {
    root = SHARP_TO_FLAT[root];
  }

  const dbKey = CHORDS_DB_KEY_MAP[root.toLowerCase()];
  if (!dbKey) return null;

  const dbSuffix = SUFFIX_MAP[suffix.toLowerCase()] ?? suffix.toLowerCase();

  const chords = (guitarData.chords as Record<string, ChordsDbChord[]>)[dbKey];
  if (!chords) return null;

  const chordEntry = chords.find(
    (c) => c.suffix.toLowerCase() === dbSuffix.toLowerCase()
  );
  if (!chordEntry || chordEntry.positions.length === 0) return null;

  return convertToVexchords(chordEntry.positions[0]);
}

export function extractChordsFromTab(tab: string | false | undefined): string[] {
  if (!tab) return [];

  const chordRegex = /\[ch\](.*?)\[\/ch\]/g;
  const seen = new Set<string>();
  const chords: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = chordRegex.exec(tab)) !== null) {
    const chord = match[1].trim();
    const key = chord.toLowerCase();
    if (chord && !seen.has(key)) {
      seen.add(key);
      chords.push(chord);
    }
  }

  return chords;
}
