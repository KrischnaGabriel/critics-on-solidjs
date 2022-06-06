import type { Component } from 'solid-js';
import * as Solid from 'solid-js';
import * as SolidWeb from 'solid-js/web';

import css from './Graph.module.css';

/*
designed with typescript with `strict-mode: false`.
I only use typescript for public templating.
In code it is often just overly verbose, that it gets annoying.
ESPECALLY IF VSCODE TYPESCRIPT HIGHLIGHTING IS GARBAGE and makes errors and mistakes and crap.
*/

/*
Is the name graph appropriate? Isn't it tecknically a diagramm?
idk
https://english.stackexchange.com/questions/43027/whats-the-difference-between-a-graph-a-chart-and-a-plot

What's the difference between diagrams, charts and graphs?
https://www.diagrams.net/blog/diagrams-charts-graphs
*/


Math.avg = function avg() {
    let out = 0;
    const args = Object.values(arguments)
    for (const num of args) {
        out += num
    }
    return out /= args.length
}
Math.lerp = (a,b,i) => ( a*(1-i) + b*i )

Math.inverseLerp = (a,b,x) => (x-a)/(b-a)

/*
the css prop "vector-effect" does not effect circles and text.
Thus fontsizes and circles would scale and distord depending on the graphs scale they're in.

"vector-effect" has the "non-scaling-size" value accoring to mozilla but it not only seems to have no effect but also in chrome ONLY the "non-scaling-stroke" value is supported.
Generally when working with svgs be careful with uncanny features that may not work crossplaform.

The old solution to that was to use a svg without a viewbox and then manually translating the coordinates with 


. This is one but an annoying way of doing it.

The other solution is to use viewboxes and then manually adjust the size of text & circles.
I know of 3 approaches of doing this manually:
1. intercepting r and font-size values and doing my math on it. Basically, similar to my old solutione.

2. Using css transform scale does NOt work cuz it takes the svg canvas as the transform origin. (╯°□°)╯︵ ┻━┻
3. using calc( 1em / factor ). :I

3rd one does work and u only need to calculate the scaling factor once.
I guess that must be good enough then. -_-

*/



type horizontalAlign = (number|"left"|"right"|"middle"|"center");
type verticalAlign = (number|"top"|"bottom"|"middle"|"center");


// parameter may be a single value or an array of values
function iterate(something: any, callback: Function):any {
    if (Array.isArray(something)) {
        for (const item of something) {
            callback(item)
        }
    }else{
        callback(something)
    }
}

function swap(a, b, doit= true) {
    if (doit) {
        let tmp=a; a=b; b=tmp;
    }
    return [a,b]
}

function arrify() {
    const args = Object.values(arguments);
    let out = []
    for (const smth of args) {
        if (smth == undefined) continue;
        if (Array.isArray(smth)) {
            out = [...out, ...smth]
        }else{
            out.push(smth)
        }
    }
    return out
}

