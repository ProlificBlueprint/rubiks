import React, { Component } from "react";
import { BsChevronDown, BsChevronLeft, BsChevronRight, BsChevronUp } from 'react-icons/bs';

// Functional
export default class Controls extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.startClock) {
            this.onStartClock();
        }
    }


    directionalButtonPress = (e) => {
        e.preventDefault();
        const dir = e.target.getAttribute("data-direction");
        this.props.onMoveGamePieceByDirection(dir);
    }


    render() {
        return (
            <>
                <div className="gameControls">
                    <div className="move_block_direction">
                        <div className="direction_content">
                            <button className={"direction_div top_direction active"} onClick={this.directionalButtonPress} data-direction="ArrowUp">
                                {<BsChevronUp data-direction="ArrowUp" />}
                            </button>
                            <button className="direction_div left_direction active" onClick={this.directionalButtonPress} data-direction="ArrowLeft">
                                {<BsChevronLeft data-direction="ArrowLeft" />}
                            </button>
                            <button className="direction_div bottom_direction active" onClick={this.directionalButtonPress} data-direction="ArrowDown">
                                {<BsChevronDown data-direction="ArrowDown" />}
                            </button>
                            <button className="direction_div right_direction active" onClick={this.directionalButtonPress} data-direction="ArrowRight">
                                {<BsChevronRight data-direction="ArrowRight" />}
                            </button>

                            <div className="centerEmpty"></div>
                            <div className="topLeftCorner"></div>
                            <div className="topRightCorner"></div>
                            <div className="bottomLeftcorner"></div>
                            <div className="bottomRightCorner"></div>
                        </div>
                    </div>
                </div>
            </>)
    }
}