const CHORD_DIAGRAMS_KEY = "sing-along-show-chord-diagrams";

export function getShowChordDiagrams(): boolean {
  return localStorage.getItem(CHORD_DIAGRAMS_KEY) === "true";
}

export function setShowChordDiagrams(show: boolean): void {
  localStorage.setItem(CHORD_DIAGRAMS_KEY, show ? "true" : "false");
}
