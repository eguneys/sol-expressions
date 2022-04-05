import * as r from '../../src/client'
import { Transform } from 'soli2d'

describe("r.insert", () => {

  it("inserts nothing", () => {
    const res = insert(null)
    expect(res._children.length).toBe(0)
  })

  it("inserts nothing on undefined", () => {
    const res = insert(undefined)
    expect(res._children.length).toBe(0)
  })

  it("inserts transform", () => {
    let child = new Transform()
    const res = insert(child)

    expect(res._children.length).toBe(1)
    expect(res._children[0]).toBe(child)
  })

  function insert(val) {
    let parent = new Transform()
    r.insert(parent, val)
    return parent
  }
})
