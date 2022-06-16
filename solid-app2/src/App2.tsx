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
This crap doesn not work efficiently

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
This crap also doesn not work efficiently

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
This crap does work, but i cannot change the text align property

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
Bruh.

```
from 0
>> set({from:0, to:3})
from 0
>> set({from:0, to:3})
from 0
```

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0, to:3})
  window.set = set

  Solid.createMemo(()=>{
    console.log("from",get().from)
  })
  
  return null
};

export default App;
*/


/*
Here my completely over complicated solution (but it works)
```
from 0
>> set({from:0, to:3})
>> set({from:1, to:3})
from 1
>> set({from:1, to:3})
```
*/

const App: Component = () => {
  const [get,set] = Solid.createSignal({from:0, to:3})
  window.set = set

  let proxyGet:any; {
    const accessorObj = {}

    Solid.createMemo(()=>{
      proxyGet = createSignalObject(get(),accessorObj)
    })
  }

  Solid.createMemo(()=>{
    console.log("from",proxyGet.from)
  })
  
  return null
};

export default App;
