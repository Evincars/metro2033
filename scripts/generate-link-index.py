#!/usr/bin/env python3
"""Regenerate src/data/linkIndex.js from content frontmatter.

Run after adding/modifying content files:
  python3 scripts/generate-link-index.py
"""
import os
import re
import json

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'content')
BASE = os.path.abspath(BASE)

def parse_fm(path):
    with open(path, 'r') as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return {}
    meta = {}
    for line in m.group(1).split('\n'):
        idx = line.find(':')
        if idx == -1:
            continue
        key = line[:idx].strip()
        val = line[idx+1:].strip()
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        meta[key] = val
    return meta

SECTIONS = {
    'characters': '/characters',
    'locations': '/locations',
    'factions': '/factions',
    'mutants': '/mutants',
    'equipment': '/equipment',
    'weapons': '/weapons',
    'ammunition': '/ammunition',
    'vehicles': '/vehicles',
    'achievements': '/achievements',
    'endings': '/endings',
    'event-articles': '/events',
    'books': '/books',
    'games': '/games',
}

slug_entries = []
title_entries = []

for section, prefix in SECTIONS.items():
    section_dir = os.path.join(BASE, section)
    if not os.path.isdir(section_dir):
        continue
    for fname in sorted(os.listdir(section_dir)):
        if not fname.endswith('.md'):
            continue
        meta = parse_fm(os.path.join(section_dir, fname))
        fid = meta.get('id', fname[:-3])
        route = f"{prefix}/{fid}"
        title = meta.get('title', fid)
        wiki = meta.get('wiki', '')
        if wiki:
            slug_entries.append([wiki, route])
        if title:
            title_entries.append([title, route])

levels_dir = os.path.join(BASE, 'levels')
for root, dirs, files in os.walk(levels_dir):
    for fname in sorted(files):
        if not fname.endswith('.md'):
            continue
        meta = parse_fm(os.path.join(root, fname))
        fid = meta.get('id', fname[:-3])
        route = f"/levels/{fid}"
        title = meta.get('title', fid)
        wiki = meta.get('wiki', '')
        if wiki:
            slug_entries.append([wiki, route])
        if title:
            title_entries.append([title, route])

output = "// Auto-generated link index — maps wiki slugs and titles to internal routes\n"
output += "// Regenerate with: python3 scripts/generate-link-index.py\n\n"
output += f"export const slugEntries = {json.dumps(slug_entries, ensure_ascii=False)}\n\n"
output += f"export const titleEntries = {json.dumps(title_entries, ensure_ascii=False)}\n"

outpath = os.path.join(os.path.dirname(BASE), 'data', 'linkIndex.js')
with open(outpath, 'w') as f:
    f.write(output)

print(f"linkIndex.js: {len(slug_entries)} slug entries, {len(title_entries)} title entries")
