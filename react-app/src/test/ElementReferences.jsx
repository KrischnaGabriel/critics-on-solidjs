import React from "react";

export default function() {

    const [state, setstate] = React.useState(false)

    let ref = React.useRef();

    React.useEffect(()=>{
        ref.current.innerText = "set"
    },[])
    
    function Main() {
        const button = <div>
            <button onClick={()=>{
            setstate(!state)
        }}>toggle state</button>
        </div>

        const info = <div ref={ref}>blank</div>

        console.log("state main",state)

        return <>
            {button}
            {state?<br/>:null}
            {info}
            {state?<br/>:null}
        </>
    }

    React.useEffect(()=>{
        console.log("state EFFECT",state)
    })

    return Main()
}