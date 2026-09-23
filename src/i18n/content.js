import { locale } from './index.js'

/**
 * Merge locale-specific markdown files over the English defaults.
 * Both `enFiles` and `localeFiles` are Vite glob-import result objects
 * (path → raw string). Files are matched by their basename (e.g. `artyom.md`).
 */
export function resolveFiles(enFiles, ruFiles, ukFiles) {
  const loc = locale.value
  if (loc === 'en') return enFiles

  const overlay = loc === 'ru' ? ruFiles : ukFiles
  if (!overlay || !Object.keys(overlay).length) return enFiles

  const byName = {}
  for (const [path, raw] of Object.entries(overlay)) {
    const name = path.split('/').pop()
    byName[name] = raw
  }

  const merged = {}
  for (const [path, raw] of Object.entries(enFiles)) {
    const name = path.split('/').pop()
    merged[path] = byName[name] ?? raw
  }
  return merged
}
