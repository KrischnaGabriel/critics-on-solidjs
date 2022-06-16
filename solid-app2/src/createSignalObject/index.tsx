import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

/* this hook doesn't has a setter yet, but implementing one is easy.
For that the function just needs to be rerun with the same signalObj, but i don't know how to supply it with the same signalObj object, without explicitly passign a reference to it whenever running the hook. See Development.tsx for examples of just that
*/
export default function createSignalObject(dataObj:any, signalObj:any):any {
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
}

