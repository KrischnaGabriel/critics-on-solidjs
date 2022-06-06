import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

const App: Component = () => {
    
    const [state, setstate]: any = Solid.createSignal(false)

    let ref;

    Solid.onMount(()=>{
        ref.innerText = "set"
    })
    
    function Main() {
        const button = <div>
            <button onclick={()=>{
            setstate(!state())
        }}>toggle state</button>
        </div>

        const info = <div ref={ref}>blank</div>

        console.log("state main",state())

        return <>
            {button}
            {state()?<br/>:null}
            {info}
            {state()?<br/>:null}
        </>
    }

    Solid.createEffect(()=>{
        console.log("state EFFECT",state())
    })

    return <>{Main()}</>
};

export default App;
