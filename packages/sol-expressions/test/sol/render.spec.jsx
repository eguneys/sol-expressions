import * as r from '../../src/client'
import * as S from 's-js'
import { Transform } from 'soli2d'

describe("render", () => {

  it("should render JSX", () => {
    const favoriteCar = S.data("Prosche 911 Turbo")

    const DynamicChild = props => (
      <transform translate={props.translate}/>)

    const Component = () => <DynamicChild translate={Vec2.unit}/>

    const container = new Transform()
    r.render(DynamicChild, container)

    expect(container._children[0].x).toBe(1)
    expect(container._children[0].y).toBe(1)
  })

})
