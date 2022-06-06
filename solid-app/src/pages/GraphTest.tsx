import type { Component } from 'solid-js';
import * as Solid from 'solid-js';

import css from './GraphTest.module.css'
import Graph from './Graph'

const App: Component = () => {
    
    return (
        <Graph data={{
            graphs: [{
                x: {
                    from: -1,
                    to: 1,
                },
                y: {
                    from: -1,
                    to: 1,

                },
                scales: {
                    x: [{
                        tick: 1,
    
                        label: <div>x label bottom</div>,
                        align: "bottom",
                    },{
                        tick: 1,
    
                        label: <div>x label top</div>,
                        align: "top",
                    },{
                        tick: 1,
    
                        label: <div>y label middle</div>,
                        align: ["bottom", 0.5],
                    }],
                    y: [{
                        tick: 1,
    
                        label: <div>y label left</div>,
                        //align: "left",
                        align: ["left",-1],
                    },{
                        tick: 1,
    
                        label: <div>y label right</div>,
                        align: "right",
                    },{
                        tick: 1,
    
                        label: <div>y label middle</div>,
                        align: ["right", 0.5],
                    }],
                }
            }]
            
        }} class={css.graph}/>
    );
};

export default App;
