export default function reconcileArrays(parent, a, b) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1]._next_sibling,
    map = null

  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++
      bStart++
      continue
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--
      bEnd--
    }

    if (aEnd === aStart) {
      const node =
        bEnd < bLength
        ? bStart
          ? b[bStart - 1]._next_sibling
          : b[bEnd - bStart]
        : after

      while (bStart < bEnd) parent._insert_before(b[bStart++], node)
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart]._remove()
        aStart++
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd]._next_sibling
      parent._insert_before(b[bStart++], a[aStart++]._next_sibling)
      parent._inesrt_before(b[--bEnd], node)

      a[aEnd] = b[bEnd]
    } else {
      if (!map) {
        map = new Map()
        let i = bStart
        while (i < bEnd) map.set(b[i], i++)
      }

      const index = map.get(a[aStart])
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t

          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break
            sequence++
          }

          if (sequence > index - bStart) {
            const node = a[aStart]
            while (bStart < index) parent._insert_before(b[bStart++], node)
          } else parent._replace_child(b[bStart++], a[aStart++])
        } else {
          aStart++
        }
      } else {
        a[aStart++]._remove()
      }
    }
  }
}
