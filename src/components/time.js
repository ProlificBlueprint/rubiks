import React, { Component } from "react";

let setInervalTimer;

export default class Time extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clock: 0,
        };
    }

    componentDidMount() {
        if (this.props.isClockRunning) this.onStartClock();
    }

    componentDidUpdate(prevProps, _prevState) {
        if (this.props.isClockRunning !== prevProps.isClockRunning) {
            if (this.props.isClockRunning) setInervalTimer = this.onStartClock();
        }

        if (this.props.isGameOver !== prevProps.isGameOver) {
            if (this.props.isGameOver) {
                console.log('this.state.clock => ', this.state.clock);
                this.props.onGameComplete(this.state.clock);
                this.onResetClock();
            }
        }
    }

    setClock = (time) => {
        this.setState({ clock: time })
    }

    onStartClock = () => {
        return setInterval(() => {
            let startTime = parseInt(this.state.clock);
            this.setState({ clock: startTime + 1 });
        }, 1000); // update about every second
    }

    onResetClock = () => {
        clearInterval(setInervalTimer);
        this.setState({ clock: 0 });
    }


    formatDoubleDigit = (time) => {
        if (time < 10) {
            return `0${time}`
        } else {
            return time;
        };
    }

    parseClock = (time) => {
        return time < 60 ? `00 : ${this.formatDoubleDigit(time)}` : `${this.formatDoubleDigit(Math.floor(time / 60))} : ${this.formatDoubleDigit(time % 60)}`;
    }


    render() {
        return (
            <>
                <div className="timer">
                    {this.parseClock(this.state.clock)}
                </div>
            </>)
    }
}