const App = (props: {
    [key: string]: any,
    data: {

        graphs: {
            x: {
                scale?: "linear",//|"log"|"mel"|"bark"|"erb"|"period"
                from: number,
                to: number,
            },
            y: {
                scale?: "linear",//|"log"|"mel"|"bark"|"erb"|"period"
                from: number,
                to: number,
            },
            scales: {
                x?: {
                    tick?: number, ticks?: number, step?: number, steps?: number,
                    origin?: number,
                    suffix?: string,
                    align?: verticalAlign,

                    label?: string|HTMLElement,
                    labelAlign?: horizontalAlign,
                }[],
                y?: {
                    tick?: number, ticks?: number, step?: number, steps?: number,
                    origin?: number,
                    suffix?: string,
                    align?: horizontalAlign,

                    label?: string|HTMLElement,
                    labelAlign?: verticalAlign,
                }[],
            }
            charts: {
                type?: "line",//|"bar"

            }[]
        }[]
        
    }
}) => {

    /* origin
    const [dimensions, setdimensions]: any = Solid.createSignal()
    let svgWrapperRef: any;
    {//resizeObserver
        let resizeObserver: ResizeObserver;
        
        Solid.onMount(()=>{
            console.log("onMount")

            oweno = svgWrapperRef

            resizeObserver = new ResizeObserver(entries => {
                //console.log("setdimensions",entries[0].contentRect) // DON'T use that. it gives 0 values!
                console.log("DIMENSION UPDATE")
                setdimensions(svgWrapperRef.getBoundingClientRect())
            });
            resizeObserver.observe(svgWrapperRef);
        })

        Solid.onCleanup(()=>{
            console.log("onUnmount")

            resizeObserver.disconnect()
        })
    }*/
    const [dimensions, setdimensions]: any = Solid.createSignal(undefined,{equals: (newVal,old)=>{
        return (newVal? !(Math.round(newVal.width)!==Math.round(old.width) || Math.round(newVal.height)!==Math.round(old.height)):false)
    }})
    let svgWrapperRef: any;
    let resizeObserver: ResizeObserver;
    
    Solid.createEffect(()=>{
        dimensions()
        
        console.log("EFFECT")

        // ? ( 281.6333312988281 !== 281.6333312988281  ||  234 !== 234 ):false)
        resizeObserver = new ResizeObserver(entries => {
            //console.log("setdimensions",entries[0].contentRect) // DON'T use that. it gives 0 values!
            console.log("DIMENSION UPDATE")
            setdimensions(svgWrapperRef.getBoundingClientRect())
        });
        resizeObserver.observe(svgWrapperRef);
    })

    function parseAlign(_, from, to) {

        let orient,align;
        for (let value of arrify(_.align)) {
            if (["bottom","top","right","left"].includes(value)) {
                if (align == undefined) {
                    align = value
                }else{
                    throw Error("you can NOT align the scale to the "+align+" and the "+value+" at the same time")
                }
            }else if (typeof value == "number" || ["middle","center"].includes(value)) {
                if (orient == undefined) {
                    orient = value
                }else{
                    throw Error("you cant have two numbers (value \"center\" and \"middle\" gets turned into a number) for the alignment of an axis")
                }
            }else{
                throw Error("what the hell am i supposed to do with "+value+" as a align value?!")
            }
        }
        if (align == undefined) {
            _.align = 0
        }else{
            switch (align) {
                case "left": case"bottom":
                _.align = 0
                break;
                case "top": case"right":
                _.align = 1
            }
        }
        if (orient == undefined) {
            _.orient = _.align ? to : from
        }else{
            if (["middle","center"].includes(orient)) {
                _.orient = Math.avg(from, to);
            }else{//typeof number
                _.orient = orient
            }
        }
    }
    
    
    function main(dimensions) {
        console.log("CLEAR")
        if (resizeObserver) {
            resizeObserver.disconnect()
            resizeObserver = null
        }
        if (dimensions == undefined) {
            // first, the available size needs to be known
        }
        console.log("dimensions main",dimensions)

        const graphs = props.data.graphs || [props.data.graph]

        // 
        const render: any = (()=>{
            const render = {
                top: [], bottom: [], left: [], right: [],
                graph: [],
            }
            
            
            for (const [index, graph] of Object.entries(graphs)) {
                if (graph.x.scale == undefined) {
                    graph.x.scale = "linear"
                } 
                if (graph.y.scale == undefined) {
                    graph.y.scale = "linear"
                }

                // better swap method than in the translation function.
                // better as it works more passively and can be used universally.
                // Why is there such a thing? This is so that a function designed for the x axis will also work on the y axis, without the need of rewriting.
                const u = {
                    x: {
                        x:"x", y:"y", width:"width", height:"height",
                        left:"left", right:"right", top:"top", bottom:"bottom",
                        x1:"x1", x2:"x2", y1:"y1", y2:"y2", cx:"cx", cy:"cy", 
                    },
                    y: {
                        x:"y", y:"x", width:"height", height:"width",
                        left:"top", right:"bottom", top:"left", bottom:"right",
                        x1:"y1", x2:"y2", y1:"x1", y2:"x2", cx:"cy", cy:"cx", 
                    },
                    horizontal: [
                        "x", "width",
                        "left", "right",
                        "x1", "x2", "cx",
                    ],
                    vertical: [
                        "y", "height",
                        "top", "bottom",
                        "y1", "y2", "cy", 
                    ]
                }


                // the translation function. from unit value to px position
                function t(obj: {x?:string, y?:string, unit?:any, px?:any, xSubtract?:number, ySubtract?:number}): any {

                    function realX(val) { // calculates the real x values from the arbitrary unit
                        let i = Math.inverseLerp(graph.x.from, graph.x.to, val)
                        return Math.lerp(0, dimensions.width, i)
                    }
                    function realY(val) { // calculates the real y values from the arbitrary unit
                        let i = Math.inverseLerp(graph.y.from, graph.y.to, val)
                        return Math.lerp(dimensions.height, 0, i)
                    }

                    const out = {}

                    function add(key,val) {
                        if (out[key] == undefined) {
                            out[key] = val
                        }else{
                            out[key] += val
                        }
                    }

                    if (obj.unit) {
                        for (const [key, value] of Object.entries(obj.unit)) {
                            if (u.horizontal.includes(key))
                                add(key, realX(value))
                            else 
                                add(key, realY(value))
                        }
                    }

                    if (obj.px) {
                        for (const [key, value] of Object.entries(obj.px)) {
                            add(key, value)
                        }
                    }

                    // old and not working x/y swapcode
                    const swap = obj.x == "y" || obj.y == "x"
                    const out2 = {}
                    for (let [key,value] of Object.entries(out)) {
                        if (swap) key = u.y[key]

                        if (u.horizontal.includes(key)) {
                            out2[key] = obj.xSubtract != undefined ? obj.xSubtract-value : value
                        }else{
                            out2[key] = obj.ySubtract != undefined ? obj.ySubtract-value : value
                        }
                    }
                    
                    return out2
                }

                function parse(_,o) {

                    _.steps = _.steps || _.ticks || _.step || _.tick
                    parseAlign(_, graph[o.y].from, graph[o.y].to)
                    
                    /* 
                    The svgs should dynamically resize their length depending on how much is advailable but the thickness shall stay fixed.
                    This is what happenes if fixSize = false.
                    For scales that are floating inside the graph (center/middle scales) the width needs to be fixed to allow it to be properly possitioned with position absolute. That is the scenario when fixSize = true.
                    The absolutely positioned elements also do not collide with the container, which means the container is free to resize to take up all advailable space
                    */
                    function drawScale(fixSize) {
                        const height = 30
                        const out = []
                        if (dimensions) {
                            // this mirrors/flips the label so that it faces the graph
                            // i later when modifying the transform obejt (o/u) i just used a matrix search as i had no clue anymore
                            let dox
                            let doy

                            if ((_.align == 1 && o.x=="y")) {
                                dox = 1
                                doy = 0
                            }
                            if ((_.align == 1 && o.x=="x")) {
                                dox = 0
                                doy = 1
                            }
                            if ((_.align == 0 && o.x=="y")) {
                                dox = 0
                                doy = 0
                            }
                            if ((_.align == 0 && o.x=="x")) {
                                dox = 0
                                doy = 0
                            }
                            
                            const flipScale = {
                                ySubtract: doy ? height : undefined,
                                xSubtract: dox ? height : undefined,
                            }

                            out.push(<line {...t({
                                unit: {
                                    [o.x1]: graph[o.x].from,
                                    [o.x2]: graph[o.x].to, 
                                },
                                px: {
                                    [o.y1]: 0,
                                    [o.y2]: 0, 
                                },
                                ...flipScale
                            })}/>)

                            let [from,to] = swap(graph[o.x].from, graph[o.x].to, graph[o.x].from>graph[o.x].to)
                            for (let i=from; i<=to; i+=_.steps) {
                                out.push(<line {...t({
                                    unit: {
                                        [o.x1]: i,  [o.x2]: i, 
                                    },
                                    px: {
                                        [o.y1]: 0,  [o.y2]: 10, 
                                    },
                                    ...flipScale
                                })}/>)
                            }

                        }

                        return <svg style={{
                            [o.height]: height+"px",
                            [o.width]: fixSize ? dimensions[o.width]+"px" : "100%"
                        }}>{out}</svg>
                    }
                    
                    // on outside scales
                    if (_.orient==graph[o.y].from) {
                        if ((_.align == 0)) {
                            render[o.bottom].push(drawScale(false))
                            render[o.bottom].push(_.label)
                        }else{
                            render[o.bottom].push(drawScale(false))
                            render[o.bottom].push(_.label)
                        }
                    }else if (_.orient==graph[o.y].to) {
                        if ((_.align == 0)) {
                            render[o.top].push(_.label)
                            render[o.top].push(drawScale(false))
                        }else{
                            render[o.top].push(_.label)
                            render[o.top].push(drawScale(false))
                        }
                    }else if (dimensions) {
                        // in graph scales
                        if ((_.align == 1)) {
                            render.graph.push(<div class={css["innerScale"+o.x]} style={{...Object.entries(t({
                                unit: {
                                    [o.top]: _.orient,
                                },
                                px: {
                                    [o.left]: 0,
                                }
                            })).reduce((obj,[key,val])=>{obj[key]=val+"px"; return obj},{}),transform: "translate"+o.y.toUpperCase()+"(-100%)"
                            }}>
                                {_.label}{drawScale(true)}
                            </div>)
                        }else{
                            render.graph.push(<div class={css["innerScale"+o.x]} style={Object.entries(t({
                                unit: {
                                    [o.top]: _.orient
                                },
                                px: {
                                    [o.left]: 0,
                                }
                            })).reduce((obj,[key,val])=>{obj[key]=val+"px"; return obj},{})}>
                                {drawScale(true)}{_.label}
                            </div>)
                        }
                    }
                }

                iterate(graph.scales.x, (val)=>parse(val, u.x))
                iterate(graph.scales.y, (val)=>parse(val, u.y))
            }

            return render
        })()

        return (<div {...props} class={css.wrapper+" "+props.class}>
            <div/>
            <div>{render.top}</div>
            <div/>

            <div>{render.left}</div>
            <div ref={svgWrapperRef}>
                <svg class={css.svg}>
                </svg>
                {render.graph}
            </div>
            <div>{render.right}</div>

            <div/>
            <div>{render.bottom}</div>
            <div/>
        </div>);
    }

    return <>{main(dimensions())}</>
};

export default App;
