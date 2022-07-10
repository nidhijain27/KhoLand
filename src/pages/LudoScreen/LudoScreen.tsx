import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom';
import './LudoScreen.css';
import './Animate.css';
import { Box, Stack } from '@mui/material';
import { LudoClient } from './LudoClient';
import { GameCanvas } from './GameCanvas';
import { GameControl } from './GameControl';

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1/games/ludo`;

export const LudoScreen = props => {

    const divRef = useRef();
    let ludoClient: LudoClient;
    const [searchParams, setSearchParams] = useSearchParams();
    const [winner, setWinner] = useState("")
    const [winnerColor, setWinnerColor] = useState("")

    const winnersListCallback = useCallback((winner: string, color: string) => {
        console.log(`winnersListCallback-in winner:${winner}`);
        setWinner(winner);
        setWinnerColor(color);
        //setWinner(`${winner} (${color}) has won the game`);  //todo cobgrats //better luck grafic
    }, []);

    useEffect(() => {
        const div = divRef.current
        if (div) {
            if (!ludoClient) {
                const tokenFromUrl = searchParams.get('token')
                ludoClient = new LudoClient(document, tokenFromUrl, winnersListCallback);
            }
        }
    }, []);

    const getRandomNumberBetween0And2 = () => {
        return (Math.floor(Math.random() * 10) + 1)%3;
    }
    
    const Joining = (props) => {
        return (
            <div id="connectingDialogue" className="menu hidden">
                <div>
                    <p>Connecting...</p>
                </div>
            </div>);
    }

    const Waiting = (props) => {
        return (
            <div id="waitingDialogue" className="waitingForPlayers hidden">
                <p className='text'></p>
            </div>);
    }

    const StartMenu = (props) => {
        return (<div id="startGameDialogue" className="menu hidden">
            <div>
                <h4 >Crypto Ludo</h4>

                {/* <h4>Rules</h4> */}

                <ul>
                    <li style={{textAlign: 'left'}}>First person to take first piece home wins</li>
                    <li style={{textAlign: 'left'}}>One Pass will be consumed for one gameplay</li>
                    <li style={{textAlign: 'left'}}>Winner wins 1.6 $KHO</li>
                </ul>
                
                {/* <p>Select Player Numbers</p> */}
                <button id='gameMode2'>2 players</button>
                <button id='gameMode3' className="hidden">3 players</button>
                <button id='gameMode4' className="hidden">4 players</button>
            </div>
        </div>);
    }

    const GameOver = (props) => {

        const randomNumber = getRandomNumberBetween0And2()

        return (
            <div id="endGameDialogue" className="menu hidden">
                {winner == "You" && (
                    <Box sx={{
                         background: 'url(' + `${PUBLIC_URL}/images/GIFS/winning.gif` + ') center center no-repeat' }}>
                        <h4>Congratulations!</h4>
                        <img className="trofy" src={`${PUBLIC_URL}/images/trofy.svg`} alt="" />
                        <p><b>{winner}</b> ({winnerColor})<br/>have won 10 KHO!</p>
                    </Box>)}
                {winner !== "You" && (<div>
                    <h4>Better luck lext time!</h4>
                    <p><b>{winner}</b> ({winnerColor})<br/>have won 10 KHO.<br/><br/>May be you can also win in next game.</p>
                </div>)}

                <button id='home' onClick={() => {
                    console.log("Home Button Clicked")
                    try {
                        // @ts-ignore
                        Android.backToHome()
                    }
                    catch (err) {
                        console.log("Play Again Click Error: ", err)
                    }
                }}>Home</button>

                {randomNumber == 0 && (
                    <button id='playAgain' onClick={() => {
                        console.log("Play Again Button Clicked")
                        window.location.reload()
                    }}>Play Again</button>
                )}

                {randomNumber == 1 && (
                    <button id='joinDiscord' onClick={() => {
                        console.log("Home Button Clicked")
                        try {
                            // @ts-ignore
                            Android.joinDiscord()
                        }
                        catch (err) {
                            console.log("Play Again Click Error: ", err)
                        }
                    }}>Join Discord</button>
                )}

                {randomNumber == 2 && (
                    <button id='refer' onClick={() => {
                        console.log("Refer Button Clicked")
                        try {
                            // @ts-ignore
                            Android.refer()
                        }
                        catch (err) {
                            console.log("Play Again Click Error: ", err)
                        }
                    }}>Refer & Earn 10 passes</button>
                )}

            </div >
        )
    }

    const GameScreen = (props) => {
        return (<Stack
            id="startGame"
            className="hidden"
            spacing={0}
            direction="column"
            justifyContent="center">
            <GameCanvas />
            <GameControl />
            <div className="gameOver" />
        </Stack>);
    }
    
    const AppContainer = (props) => {
        return (<div ref={divRef} >
            <Joining />
            <StartMenu />
            <Waiting />
            <GameScreen />
            <GameOver />
        </div>);
    }

    return (
        <Stack
            spacing={0}
            direction="column"
            justifyContent="center"
            sx={{
                background: `url("${PUBLIC_URL}/images/back.jpg")`,
                height: '100vh',
                width: '100wh',
            }}>
            <Stack
                spacing={0}
                direction="row"
                justifyContent="center">
                <AppContainer />
            </Stack>
        </Stack>);
}

export default LudoScreen;