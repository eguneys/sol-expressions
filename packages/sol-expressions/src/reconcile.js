export default function reconcileArrays(parent, a, b) {
  parent._children = parent._children.filter(_ => !a.includes(_))
  b.forEach(_ => _._set_parent(parent))
}
