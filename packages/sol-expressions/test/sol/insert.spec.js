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

  it('can insert nested arrays', () => {
    expect(insert([new Transform(), [new Transform(), new Transform()]])._flat.length).toBe(4)
    expect(insert([new Transform(), [new Transform(), [new Transform()]]])._flat.length).toBe(4)
  })

  function insert(val) {
    let parent = new Transform()
    r.insert(parent, val)
    return parent
  }


  it('can insert changing array of nodes', () => {
    let parent = new Transform()
    let n1 = new Transform(),
      n2 = new Transform(),
      n3 = new Transform(),
      n4 = new Transform()
    let orig = [n1, n2, n3, n4]
    let current

    n1.name = 'one'
    n2.name = 'two'
    n3.name = 'three'
    n4.name = 'four'

    let origExpected = expected(orig)

    test([n1, n2, n3, n4])
    test([    n2, n3, n4])
    test([        n3, n4])
    test([            n4])

    test([        n3, n4])
    test([    n2,     n4])
    test([    n2, n3    ])
    test([n1,         n4])
    test([n1,     n3    ])
    test([n1, n2,       ])



    test([n1            ])
    test([    n2        ])
    test([        n3    ])
    test([            n4])

    test([              ])


    debugger
    test([n2, n1, n3, n4])
    test([n3, n2, n1, n4])
    test([n4, n2, n3, n1])


    test([n2, n3, n4, n1])
    test([n3, n4, n1, n2])
    test([n4, n1, n2, n3])


    test([n4, n3, n2, n1])

    function test(array) {
      current = r.insert(parent, array, undefined, current)
      expect(parent._flat.map(_ => _.name).join('')).toBe(expected(array))
      //console.log(parent, orig, current)
      current = r.insert(parent, orig, undefined, current)
      expect(parent._flat.map(_ => _.name).join('')).toBe(origExpected)
    }

    function expected(array) {
      return array.map(_ => _.name).join('')
    }

  })


  test('insert and remove ordering', () => {
    let parent = new Transform()
    let n1 = new Transform(),
      n2 = new Transform(),
      n3 = new Transform(),
      n4 = new Transform()

    n1.name = 'one'
    n2.name = 'two'
    n3.name = 'three'
    n4.name = 'four'


    let orig = [n1, n2, n3, n4]
    r.insert(parent, orig)

    r.insert(parent, [n2], undefined, [n1, n2, n3])
    expect(parent._flat.map(_ => _.name).join('')).toBe(expected([n2, n4]))


    function expected(array) {
      return array.map(_ => _.name).join('')
    }


  })

})
