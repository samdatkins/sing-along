const sharpToneArr = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const flatToneArr = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

function getToneDetails(chordString) {
  const chord =
    chordString.substring(0, 1).toUpperCase() + chordString.substring(1, 2);
  let hasAccidental = true;
  let chordIndex = sharpToneArr.indexOf(chord);

  if (chordIndex === -1) {
    chordIndex = flatToneArr.indexOf(chord);
  }
  if (chordIndex === -1) {
    hasAccidental = false;
  }
  const shortChord = chord.substring(0, 1);
  if (chordIndex === -1) {
    chordIndex = flatToneArr.indexOf(shortChord);
  }
  if (chordIndex === -1) {
    chordIndex = sharpToneArr.indexOf(shortChord);
  }
  return [chordIndex, hasAccidental];
}

function transposer(chords, steps, usesSharps) {
  const splitChordsArray = chords.split("[/ch]").reduce((acc, cur) => {
    return [...acc, ...cur.split("[ch]")];
  }, []);
  return splitChordsArray
    .map((elem) => {
      if (elem.replaceAll(" ", "") === "") {
        return elem;
      } else {
        const [chordIndex, hasAccidental] = getToneDetails(elem);
        if (chordIndex === -1) {
          return elem;
        } else {
          const absoluteSteps = steps + 12;
          const startRestOfChord = hasAccidental ? 2 : 1;
          const sharpToneArrayReturn =
            sharpToneArr[(chordIndex + absoluteSteps) % 12] +
            elem.substring(startRestOfChord, elem.length);
          const flatToneArrayReturn =
            flatToneArr[(chordIndex + absoluteSteps) % 12] +
            elem.substring(startRestOfChord, elem.length);
          const toneArrayToReturn = usesSharps
            ? sharpToneArrayReturn
            : flatToneArrayReturn;
          return toneArrayToReturn;
        }
      }
    })
    .join("");
}
export default transposer;
