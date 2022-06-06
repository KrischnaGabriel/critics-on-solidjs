import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

const App: Component = () => {
    
    const [state, setstate]: any = Solid.createSignal(false)

    Solid.createEffect(()=>{
        console.log("state EFFECT",state())
    })
    
    function Main() {
        const button = <div>
            <button onclick={()=>{
            setstate(!state())
        }}>toggle state</button>
        </div>

        console.log("state Main",state())

        let dynamic = state()
        return <>
            {button}
            <div>{"incomponent: "+state()}</div>
            <div>{"inmethod: "+dynamic}</div>
        </>
    }
    function Main2({state}) {
        const button = <div>
            <button onclick={()=>{
            setstate(!state)
        }}>toggle state</button>
        </div>

        console.log("state Main",state)

        let dynamicContent = state
        return <>
            {button}
            <div>{"incomponent: "+state}</div>
            <div>{"inmethod: "+dynamicContent}</div>
        </>
    }

    return Main()
    //return <Main/>
    //return <>{Main()}</>

    //return Main2({state: state()})
    //return <Main2 state={state()}/>
    //return <>{Main2({state: state()})}</>
};

export default App;
