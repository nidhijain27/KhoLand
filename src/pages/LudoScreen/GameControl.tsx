import React from 'react'
import './Dice.css';

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1/games/ludo`;

export const GameControl = props =>  {
    
    return (<div className="properties-wrapper">
        <div className="properties">
            <div className="messages">
                <div className="emojis">
                    <img id="gif-angry" className="emoji" src={`${PUBLIC_URL}/images/GIFS/angry.gif`} alt=""/>
                    <img id="gif-blown" className="emoji" src={`${PUBLIC_URL}/images/GIFS/blown.gif`} alt=""/>
                    <img id="gif-crazy" className="emoji" src={`${PUBLIC_URL}/images/GIFS/crazy.gif`} alt=""/>
                    <img id="gif-poo" className="emoji" src={`${PUBLIC_URL}/images/GIFS/poo.gif`} alt=""/>
                    <img id="gif-oh_no" className="emoji" src={`${PUBLIC_URL}/images/GIFS/oh_no.gif`} alt=""/>
                </div>
            </div>
            <div className='control-wrapper'> 
            <span id="playerIndicator"></span>
            <div className = 'dice-container gif'>
                <div id="dice" className='dice'>
                    <div className='face' data-id='1'>
                        <div className="point point-middle point-center">
                        </div>
                    </div> 
                    <div className='face' data-id='2'>
                        <div className="point point-top point-right">
                        </div>
                        <div className="point point-bottom point-left">
                        </div>
                    </div> 
                    <div className='face' data-id='6'>
                        <div className="point point-top point-right">
                        </div>
                        <div className="point point-top point-left">
                        </div>
                        <div className="point point-middle point-right">
                        </div>
                        <div className="point point-middle point-left">
                        </div>
                        <div className="point point-bottom point-right">
                        </div>
                        <div className="point point-bottom point-left">
                        </div>
                    </div>
                    <div className='face' data-id='5'>
                        <div className="point point-top point-right">
                        </div>
                        <div className="point point-top point-left">
                        </div>
                        <div className="point point-middle point-center">
                        </div>
                        <div className="point point-bottom point-right">
                        </div>
                        <div className="point point-bottom point-left">
                        </div>
                    </div>
                    <div className='face' data-id='3'>
                        <div className="point point-top point-right">
                        </div>
                        <div className="point point-middle point-center">
                        </div>
                        <div className="point point-bottom point-left">
                        </div>
                    </div>
                    <div className='face' data-id='4'>
                        <div className="point point-top point-right">
                        </div>
                        <div className="point point-top point-left">
                        </div>
                        <div className="point point-bottom point-right">
                        </div>
                        <div className="point point-bottom point-left">
                        </div>
                    </div>  
                </div>
            </div> 
            <div id="playerTimer"></div>
            </div>
        </div>
    </div>);
}