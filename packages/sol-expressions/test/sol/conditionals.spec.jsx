import * as S from 's-js'

describe('Test conditional operators', () => {
  test('ternary expression triggered', () => {
    let transform

    S.root(() => {
      const s = S.data(0)
      transform = <transform x={s() > 5 ? 500 : 300}/>
      expect(transform.x).toBe(300)
      s(7)
      expect(transform.x).toBe(500)
    })
  })
})
