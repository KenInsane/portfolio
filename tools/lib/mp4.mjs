/**
 * Reads pixel dimensions out of an MP4 without ffmpeg.
 *
 * sharp cannot open video and there is no ffmpeg on this machine, but the page
 * needs each clip's aspect ratio up front — declaring it is what stops the grid
 * from reflowing when metadata arrives. The numbers live in the `tkhd` box, so
 * walking the container is enough.
 *
 * MP4 is a tree of boxes: [uint32 size][4-char type][payload]. Only the
 * containers on the path to tkhd need to be descended into.
 */
import { readFileSync } from 'node:fs'

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'edts'])

/** Width/height are 16.16 fixed-point in tkhd. */
function readTkhd(buf, start, end) {
  const version = buf.readUInt8(start)
  // v1 widens creation/modification/duration from 4 to 8 bytes each (+12).
  const offset = start + 4 + (version === 1 ? 32 : 20) + 8 + 2 + 2 + 2 + 2 + 36
  if (offset + 8 > end) return null
  const w = buf.readUInt32BE(offset) / 65536
  const h = buf.readUInt32BE(offset + 4) / 65536
  return w > 0 && h > 0 ? { width: Math.round(w), height: Math.round(h) } : null
}

function walk(buf, start, end, found) {
  let pos = start
  while (pos + 8 <= end) {
    let size = buf.readUInt32BE(pos)
    const type = buf.toString('latin1', pos + 4, pos + 8)
    let header = 8

    if (size === 1) {
      // 64-bit size: the real value follows the type.
      if (pos + 16 > end) break
      size = Number(buf.readBigUInt64BE(pos + 8))
      header = 16
    } else if (size === 0) {
      size = end - pos // box runs to the end of its parent
    }

    if (size < header || pos + size > end) break

    if (type === 'tkhd') {
      // An audio track also has a tkhd, but with zero dimensions — so the
      // first non-zero one is the video track.
      const dims = readTkhd(buf, pos + header, pos + size)
      if (dims) found.push(dims)
    } else if (CONTAINERS.has(type)) {
      walk(buf, pos + header, pos + size, found)
    }

    pos += size
  }
}

/** Returns { width, height } for the first video track, or null. */
export function mp4Dimensions(file) {
  const buf = readFileSync(file)
  const found = []
  walk(buf, 0, buf.length, found)
  return found[0] ?? null
}
