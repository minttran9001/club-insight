const PRIMARY = [
  " ",
  "-",
  ",",
  ".",
  "&",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "ă",
  "â",
  "b",
  "c",
  "d",
  "đ",
  "e",
  "ê",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "ô",
  "ơ",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "ư",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const PRIMARY_INDEX = new Map(PRIMARY.map((letter, index) => [letter, index + 1]));

const TONE_WEIGHT = new Map<number, number>([
  [0x0300, 1],
  [0x0309, 2],
  [0x0303, 3],
  [0x0301, 4],
  [0x0323, 5],
]);

const MARK = /^\p{M}$/u;

export type SortKeyMode = "full" | "base";

/** Sort key whose UTF-16 order matches `localeCompare` for Vietnamese. */
export function viSortKey(value: string, mode: SortKeyMode): string {
  const chars = [...value.normalize("NFD")];
  const primary: number[] = [];
  const secondary: number[] = [];
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    if (MARK.test(char)) {
      primary.push(primaryWeight(char, []));
      secondary.push(0);
      continue;
    }
    const upper = char.toLowerCase() !== char;
    const base = char.toLowerCase();
    const marks: string[] = [];
    while (index + 1 < chars.length && MARK.test(chars[index + 1])) {
      index += 1;
      marks.push(chars[index]);
    }
    primary.push(primaryWeight(base, marks));
    secondary.push(toneWeight(marks) * 2 + (upper ? 1 : 0));
  }
  if (mode === "base") return String.fromCharCode(...primary);
  return String.fromCharCode(...primary, 0, ...secondary);
}

function primaryWeight(base: string, marks: string[]): number {
  const codes = new Set(marks.map((mark) => mark.codePointAt(0) ?? 0));
  let letter = base;
  if (base === "a" && codes.has(0x0306)) letter = "ă";
  else if (base === "a" && codes.has(0x0302)) letter = "â";
  else if (base === "e" && codes.has(0x0302)) letter = "ê";
  else if (base === "o" && codes.has(0x031b)) letter = "ơ";
  else if (base === "o" && codes.has(0x0302)) letter = "ô";
  else if (base === "u" && codes.has(0x031b)) letter = "ư";
  const known = PRIMARY_INDEX.get(letter);
  if (known !== undefined) return known;
  return 1000 + (letter.codePointAt(0) ?? 0);
}

function toneWeight(marks: string[]): number {
  for (const mark of marks) {
    const weight = TONE_WEIGHT.get(mark.codePointAt(0) ?? 0);
    if (weight !== undefined) return weight;
  }
  return 0;
}
