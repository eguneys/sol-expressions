import { Transform } from 'ex/soli2d'
import { root, effect, memo, createComponent } from 'rxcore'
import reconcileArrays from './reconcile'

export { effect, memo, createComponent }

export function render(code, element, init) {

  let disposer
  
  root(dispose => {
    disposer = dispose
    insert(element, code(), undefined, init)
  })

  return () => {
    disposer()
  }
}

export function template(html, check) {
  return new Transform()
}


export function setAttribute(node, name, value) {
  if (value == null) {
    node[name] = undefined
  }
  else {
    node[name] = value
  }
}

export function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = []
  if (typeof accessor !== 'function') return insertExpression(parent, accessor, initial, marker)
  effect(current => insertExpression(parent, accessor(), current, marker), initial)
}

function insertExpression(parent, value, current, marker, unwrapArray) {

  if (value === current) return current

  const t = typeof value,
    multi = marker !== undefined

  if (value === null) { }

  if (Array.isArray(value)) {
    const array = []
    if (normalizeIncomingArray(array, value, unwrapArray)) {
      effect(() => (current = insertExpression(parent, array, current, marker, true)))
      return () => current
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker)
      if (multi) return current
    } else if (Array.isArray(current)) {
      if (current.length === 0) {
        appendNodes(parent, array, marker)
      } else {
        reconcileArrays(parent, current, array)
      }
    } else {
      current && cleanChildren(parent)
      appendNodes(parent, array)
    }
    current = array
  } else if (t === 'function') {
    console.log('here')
  } else if (value instanceof Transform) {
    value._set_parent(parent)
  }

  return current
}


function normalizeIncomingArray(normalized, array, unwrap) {
  let dynamic = false
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
      t
    if (item instanceof Transform) {
      normalized.push(item)
    } else if (item == null || item === true || item === false) {
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item) || dynamic
    } else if ((t = typeof item) === 'function') {

      if (unwrap) {
        while (typeof item === 'function') item = item()
        dynamic =
          normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic
      } else {
        normalized.push(item)
        dynamic = true
      }
    }
  }
  return dynamic
}


function appendNodes(parent, array, marker) {
  for (let i = 0, len = array.length; i < len; i++) {
    array[i]._set_parent(parent)
  }
}

function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return (parent._children = [])
  const node = replacement || []
  if (current.length) {
    console.log(current.length)
    /*
    let inserted = false
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i]
      if (node !== el) {
        const isParent = el._parent === parent
        if (!inserted && !i) {
          isParent ? parent
        }
      }
    }
    */
  }
}
