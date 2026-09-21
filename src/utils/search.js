/**
 * Shared text-search helpers for the Levels and Stations filters.
 *
 * `normalize` lowercases, strips diacritics and drops any non-alphanumeric
 * characters so accents, casing, spaces and punctuation are all ignored.
 *
 * `fuzzyMatch` treats the query as a subsequence of the target, so typing
 * "deci" still matches "Dead City 1".
 */

export function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function fuzzyMatch(query, target) {
  const q = normalize(query)
  if (!q) return true
  const t = normalize(target)
  let i = 0
  for (let c = 0; c < t.length && i < q.length; c += 1) {
    if (t[c] === q[i]) i += 1
  }
  return i === q.length
}
