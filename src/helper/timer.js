import React, { useState, useEffect } from 'react';

export function Timer({ initialCount }) {
    // const [time, setCount] = useState(initialCount);

    // const [timer, setTimer] = useState(1);

    //     useEffect(() => {
    //     const timerId = setInterval(() => setTimer(timer + 1), 1000);

    //     return () => <div>time: {timer}</div>;
    //     });

    const [count, setCount] = useState(0);

    return (
        <div className="timer">
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );

    // setCount = setInterval(function () {
    //     var delta = Date.now() - time; // milliseconds elapsed since start
    //     // const secondsDelta = Math.floor(delta / 1000);
    //     // console.log(secondsDelta); // in seconds
    //     // alternatively just show wall clock time:
    //     // console.log(new Date().toUTCString());
    //     setCount(time + 1);
    //   }, 1000); // update about every second

    // return (
    //   <>
    //     <div>time: {time}</div>
    //     <button onClick={() => setCount(initialCount)}>Reset</button>
    //     <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
    //     <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
    //   </>
    // );
}