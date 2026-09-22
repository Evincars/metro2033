/**
 * Pulls `![alt](src)` images (and any following `_caption_` line) out of a
 * markdown string, returning the cleaned body plus a gallery list. Used to move
 * inline article images into a dedicated clickable gallery.
 */
function stripLinks(text) {
  // [text](url) -> text, tolerating one level of parens in the url
  return text.replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, '$1').trim()
}

export function extractGallery(md) {
  const lines = (md || '').split('\n')
  const images = []
  const kept = []
  for (let i = 0; i < lines.length; i++) {
    const m = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(lines[i].trim())
    if (!m) {
      kept.push(lines[i])
      continue
    }
    let caption = m[1]
    let j = i + 1
    while (j < lines.length && lines[j].trim() === '') j++
    const capLine = lines[j]?.trim()
    if (capLine && /^_.*_$/.test(capLine)) {
      caption = capLine.replace(/^_/, '').replace(/_$/, '')
      i = j
    }
    images.push({ src: m[2], caption: stripLinks(caption) })
  }
  // Collapse blank runs left behind by removed images.
  const body = dropEmptySections(kept.join('\n')).replace(/\n{3,}/g, '\n\n').trim()
  return { body, images }
}

/** Remove headings whose section became empty after image extraction. */
function dropEmptySections(md) {
  const lines = md.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      if (j >= lines.length || /^#{1,6}\s/.test(lines[j])) continue
    }
    out.push(lines[i])
  }
  return out.join('\n')
}
