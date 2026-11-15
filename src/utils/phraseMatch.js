// Compares a typed confirmation phrase to the expected one. Spaces at the ends,
// letter case, and accents are ignored so a missing accent does not block anyone.
const normalize = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

export const phraseMatches = (typed, expected) =>
  normalize(typed) === normalize(expected);
