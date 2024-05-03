import React, {useEffect, useState} from 'react';
import {
    CircularProgressbar,
    buildStyles
  } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import AnimatedProgressProvider from "./AnimatedProgressProvider";
import { easeQuadInOut } from "d3-ease";

function BusyFactor({user}) {
    // Component to dynamically display a user's busy factor  


    const [busyFactor, setBusyFactor] = useState();

    useEffect(() => {
        fetch('/busyFactor?email=' + user.email).then(response => 
          response.json().then(data => {
            console.log(data.busyFactor);
            setBusyFactor(data.busyFactor);
          })
        );
      }, [user.email]) 
  
    return (
        <div className='busyFactorBox' style={{width: '10em', height: '10em', marginTop: '0px', marginBottom: '0px'}}>
            <h3> Busy Rating </h3>

            <AnimatedProgressProvider
                valueStart={busyFactor}
                valueEnd={busyFactor}
                duration={1.2}
                easingFunction={easeQuadInOut}
                repeat
            >
                {value => {
                const roundedValue = Math.round(value);
                return (
                    <CircularProgressbar
                    value={value}
                    text={`${roundedValue}`}
                    /* disable the CSS animation. */
                    styles={buildStyles({ pathTransition: "none" })}
                    />
                );
                }}
            </AnimatedProgressProvider>

        
        </div>
    )
}

export default BusyFactor