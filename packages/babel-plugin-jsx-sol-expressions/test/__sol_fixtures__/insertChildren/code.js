const children = <sprite/>

const dynamic = {
  children
}


const template = <Module children={children}/>

const template2 = <module children={children}/>
const template3 = <module children={children}>Hello</module>
const template4 = (<module children={children}>
  <Hello/>
  </module>)


const template20 = <module>{children()}</module>
const template21 = <Module>{children()}</Module>


const tiles = []
tiles.push(<module/>)
const template24 = <module>{tiles}</module>


const template25 = <module><module/></module>
