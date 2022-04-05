import S, { root, value, sample } from 's-js'



function memo(fn, equal) {
  if (!equal) return S(fn)
  const s = value(sample(fn))
  S(() => s(fn()))
  return s
}

function createComponent(Comp, props) {
  return sample(() => Comp(props))
}

export { root, S as effect, memo, createComponent }
