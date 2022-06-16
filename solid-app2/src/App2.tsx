import type { Component } from 'solid-js';
import * as Solid from 'solid-js';
import createSignalObject from './createSignalObject';

declare var window: any;

/*
Issue: create a dynamic for loop that does update efficiently (without replacing all child elements)

Test procedure:
1. set the backgroundcolor of 1 to red
2. set({from:0,to:2}) // or similar
if the color resets, the component updated inefficiently
*/


/*
This does work, but i cannot change the text align property

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0, to:3})
  window.set = set

  const memo = Solid.createMemo(()=>{
    const arr=[]
    for (let i=get().from; i<get().to; i++) {
      arr.push(i)
    }
    return {data: arr}
  })

  const out =  <Solid.For each={memo().data}>{(itm)=>{ 
    return <div style={"text-align:right"}>{itm}</div>}
  }</Solid.For>
  
  return <>{out}</>
};

export default App;
*/


/*
This does not work efficiently

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0,to:3})
  window.set = set

  const memo = Solid.createMemo(()=>{
    const arr=[]
    for (let i=get().from; i<get().to; i++) {
      arr.push(i)
    }
    return {data: arr, align: "right"}
  })

  const out =  <Solid.For each={memo().data}>{(itm)=>{ 
    return <div style={"text-align:"+memo().align}>{itm}</div>}
  }</Solid.For>
  
  return <>{out}</>
};

export default App;
*/


/*
This also does not work efficiently

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0, to:3, align: "right"})
  window.set = set

  const memo = Solid.createMemo(()=>{
    const arr=[]
    for (let i=get().from; i<get().to; i++) {
      arr.push(i)
    }
    return {data: arr}
  })

  const out =  <Solid.For each={memo().data}>{(itm)=>{ 
    return <div style={"text-align:"+get().align}>{itm}</div>}
  }</Solid.For>
  
  return <>{out}</>
};

export default App;
*/



/*
This does work and alternaltively also createStore can be used, but in most instances i have a nested object with all properties that i may or may not use and creating a signal for each and every property is unveasable

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0, to:3})
  const [align,setalign] = Solid.createSignal("right")
  window.set = set
  window.setalign = setalign

  const memo = Solid.createMemo(()=>{
    const arr=[]
    for (let i=get().from; i<get().to; i++) {
      arr.push(i)
    }
    return {data: arr}
  })

  const out =  <Solid.For each={memo().data}>{(itm)=>{ 
    return <div style={"text-align:"+align()}>{itm}</div>}
  }</Solid.For>
  
  return <>{out}</>
};

export default App;
*/

export default App;
