import {io} from "socket.io-client";
import $ from 'jquery';
import {Howl, Howler} from 'howler';
import { SocketType } from '../../socketInterface';
import { TurnResult } from "../../Dto";

const CONSTANTS = {
    defaultColors: ['red', 'green', 'yellow', 'blue']
}

enum GameStatus {
    LOADING,
    SELECT_MODE,
    WAITING,
    GAME_START,
    GAME_OVER,
  }

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1/games/ludo`;
const BACKEND_URL = `https://young-stream-43548.herokuapp.com`;
// const BACKEND_URL = `http://localhost:8000`;

  type PlayerDTO  = {
                socketId: string;
                playerColor: string;
                playerIndex: number;
                nickName: string;
            };

export class LudoClient {

    GAMEDATA:any = {
        playerIds: [],
        playerIndex: '',
        movableGottis: [],
        currentPlayerColor: '',
    }

    gameMode:number;
    rootDiv:Document;
    sock:SocketType;
    winnersListUpdateCallback:CallableFunction;
    sound:Howl;
    countDownTimer:NodeJS.Timer;

    constructor(rootDiv:any,token:string, winnersListUpdateCallback:CallableFunction){
        console.log(`LudoClient-In token:${token}`);
        
        this.sound = new Howl({
            src: [`${PUBLIC_URL}/sounds/dice.wav`],
            html5: true
          });

        this.rootDiv = rootDiv;
        this.sock = io(`${BACKEND_URL}/ludo`, {
            transports : ['websocket'],
            auth: {
                token: token
            }
        });
        this.winnersListUpdateCallback=winnersListUpdateCallback;
        this.init();
        this.initClick();
        const scope = this;
    }

    emitJoinGame(gameType:number){
        console.log(`emit:joinGame-${gameType}`);
        this.sock.emit("ludoJoinGame", gameType);
    }

    private emitRoll(){
        console.log("emitRoll");
        this.sock.emit("ludoRoll");
    }

    initClick(){
        const scope = this;

        const diceElement:HTMLElement = this.rootDiv.getElementById("dice");
        diceElement.addEventListener("click", (event)=>scope.emitRoll());

        const gameMode2 = this.rootDiv.getElementById("gameMode2");
        const gameMode3 = this.rootDiv.getElementById("gameMode3");
        const gameMode4 = this.rootDiv.getElementById("gameMode4");
        gameMode2.addEventListener("click", (event)=>scope.emitJoinGame(2));
        gameMode3.addEventListener("click", (event)=>scope.emitJoinGame(3));
        gameMode4.addEventListener("click", (event)=>scope.emitJoinGame(4));

        const emojis = this.rootDiv.querySelectorAll(`.emoji`);
        emojis.forEach(emoji=>{
            emoji.addEventListener("click", (event:MouseEvent)=>{
                const target:any = event.target;
                const emotion = target.id.split("-")[1];
                scope.sendMessage(`${PUBLIC_URL}/images/GIFS/${emotion}.gif`);
            })
        });
        
    }

    canRoll = true;

    getRandomInt = (max:number) => {
        return Math.floor(Math.random() * max);
    }

    rollEnd = (number:number,color:string)=>{
        const scope = this;
        this.canRoll=false;

        const xTurn = 4 + this.getRandomInt(8);
        const yTurn = 4 + this.getRandomInt(8);

        const delay=200;
        const angleX=90 * xTurn;
        const angleY=90 * yTurn;

        const dice = scope.rootDiv.getElementById("dice");
        dice.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        dice.style.transitionDuration =`${delay}ms`;
        
        const degree = {
            6:{x:180,y:180},
            5:{x:0,y:270},
            4:{x:270,y:180},
            3:{x:90,y:180},
            2:{x:0,y:90},
            1:{x:0,y:180}
          }

        setTimeout(() => {
            const d = degree[number];
            console.log("dice numner is", number, d);
            dice.style.transform = `rotateX(${d.x}deg) rotateY(${d.y}deg)`;
          }, delay)

    }

