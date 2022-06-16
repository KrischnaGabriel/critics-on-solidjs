import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

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

