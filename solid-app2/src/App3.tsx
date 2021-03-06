import type { Component } from 'solid-js';
import * as Solid from 'solid-js';
import { createStore } from "solid-js/store";
import createSignalObject from './createSignalObject';

declare var window: any;

/*
no good
```
>> set(({a:1,b:0}))
a 1
b 0
>> set(({a:1111,b:0}))
a 1111 
b 0 
```
export default function() {
  const [get,set] = Solid.createSignal(val:{a:1,b:0})
  window.set = set
  Solid.createMemo(()=> console.log("a",get().a))
  Solid.createMemo(()=> console.log("b",get().b))
  return null
}
*/


/*
this does work
```
>> set({a:1,b:0})
>> set({a:1,b:1})
b 1
```
export default function() {
  const [get,set] = createStore({a:1,b:0})
  window.set = set
  Solid.createMemo(()=> console.log("a",get.a))
  Solid.createMemo(()=> console.log("b",get.b))
  return null
}
*/


/*
but not with nested objects
```
>> set({val:{a:1,b:0}})
a 1
b 0
```
export default function() {
  const [get,set] = createStore({val:{a:1,b:0}})
  window.set = set
  Solid.createMemo(()=> console.log("a",get.val.a))
  Solid.createMemo(()=> console.log("b",get.val.b))
  return null
}
*/


/*
Ok, this does works ...
```
>> set("val",(val)=>({...val, b: 1}))
b 1
>> set("val","a",33)
a 33
```
export default function() {
  const [get,set] = createStore({val:{a:1,b:0}})
  window.set = set
  Solid.createMemo(()=> console.log("a",get.val.a))
  Solid.createMemo(()=> console.log("b",get.val.b))
  return null
}
*/




/*
This does work (but ironically only with nested objects, as it does not has a setter yet. Oh, and you can set values by a simple assignment. How sweet is that!),
And there is no limit on the depth of nested objects. 
```
>> obj.val = {a: 1, b:0}
>> obj.val = {a: 1, b:1}
b 1
```

export default function() {
  let obj:any; {
    const accessor = {}
    obj = createSignalObject({val:{a:1,b:0}}, accessor)
  }
  window.obj = obj
  Solid.createMemo(()=> console.log("a",obj.val.a))
  Solid.createMemo(()=> console.log("b",obj.val.b))
  return null
}
*/


/// biggeer depth

/*
```
>> obj.layer1 = {layer2: {a: 1, b:1}}
b 1
```

export default function() {
  let obj:any; {
    const accessor = {}
    obj = createSignalObject({layer1:{layer2:{a:1,b:0}}}, accessor)
  }
  window.obj = obj
  Solid.createMemo(()=> console.log("a",obj.layer1.layer2.a))
  Solid.createMemo(()=> console.log("b",obj.layer1.layer2.b))
  return null
}
*/

/*
```
>> set("layer1", (layer1)=>({...layer1, layer2: {a: 1, b:1}}))
a 1 
b 1
```

export default function() {
  const [get,set] = createStore({layer1:{layer2:{a:1,b:0}}})
  window.set = set
  Solid.createMemo(()=> console.log("a",get.layer1.layer2.a))
  Solid.createMemo(()=> console.log("b",get.layer1.layer2.b))
  return null
}
*/