    updateScreen(status:GameStatus){
        const connecting = this.rootDiv.getElementById("connectingDialogue");
        const startGame = this.rootDiv.getElementById("startGameDialogue");
        const waiting = this.rootDiv.getElementById("waitingDialogue");
        const gameScreen = this.rootDiv.getElementById("startGame");
        const gameOver = this.rootDiv.getElementById("endGameDialogue");

        const allScreen:HTMLElement[] = [connecting, startGame, waiting, gameScreen, gameOver];
        allScreen.forEach((element:HTMLElement)=>{
            element.classList.add("hidden");
        })
        switch(status){
            case GameStatus.LOADING: 
                connecting.classList.remove("hidden");
                break;
            case GameStatus.SELECT_MODE: 
                startGame.classList.remove("hidden");
                break;
            case GameStatus.WAITING:
                // Waiting for {gameMode-1} players!
                waiting.firstChild.textContent=`Waiting for ${this.gameMode} players!`;
                waiting.classList.remove("hidden");
                break;
            case GameStatus.GAME_START:
                gameScreen.classList.remove("hidden");
                break;
            case GameStatus.GAME_OVER:
                gameOver.classList.remove("hidden");
                break;
        }
    }

    playAgain() {
        this.updateScreen(GameStatus.SELECT_MODE)
    }

    createGotti = (gottiId:string):HTMLImageElement => {
        const color = gottiId.split("-")[0];
        const gotti = document.createElement("img");
        gotti.classList.add("Gotti");
        gotti.id = gottiId;
        gotti.src = `${PUBLIC_URL}/images/gottis/${color}.png`;
        gotti.addEventListener("click", (ev: MouseEvent)=>{
          console.log(`ludoGottiClicked ${gottiId}`);
          this.sock.emit("ludoGottiClicked", gottiId);
        });
        return gotti;
      }

