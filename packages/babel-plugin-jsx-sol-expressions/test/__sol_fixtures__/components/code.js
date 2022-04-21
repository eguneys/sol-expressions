let t_

const templateR = (
  <transform ref={t_}/>
)


const template3 = (
  <Child>
    <transform/>
    <transform/>
    <transform/>
  </Child>
)


const template6 = (
  <For each={state.list} fallback={<Loading />}>
    {item => <Show when={state.condition}>{item}</Show>}
  </For>
)


const template13 = <Component prop={this.something}>
    <Nested propd={this.data}/>
  </Component>


const template60 = (
  <transform>
    <Tile />
    <For each={list}>{([no, box]) =>
      <Tile/>
    }</For>
    {props.children}
  </transform>
)

const template61 = (<transform>
  <transform/>
  <For each={list}>{_ => <transform/> }</For>
  </transform>)
