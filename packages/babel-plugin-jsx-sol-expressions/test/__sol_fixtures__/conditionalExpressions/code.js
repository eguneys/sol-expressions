const template12 = <Comp render={state.dynamic ? good() : bad }/>

const template13 = <Comp render={state.dynamic ? good : bad } />


const template16 = <Comp render={state.dynamic || good() } />


const template17 = <Comp render={state.dynamic ? <Comp/> : <Comp/> }/>

const template18 = <Comp>{state.dynamic ? <Comp/> : <Comp/> }</Comp>