    init(){
        const sock = this.sock;
        const scope = this;

        scope.updateScreen(GameStatus.LOADING);

        scope.sock.on("connect_error", (err:any) => {
            console.log("Socket.on: connect_error");
            console.error(`connect_error due to ${err.message}`);
            console.error(err)
        });

        scope.sock.on("connect", () => {
            console.log("Socket.on: connect");
            console.log(scope.sock.id);
            scope.updateScreen(GameStatus.SELECT_MODE);
        });
        
        sock.on("ludoWaitForPlayers", (gameMode:number) => {
            console.log("Socket.on: waitForPlayers");
            scope.gameMode = gameMode;
            scope.updateScreen(GameStatus.WAITING);
        })
      
        sock.on("ludoStartGame", (availablePlayers:PlayerDTO[]) => {
            console.log("Socket.on: startGame", availablePlayers);
            scope.updateScreen(GameStatus.GAME_START);

            availablePlayers.forEach((player :PlayerDTO) => {
                console.log(player)
                  //adding profile pictures
                  let profilePic = document.createElement("img");
                  let name = document.createElement("h1");
                  name.classList.add("name")
                  if(player.socketId==sock.id){
                    name.innerText = `${player.nickName} (You)`;
                  }else{
                    name.innerText = player.nickName;
                  }
                  profilePic.src = `${PUBLIC_URL}/images/pp.png`
                  profilePic.classList.add("profilePic");
                  this.rootDiv.querySelector(`.${player.playerColor}.home`).appendChild(profilePic);
                  this.rootDiv.querySelector(`.${player.playerColor}.home`).appendChild(name);
                  //placing gottis in positions

                  for (let j = 0; j < 4; j++) {
                      const gottiId = `${player.playerColor}-${j}`
                      const gotti = scope.createGotti(gottiId);
                      const selector = `.home_${player.playerColor}.inner_space`;
                      let pnt = this.rootDiv.querySelectorAll(selector);
                      pnt[j].appendChild(gotti);
                  }
            });
        
        })
        
        sock.on("ludoShowMessage", (sender:PlayerDTO, message:string) => {
            console.log("Socket.on: showMessage", sender, message);
            scope.showMessage(message, sender.playerColor)
        })
          
        sock.on("ludoGameOver", (winner:PlayerDTO) => {
            console.log("Socket.on: gameOver");
            if (sock.id === winner.socketId) {
                scope.winnersListUpdateCallback("You", winner.playerColor)
            }else{
                scope.winnersListUpdateCallback(winner.nickName, winner.playerColor)
            }
            scope.updateScreen(GameStatus.GAME_OVER);
        })
        
        sock.on("ludoPlayerIndicator", (player:PlayerDTO) => {
            console.log(`Socket.on: playerIndicator sock.id:${sock.id} currentPlayerSocketId:${player.socketId}`);
            
            scope.removeShakeAnimation();
            let all = scope.rootDiv.querySelectorAll(".home .profilePic");
            for (let i = 0; i < all.length; i++) {
                if (all[i].className.includes("highLight")) {
                    all[i].classList.remove("highLight");
                    break;
                }
            }
            let home = scope.rootDiv.querySelector(`.${player.playerColor}.home .profilePic`);
            home.classList.add('highLight');
            let turn = "";
            scope.rootDiv.querySelector(".gif").classList.remove("heartBeat");
            if (sock.id === player.socketId) {
                turn = `Your turn`
                this.canRoll=true;
                scope.rootDiv.querySelector(".gif").classList.add("heartBeat");
            }else{
                turn = `${player.playerColor} turn`
            }
            const playerIndicator = scope.rootDiv.getElementById("playerIndicator");
            playerIndicator.textContent = turn;

            const playerTimer = scope.rootDiv.getElementById("playerTimer");
            let duration = 10;
            if(scope.countDownTimer){
                clearInterval(scope.countDownTimer)
            }
            scope.countDownTimer = setInterval(function() {
                duration-=1;
                playerTimer.innerHTML = duration.toString();
                // If the count down is finished, write some text
                if (duration < 1) {
                  clearInterval(scope.countDownTimer);
                  playerTimer.innerHTML = "";
                }
              }, 1000);
        })

        sock.on("ludoRemovePlayer", (player:PlayerDTO) => {
            console.log(`Socket.on: removePlayer color:${player.playerColor}`);
            scope.removePlayer(player.playerColor);

        })
        
        sock.on("ludoRollTheDice", (currentPlayer: PlayerDTO, diceNumber: number) => {
            console.log("Socket.on: rollTheDice");
            console.log(`Dice color:${currentPlayer.playerColor}`);
            scope.sound.play();
            scope.removeShakeAnimation();
            scope.rollEnd(diceNumber, currentPlayer.playerColor);
        })
        
        sock.on("ludoMoveGotti", async (gottiId:string, turnResult:TurnResult) => {
            console.log(`Socket.on: moveGotti gottiId=${gottiId}, result${turnResult}`);
            console.log(turnResult);

            const turnType = turnResult.type;
            const path = turnResult.path;
            const homeGotti = turnResult.homeGotti;
            const killedGotti = turnResult.killedGotti;

            scope.removeShakeAnimation();
            if(turnType=="moveGotti"){
                await scope.moveGotti(gottiId, path, homeGotti, killedGotti);
            }else if(turnType=="getGottiOut"){
                await scope.gottiOut(gottiId, path[0]);
            }
            sock.emit("ludoFinishedMoving");
        })
        
        sock.on("ludoAddShakeAnimation", (movableGottis:string[]) => {
            console.log("Socket.on: addShakeAnimation");
            setTimeout(()=>{
                movableGottis.forEach((gottiId:string) => {
                    var d = scope.rootDiv.getElementById(gottiId);
                    d.classList.add("useMe")
                });
            }, 500);
        })
    }

    async gottiOut(gottiId, position){
        const fd = this.rootDiv.getElementById(position);
        const g = this.rootDiv.getElementById(gottiId);
        fd.appendChild(g);
        let fdLen = fd.getElementsByClassName("Gotti")
        if (fdLen.length == 2) {
            fd.classList.add("twoGotti")
        } else if (fdLen.length > 2) {
            fd.classList.add("multipleGotti")
        }
    }

