/**
 * The file has the structure it has because i did not use git and this would be a great example where to use it and how.
 */

import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

declare var window: any;
const exports:{[key:string]: Component} = {}
{

    /*
    # Problem: 
    Normally when updating the props, all consumers get updated, no matter if the specific property they access has changed or not
    ```
    >> set({...get()})
    props.data.val1 perhaps
    props.data.val2 no
    ```
    */

    exports[1] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no"})
        window.set = setter
        window.get = getter
        return (
            <ShowTime data={getter()}/>
        );
    };

    function ShowTime(rawProps: any) {
        
        const props = rawProps

        Solid.createEffect(()=>console.log("props.data.val1",props.data.val1))
        Solid.createEffect(()=>console.log("props.data.val2",props.data.val2))

        /* memos also get rerun
        Solid.createMemo(()=>console.log("props.data.val1",props.data.val1))
        Solid.createMemo(()=>console.log("props.data.val2",props.data.val2))
        */

        return null
    }
    
}
{

    /*
    This is what the createSignalObject hook tries to optimise.
    Every property is a signal so that only the functions, that use a property of which the value has actually changed, will be rerun.

    ```
    >> set({...get()})
    >> set({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
    >> set({val1: "perhaps", val2: "yes", subObj: {a: 1, b: 2}})
    signalObj.data.val2 yes
    >> set({val1: "perhaps", val2: "yes", subObj: {a: 1, b: 3}})
    signalObj.data.subObj.b 3
    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
  
        // note that not anymore used properies leave behind a entry into the signalObj, that will not be cleared. it would be better to make a new signalObj and to onl copy signals from the old one that are still in use.
        function makeSignals(dataObj:any, signalObj:any) {
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = {}
                    }
                    makeSignals(dataObj[key], signalObj[key]);
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                }
            }
        }
        makeSignals(dataObj, signalObj)
    }

    exports[2] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        const signalObj: any ={}
        Solid.createMemo(()=> createSignalObject(rawProps, signalObj))

        window.signalObj = signalObj
        window.rawProps = rawProps
        
        Solid.createMemo(()=>console.log("signalObj.data.val1",signalObj.data.val1[0]()))
        Solid.createMemo(()=>console.log("signalObj.data.val2",signalObj.data.val2[0]()))
        Solid.createMemo(()=>console.log("signalObj.data.subObj.a",signalObj.data.subObj.a[0]()))
        Solid.createMemo(()=>console.log("signalObj.data.subObj.b",signalObj.data.subObj.b[0]()))


        return null
    }

}

{

    /*
    Always accessing the position zero of an array and having to call a function yourself is messy and annoying. Proxy objects to the rescue.

    And it still works:
    ```
    >> set({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
    >> set({val1: "perhaps", val2: "no", subObj: {a: 1, b: 5}})
    proxyProps.data.subObj.b 5
    >> set({val1: "perhaps", val2: "neo", subObj: {a: 1, b: 5}})
    proxyProps.data.val2 neo
    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
        function makeSignals(dataObj:any, signalObj:any) {
            const proxyObj:any = Array.isArray(dataObj)? [] : {}
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = Array.isArray(value)? [] : {}
                    }
                    proxyObj[key] = makeSignals(dataObj[key], signalObj[key]);
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                }
            }
            return new Proxy({}, {
                get: (_rge,key) => {
                    if (proxyObj[key] !== undefined) {
                        return proxyObj[key]
                    }else{
                        return signalObj[key][0]();
                    }
                },
            })
        }
        return makeSignals(dataObj, signalObj)
    }

    exports[3] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))


        return null
    }

}
{

    /*
    Now with a setter.
    ```
    >> proxyProps.data.subObj.b = 77
    proxyProps.data.subObj.b 77
    >> proxyProps.data.subObj = {a:1, b:null}
    proxyProps.data.subObj.b 2
    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
        function makeSignals(dataObj:any, signalObj:any) {
            const proxyObj:any = Array.isArray(dataObj)? [] : {}
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = Array.isArray(value)? [] : {}
                    }
                    proxyObj[key] = makeSignals(dataObj[key], signalObj[key]);
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                }
            }
            return new Proxy({}, {
                get: (_rge,key) => {
                    if (proxyObj[key] !== undefined) {
                        return proxyObj[key]
                    }else{
                        return signalObj[key][0]();
                    }
                },
                set: (_huas,key,value) => {
                    if (typeof value === 'object' && value !== null) {
                        proxyObj[key] = makeSignals(dataObj[key], signalObj[key]);
                    }else{// this can cause errors when a once primitive gets reasigned to an object or vice versa, maybe
                        signalObj[key][1](value);
                    }
                    return value
                }
            })
        }
        return makeSignals(dataObj, signalObj)
    }

    exports[4] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))


        return null
    }

}
{

    /*
    This does work but operations like spread syntax don't work.
    What i figured out also works instead of Proxies are getter & setter,
    now, same magic as before but with real objects.
    
    ```
    >> proxyProps.data.subObj.b = 4
    proxyProps.data.subObj.b 4
    >> ({...proxyProps.data.subObj})
    Object { a: 1, b: 4 }
    proxyProps.data.subObj = { a: 1, b: 5 } // oh no
    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
        function makeSignals(dataObj:any, signalObj:any) {
            const proxyObj:any = Array.isArray(dataObj)? [] : {}
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = Array.isArray(value)? [] : {}
                    }
                    proxyObj[key] = makeSignals(dataObj[key], signalObj[key]);
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                        Object.defineProperty(proxyObj,key,{
                            set: signalObj[key][1],
                            get: signalObj[key][0],
                            enumerable: true,
                        }) 
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                }
            }
            return proxyObj
        }
        return makeSignals(dataObj, signalObj)
    }

    exports[5] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))


        return null
    }

}
{

    /*
    Now with nested obejct support again
    
    ```
    >> proxyProps.data.subObj = { a: 1, b: 3 }
    proxyProps.data.subObj.b 3
    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
        function makeSignals(dataObj:any, signalObj:any) {
            const proxyObj:any = Array.isArray(dataObj)? [] : {}
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = Array.isArray(value)? [] : {}
                    }
                    let out = makeSignals(dataObj[key], signalObj[key])
                    Object.defineProperty(proxyObj,key,{
                        set: (value)=>
                            out = makeSignals(dataObj[key] = value, signalObj[key])
                        ,
                        get: ()=> out,
                        enumerable: true,
                    }) 
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                    Object.defineProperty(proxyObj,key,{
                        set: signalObj[key][1],
                        get: signalObj[key][0],
                        enumerable: true,
                    }) 
                }
            }
            return proxyObj
        }
        return makeSignals(dataObj, signalObj)
    }

    exports[6] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))


        return null
    }

}
{
    
    /*
    Testing batching
    
    ``` 
    // note that only deep changes (of individual properties) are being monitored
    >> proxyProps.data.subObj = { a: 1, b: 3 }
    {proxyProps.data.subObj}  Object { a: 1, b: 3 }
    proxyProps.data.subObj.b 3

    // oh no
    >> proxyProps.data.subObj = { a: 2, b: 1 }
    {proxyProps.data.subObj}  Object { a: 2, b: 2 }
    proxyProps.data.subObj.a 2 
    proxyProps.data.subObj.b&a 2 2
    {proxyProps.data.subObj}  Object { a: 2, b: 1 }
    proxyProps.data.subObj.b 1
    proxyProps.data.subObj.b&a 1 2

    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
        function makeSignals(dataObj:any, signalObj:any) {
            const proxyObj:any = Array.isArray(dataObj)? [] : {}
            for (const [key,value] of Object.entries(dataObj)) {
                if (typeof value === 'object' && value !== null) {
                    if (signalObj[key] == undefined) {
                        signalObj[key] = Array.isArray(value)? [] : {}
                    }
                    let out = makeSignals(dataObj[key], signalObj[key])
                    Object.defineProperty(proxyObj,key,{
                        set: (value)=>
                            out = makeSignals(dataObj[key] = value, signalObj[key])
                        ,
                        get: ()=> out,
                        enumerable: true,
                    }) 
                }else{
                    if (signalObj[key] == undefined){
                        signalObj[key] = Solid.createSignal(value)
                    }else{
                        signalObj[key][1](value); 
                        // if it's the same value as before it will have no effect anyway
                    }
                    Object.defineProperty(proxyObj,key,{
                        set: signalObj[key][1],
                        get: signalObj[key][0],
                        enumerable: true,
                    }) 
                }
            }
            return proxyObj
        }
        return makeSignals(dataObj, signalObj)
    }

    exports[7] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj",proxyProps.data.subObj))
        Solid.createMemo(()=>console.log("{proxyProps.data.subObj}",{...proxyProps.data.subObj}))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b&a",proxyProps.data.subObj.b,proxyProps.data.subObj.a))


        return null
    }

}
{
    
    /*
    added batching
    
    ``` 
    >> proxyProps.data.subObj = { a: 2, b: 1 }
    {proxyProps.data.subObj}  Object { a: 2, b: 1 }
    proxyProps.data.subObj.a 2
    proxyProps.data.subObj.b&a 1 2
    proxyProps.data.subObj.b 1

    ```

    */
    function createSignalObject(dataObj:any, signalObj:any):any {
        //return Solid.batch(() => {
            if (!(typeof dataObj === 'object' && dataObj !== null)) throw Error("something that is not an object has been supplied to the \"createSignalObject\" hook.")
            function makeSignals(dataObj:any, signalObj:any) {
                const proxyObj:any = Array.isArray(dataObj)? [] : {}
                for (const [key,value] of Object.entries(dataObj)) {
                    if (typeof value === 'object' && value !== null) {
                        if (signalObj[key] == undefined) {
                            signalObj[key] = Array.isArray(value)? [] : {}
                        }
                        let out = makeSignals(dataObj[key], signalObj[key])
                        Object.defineProperty(proxyObj,key,{
                            set: (value)=>
                                Solid.batch(()=> out = makeSignals(dataObj[key] = value, signalObj[key]))
                            ,
                            get: ()=> out,
                            enumerable: true,
                        }) 
                    }else{
                        if (signalObj[key] == undefined){
                            signalObj[key] = Solid.createSignal(value)
                        }else{
                            signalObj[key][1](value); 
                            // if it's the same value as before it will have no effect anyway
                        }
                        Object.defineProperty(proxyObj,key,{
                            set: signalObj[key][1],
                            get: signalObj[key][0],
                            enumerable: true,
                        }) 
                    }
                }
                return proxyObj
            }
            return makeSignals(dataObj, signalObj)
        //})
    }

    exports[8] = () => {
        const [getter,setter] = Solid.createSignal({val1: "perhaps", val2: "no", subObj: {a: 1, b: 2}})
        window.set = setter
        window.get = getter
        return (
            <div>
                <ShowTime data={getter()}/>
            </div>
        );
    };

    function ShowTime(rawProps: any) {
        let proxyProps:any; {
            const signalObj: any ={}
            Solid.createMemo(()=> proxyProps=createSignalObject(rawProps, signalObj))

            window.signalObj = signalObj
            window.rawProps = rawProps
            window.proxyProps = proxyProps
        }

        
        Solid.createMemo(()=>console.log("proxyProps.data.val1",proxyProps.data.val1))
        Solid.createMemo(()=>console.log("proxyProps.data.val2",proxyProps.data.val2))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj",proxyProps.data.subObj))
        Solid.createMemo(()=>console.log("{proxyProps.data.subObj}",{...proxyProps.data.subObj}))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.a",proxyProps.data.subObj.a))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b",proxyProps.data.subObj.b))
        Solid.createMemo(()=>console.log("proxyProps.data.subObj.b&a",proxyProps.data.subObj.b,proxyProps.data.subObj.a))


        return null
    }

}

export default exports[8];