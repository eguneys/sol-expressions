import { Transform } from 'soli2d'
import { root, effect, memo, createComponent } from 'rxcore'

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

function insertExpression(parent, value, current, marker) {

  if (value === current) return current


  if (value === null) {
  }

  if (value instanceof Transform) {
    value._set_parent(parent)
  }

}