    async moveGotti(gottiId:string, path:number[], homeGotti:string, killedGotti:string){
        const scope=this;
        let g = scope.rootDiv.getElementById(gottiId);
        let fd;
        for (let i = 0; i < path.length - 1;) {
            fd = scope.rootDiv.getElementById(path[i].toString());
            //if two gottis incountered in the way removes the classes that makes them smaller
            const fdGottis = fd.getElementsByClassName("Gotti");
            if (fdGottis.length <= 2) {
                fd.classList.remove("twoGotti")
            } else if (fdGottis.length == 3) {
                fd.classList.remove("multipleGotti");
            }
            //if the gotti has reached the finish line
            i++;
            fd = this.rootDiv.getElementById(path[i].toString());
            if (fd) {
                const fdGottis = fd.getElementsByClassName("Gotti");
                //checks the position for any opponents or powerups
                await new Promise(r => setTimeout(r, 200))
                if (fdGottis.length === 2) fd.classList.add("twoGotti")
                else if (fdGottis.length > 2) fd.classList.add("multipleGotti")
                fd.appendChild(g);
            }
            if (i == path.length - 1) {
                if (killedGotti) scope.killGotti(killedGotti);
                if (homeGotti) scope.gottiHome(homeGotti);
            }
        }
    };

    removePlayer(color:string){
        let name = this.rootDiv.querySelector(`.${color} .name`);
        name.parentElement.removeChild(name);
        let profile = this.rootDiv.querySelector(`.${color} .profilePic`);
        profile.parentElement.removeChild(profile);
        for (let i = 0; i < 4; i++) {
            let gotti = this.rootDiv.querySelector(`#${color}-${i}`);
            if (gotti) {
                gotti.parentElement.removeChild(gotti);
            }
        }
    }

    get AllGottis():string[]{
        const gotti=[];
        const colors = ["red", "blue", "green", "yellow"];
        for(let i=0;i<4;i++){
            for(let j=0;j<4;j++){
                const gottiId = `${colors[i]}-${j}`;
                gotti.push(gottiId);
            }
        }
        return gotti;
    }

    removeShakeAnimation () {
        console.log("removeShakeAnimation-in");
        this.rootDiv.querySelector(".gif").classList.remove("heartBeat");
        this.AllGottis.forEach((gottiId:string)=>{
            const gotti = this.rootDiv.querySelector(`#${gottiId}`);
            if (gotti && gotti.classList.contains("useMe")) {
                gotti.classList.remove("useMe")
            }
        });
    }
    
    showMessage(text:string, color:string){
        const d = this.rootDiv.querySelector(`.${color}.home .message`);
        let p:any;
        if (!text.includes(".gif")) {
            p = document.createElement("p");
            p.innerHTML = text;
        } else {
            p = document.createElement("img")
            p.src = text;
        }
        d.appendChild(p)
        setTimeout(() => {
            d.removeChild(p)
        }, 3000);
    }

    sendMessage(message:string){
        if (message) {
            this.sock.emit("ludoSendMessage", message);
        }
    }
    
    killGotti(killedGottiId:string){
        let color = killedGottiId.split("-")[0];
        let spots = this.rootDiv.getElementsByClassName("home_" + color);
        for (let j = 0; j < spots.length; j++) {
            if (spots[j].children.length == 0) {
                spots[j].appendChild(this.rootDiv.querySelector("#" + killedGottiId))
                break;
            }
        }
    }
    
    gottiHome(gottiId:string){
        let color = gottiId.split("-")[0];
        let gotti = this.rootDiv.querySelector('#' + gottiId);
        this.rootDiv.querySelector(".finished_" + color).appendChild(gotti);
        console.log(gotti);
        console.log(this.rootDiv.querySelector(".finished_" + color))
    }
}








