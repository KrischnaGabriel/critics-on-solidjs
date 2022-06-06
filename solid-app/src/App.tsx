import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

import css from './App.module.css';

const App: Component = () => {
    const [state,setState] = Solid.createSignal(0,{ equals: false })
    
    return (
        <div class={css.App}>
            <button onclick={()=>setState}>vurhi</button>
        </div>
    );
};

export default App;

function Comp(params) {
    Solid.onMount(()=>console.log("onMount"))
    Solid.createEffect(()=>console.log("createEffect"))

    return null
}
