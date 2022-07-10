import React, { useRef, useEffect, useState, useCallback } from 'react'

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1/games/ludo`;

const Home = (props) => {
    const {color} = props;
    return (<section className={`box box_${color}`}>
        <div className={`${color} home`}>
            <div className="message"/>
            <div className={`home_${color} inner_space`}/>
            <div className={`home_${color} inner_space`}/>
            <div className={`home_${color} inner_space`}/>
            <div className={`home_${color} inner_space`}/>
        </div>
    </section>);
}
const PathGreen = (props) => {
    return (<section className="path vertical">
    <article>
        <div className="vertical_green" id="50"></div>
        <div className="vertical_green" id="51"></div>
        <div className="vertical_green" id="52"></div>
    </article>
    <article>
        <div className="vertical_green " id="49"></div>
        <div className="vertical_green green" id="100"></div>
        <div className="vertical_green green hasStar" id="1">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
    </article>
    <article>
        <div className="vertical_green finalPath hasStar" id="48">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
        <div className="vertical_green green " id="101"></div>
        <div className="vertical_green" id="2">
        </div>
    </article>
    <article>
        <div className="vertical_green" id="47"></div>
        <div className="vertical_green green" id="102">
        </div>
        <div className="vertical_green" id="3"></div>
    </article>
    <article>
        <div className="vertical_green" id="46">
        </div>
        <div className="vertical_green green" id="103"></div>
        <div className="vertical_green" id="4"></div>
    </article>
    <article>
        <div className="vertical_green" id="45"></div>
        <div className="vertical_green green" id="104"></div>
        <div className="vertical_green" id="5"> </div>
    </article>
</section>);
}
const PathYellow = (props) => {
    return (<section className="path horizontal">
    <article>
        <div className="horizontal_yellow" id="6">
        </div>
        <div className="horizontal_yellow yellow" id="114"></div>
        <div className="horizontal_yellow" id="18"></div>
    </article>
    <article>
        <div className="horizontal_yellow" id="7">
        </div>
        <div className="horizontal_yellow yellow" id="113"></div>
        <div className="horizontal_yellow" id="17"></div>
    </article>
    <article>
        <div className="horizontal_yellow" id="8"></div>
        <div className="horizontal_yellow yellow" id="112"></div>
        <div className="horizontal_yellow" id="16"></div>
    </article>
    <article>
        <div className="horizontal_yellow finalPath hasStar" id="9">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
        <div className="horizontal_yellow yellow" id="111"></div>
        <div className="horizontal_yellow" id="15"></div>
    </article>
    <article>
        <div className="horizontal_yellow" id="10">
        </div>
        <div className="horizontal_yellow yellow" id="110"></div>
        <div className="horizontal_yellow yellow hasStar" id="14">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
    </article>
    <article>
        <div className="horizontal_yellow" id="11"></div>
        <div className="horizontal_yellow" id="12"></div>
        <div className="horizontal_yellow " id="13"></div>
    </article>
</section>);
}
const PathRed = (props) => {
    return (<section className="path horizontal">
    <article>
        <div className="horizontal_red" id="39"></div>
        <div className="horizontal_red" id="38"></div>
        <div className="horizontal_red" id="37"></div>
    </article>
    <article>
        <div className="horizontal_red red  hasStar" id="40">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
        <div className="horizontal_red red" id="130">
        </div>
        <div className="horizontal_red " id="36">
        </div>
    </article>
    <article>
        <div className="horizontal_red" id="41">
        </div>
        <div className="horizontal_red red" id="131">
        </div>
        <div className="horizontal_red finalPath hasStar" id="35">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
    </article>
    <article>
        <div className="horizontal_red" id="42"></div>
        <div className="horizontal_red red" id="132">
        </div>
        <div className="horizontal_red" id="34"></div>
    </article>
    <article>
        <div className="horizontal_red" id="43"></div>
        <div className="horizontal_red red" id="133">
        </div>
        <div className="horizontal_red" id="33"></div>
    </article>
    <article>
        <div className="horizontal_red" id="44"></div>
        <div className="horizontal_red red" id="134">
        </div>
        <div className="horizontal_red" id="32"></div>
    </article>
</section>);
}
const PathBlue = (props) => {
    return (<section className="path vertical">
    <article>
        <div className="vertical_blue" id="31"></div>
        <div className="vertical_blue blue" id="124"></div>
        <div className="vertical_blue" id="19"></div>
    </article>
    <article>
        <div className="vertical_blue" id="30"></div>
        <div className="vertical_blue blue" id="123"></div>
        <div className="vertical_blue" id="20"></div>
    </article>
    <article>
        <div className="vertical_blue" id="29"></div>
        <div className="vertical_blue blue" id="122"></div>
        <div className="vertical_blue" id="21"></div>
    </article>
    <article>
        <div className="vertical_blue" id="28"></div>
        <div className="vertical_blue blue" id="121"></div>
        <div className="vertical_blue finalPath hasStar" id="22">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
    </article>
    <article>
        <div className="vertical_blue blue hasStar" id="27">
            <img className='star' onClick={()=> false} src={`${PUBLIC_URL}/images/star.png`}/>
        </div>
        <div className="vertical_blue blue" id="120"></div>
        <div className="vertical_blue " id="23"></div>
    </article>
    <article>
        <div className="vertical_blue" id="26"></div>
        <div className="vertical_blue " id="25"></div>
        <div className="vertical_blue " id="24"></div>
    </article>
</section>);
}
const CenterHome = (props) => {
    return (<div className="innerHome">
    <div className="finished_green multipleGotti">
    </div>
    <div className="mid">
        <div className="finished_red multipleGotti">
        </div>
        <div className="finished_yellow multipleGotti">
        </div>
    </div>
    <div className="finished_blue multipleGotti"></div>
</div>);
}

export const GameCanvas = props => {

    return (     
    <div id="Canvas">
        <Home color="red"/>
        <PathGreen/>
        <Home color="green"/>
        <PathRed/>
        <CenterHome/>
        <PathYellow/>
        <Home color="blue"/>
        <PathBlue/>
        <Home color="yellow"/>
    </div>);
}
