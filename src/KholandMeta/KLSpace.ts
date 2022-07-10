import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { MainCharacter } from './Character';
import { OtherCharacter } from './OtherCharacter';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import {CombineControllerInput} from './CombineControllerInput';
import {Environment} from './Environment';
import {io} from "socket.io-client";
import {GameCircle} from './GameCircle';
import CannonDebugRenderer from '../utils/cannonDebugRenderer';
import { SocketType } from '../socketInterface';
import { MetaActionDto, MetaPlayerDto } from '../Dto';


const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1`;


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export class KLSpace {


  private _renderer:THREE.WebGLRenderer;
  private _scene:THREE.Scene;
  private _thirdPersonCamera:ThirdPersonCamera;
  private mainCharacter:MainCharacter;
  private otherCharacter1:OtherCharacter;
  private _previousRAF:number = null;
  private _domRoot:any;
  private _width:number;
  private _height:number;
  private environment:Environment;
  private combineControllerInput:CombineControllerInput;
  private otherCharacterMap:Map<string, OtherCharacter> = new Map();
  private charactersHeartBeat:Map<string, Number> = new Map();
  private socket:SocketType;
  private intentFor:string = null;
  private gameCircle:GameCircle;
  private _world: CANNON.World;
  private stats:Stats;
  private cannonDebugRenderer: CannonDebugRenderer;

  move(playerKeys){
    this.mainCharacter.action.forward = playerKeys.forward;
    this.mainCharacter.action.backward = playerKeys.backward;
    this.mainCharacter.action.left = playerKeys.left;
    this.mainCharacter.action.right = playerKeys.right;
    this.mainCharacter.action.space = playerKeys.space;
    this.mainCharacter.action.shift = playerKeys.shift;
  }

  private _handleIntent: CallableFunction;
  private _syncStatus: CallableFunction;
  private _showLoading: CallableFunction;
  private _modelLoaderProgress = 0;
  private _isMainCharacterLoaded = false;

  constructor(domRoot:any, token:string, handleIntent:CallableFunction, syncStatus:CallableFunction, showLoading:CallableFunction) {
    this._domRoot=domRoot;
    this._width=this._domRoot.clientWidth;
    this._height = this._domRoot.clientHeight;
    this._handleIntent = handleIntent;
    this._syncStatus = syncStatus;
    this._showLoading = showLoading;

    this.socket = io("https://young-stream-43548.herokuapp.com/meta",
    {
      auth: {
        token: token
      }
    }).connect()

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(0x6049B7);
    this._world = new CANNON.World();
    //this.stats = Stats();
    //document.body.appendChild(this.stats.dom);
    
    this.cannonDebugRenderer = new CannonDebugRenderer(this._scene, this._world);
    this._Initialize();

    const scope = this;
    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      scope._modelLoaderProgress = Math.ceil(itemsLoaded*100/itemsTotal);
      scope._showLoading(scope._isMainCharacterLoaded, scope._modelLoaderProgress);
    };
  }


  addEnvironment(){
    this.environment = new Environment();
    this.environment.load(this._scene);
  }

  _Initialize() {
    this._renderer = new THREE.WebGLRenderer({
      antialias:true, 
      alpha: true
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._renderer.setSize(this._width, this._height);

    this._domRoot.innerHTML = '';
    this._domRoot.append(this._renderer.domElement);

    this.gameCircle = new GameCircle(this._scene);

    this.addLights();
    this.addSky();
    this.addEnvironment();
    this.initSockets();
    this._RAF();

    (window as any).onresize = this._OnWindowResize;
  }


  IntendNo() {
    throw new Error('Method not implemented.');
  }

  IntendYes() {
    console.log("Yes clicked ", "Socket ", this.socket, "IntentFor ", this.intentFor)
    if(this.socket && this.intentFor){
      const status = this.otherCharacterMap.get(this.intentFor).Status
      this.socket.emit('metaStatusAction', {
        senderAddress: this.mainCharacter.PublicAddress,
        receiverAddress: this.intentFor,
        action: "yes",
        status: status
      })
    }
  }

  IntendCancel() {
    console.log("Cancel clicked ", "Socket ", this.socket, "IntentFor ", this.intentFor)
    if(this.socket && this.intentFor){
      const status = this.otherCharacterMap.get(this.intentFor).Status
      this.socket.emit('metaStatusAction', {
        action: "cancel",
        senderAddress: this.mainCharacter.PublicAddress,
        receiverAddress: this.intentFor,
        status: status
      })
    }
    this._handleIntent(4,{})
  }

  StatusUpdated(status:string) {
    this.mainCharacter.UpdateStatus(status)
  }

  StatusRemoved() {
    this.mainCharacter.UpdateStatus(null)
  }

  MyStatus(){
    if(!this.mainCharacter)return null
    return this.mainCharacter.Status ?? null
  }

  addGround(){
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x90ee90,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);
  }

  addSky(){
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      `${PUBLIC_URL}/images/skybox/right.png`,
      `${PUBLIC_URL}/images/skybox/left.png`,
      `${PUBLIC_URL}/images/skybox/top.png`,
      `${PUBLIC_URL}/images/skybox/bottom.png`,
      `${PUBLIC_URL}/images/skybox/front.png`,
      `${PUBLIC_URL}/images/skybox/back.png`,
    ]);
    texture.encoding = THREE.sRGBEncoding;
    this._scene.background = texture;
  }

  light = new THREE.DirectionalLight(0xcae6e9, 0.5);

  addLights(){
    const light = this.light;
    light.position.set(-100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    const side = 500;
    light.shadow.camera.left = side;
    light.shadow.camera.right = -side;
    light.shadow.camera.top = side;
    light.shadow.camera.bottom = -side;
    this._scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xcae6e9, 0.25);
    this._scene.add(ambientLight);

    // const shadowHelper = new THREE.CameraHelper( light.shadow.camera );
    // this._scene.add( shadowHelper );
  }

  addCharacter(
    id:string,
    publicAddress:string,
    status:string,
    characterId:string
  ) {

    const scope = this;

    scope._syncStatus(status)
    // const gender = ['m', 'f'];
    // const loadlCharacterId = `${gender[getRandomInt(2)]}_${getRandomInt(11)+1}`
    const initialPosition = new THREE.Vector3(getRandomInt(40), 0 , getRandomInt(40));

    // Remove character if one already exists; happends when reconncting after disconnecting
    if(this.mainCharacter){
      this.mainCharacter.Kill()
    }

    this.mainCharacter = new MainCharacter(
      id,
      this._scene, 
      characterId, 
      initialPosition,
      publicAddress,
      status,
      this.onMainCharacterLoaded
    );
    this.combineControllerInput = new CombineControllerInput(this.mainCharacter);
    this._thirdPersonCamera = new ThirdPersonCamera(this.mainCharacter, this._width, this._height);
  }

  onMainCharacterLoaded = () =>{
      // Set signal now.
      console.log("mainCharacter loaded");
      this._isMainCharacterLoaded = true;
      this.combineControllerInput.enableInput();
      this._showLoading(this._isMainCharacterLoaded, this._modelLoaderProgress);
  }

  initSockets = () => {

    const scope = this
    const socket = scope.socket;

    socket.on('connect', ()=>{
      console.log('connected');
    });

    socket.on('metaRegistered', (metaPlayer:MetaPlayerDto)=>{
      console.log('registered.data', metaPlayer);
      const _id:string = metaPlayer.id;
      const _publicAddress: string = metaPlayer.publicAddress;
      const _status: string = metaPlayer.status
      const _characterId = metaPlayer.characterId;

      this.addCharacter(
        _id,
        _publicAddress,
        _status,
        _characterId
      );
      
    });


    //Update when one of the users moves in space
    socket.on('metaRemoteData',  (metaPlayers:MetaPlayerDto[]) =>{

      const scope = this;
      const otherPlayerAddressSet: Set<String> = new Set();

      metaPlayers.forEach((playerData:MetaPlayerDto) => {
        otherPlayerAddressSet.add(playerData.publicAddress);
        if( scope.mainCharacter && scope.mainCharacter.PublicAddress == playerData.publicAddress){
          // scope.mainCharacter.UpdateStatus(playerData.status)
          // scope._syncStatus(playerData.status)
          return;
        }

        // otherplayes
        const publicAddress = playerData.publicAddress;
        const characterId = playerData.characterId;
        const positionVector = new THREE.Vector3(
          playerData.position.x,
          playerData.position.y,
          playerData.position.z);
        const status = playerData.status
        const statusVisible = playerData.statusVisible
        
        const newOtherPlayer = scope.otherCharacterMap.has(publicAddress)?
          scope.otherCharacterMap.get(publicAddress):
          new OtherCharacter(scope._scene, characterId, positionVector, publicAddress, statusVisible, ()=>{  });

        newOtherPlayer.ChangeState(playerData.state);
        newOtherPlayer.UpdatePosition(positionVector);
        newOtherPlayer.ChangeStatus(status)
        newOtherPlayer.ChangeStatusVisibility(statusVisible)
        scope.otherCharacterMap.set(publicAddress, newOtherPlayer);
        // scope.charactersHeartBeat[publicAddress] = new Date().getTime();

      });

    
      // const hearBeats = Object.keys(scope.charactersHeartBeat);
      // hearBeats.forEach((publicAddress:string)=>{
      //   const now = new Date().getTime();
      //   const lastHeartBeat = scope.charactersHeartBeat[publicAddress];
      //   if(now - lastHeartBeat > 10000){
      //     const otherPlayer = scope.otherCharacterMap.get(publicAddress);
      //     if(otherPlayer){
      //       otherPlayer.Kill()
      //       scope.otherCharacterMap.delete(publicAddress);
      //       scope.charactersHeartBeat.delete(publicAddress);
      //     }
        
      //   }
      // })

      scope.otherCharacterMap.forEach((otherPlayer:OtherCharacter)=>{
        if(!otherPlayerAddressSet.has(otherPlayer.publicAddress)){
            otherPlayer.Kill()
            scope.otherCharacterMap.delete(otherPlayer.publicAddress);
        }
    })

    });

    socket.on('metaStatusActionUpdated', (data: MetaActionDto) => {
      console.log("statusActionUpdated", data);

      const sender = data.senderAddress
      const receiver = data.receiverAddress
      const action = data.action

      if(action == 'cancel' && receiver == scope.mainCharacter.PublicAddress){
        //Stop the taking to game countdown if it is running
        scope._handleIntent(4, {});
      }
      else if(action == 'yes' && (receiver == scope.mainCharacter.PublicAddress || sender == scope.mainCharacter.PublicAddress)){
        scope._handleIntent(3, data);
      }

    })

  
    //   // Set player TTL and kil after 1 min.

    setInterval(this.sendLocation.bind(this), 100)

  }

  sendLocation() {
    const scope = this;
    if(!scope.socket || !scope.mainCharacter)return
    const publicAddress = scope.mainCharacter.PublicAddress;
    const position = scope.mainCharacter.Position;
    const rotation = scope.mainCharacter.Rotation;
    scope.socket.emit('metaMove', {
      id:scope.socket.id,
      publicAddress: publicAddress,
      position: {x:position.x,y:position.y,z:position.z},
      rotation: {x:rotation.x,y:rotation.y,z:rotation.z},
      state: scope.mainCharacter.StateName,
      status: scope.mainCharacter.Status,
      characterId:"",
      statusVisible:false
    });
  }

  _OnWindowResize() {
    this._thirdPersonCamera && this._thirdPersonCamera.resize(this._width, this._height);
    this._renderer && this._renderer.setSize(this._width, this._height);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();
      if(this._thirdPersonCamera){
        this._renderer.render(this._scene, this._thirdPersonCamera.getThreeCamera());
      }
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  private lightAngle = 0;
  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this.mainCharacter) {
      this.mainCharacter.Update(timeElapsedS);
    }

    if(this.stats){
      this.stats.update();
    }

    if(this.cannonDebugRenderer){
      this.cannonDebugRenderer.update();
    }

    if(this._thirdPersonCamera){
      const p = this._thirdPersonCamera.getThreeCamera().position;
      this.light.lookAt(p.x, p.y, p.z);
    }

    if(this.otherCharacter1){
      this.otherCharacter1.Update(timeElapsedS);
    }

    if(this.gameCircle){
      this.gameCircle.Update();
    }

    // if (this.speechBubble) {
        // const postion = this.otherCharacter1.Position;
        // const lookAt = this._thirdPersonCamera.getThreeCamera().position;
        // this.speechBubble.Update(postion, lookAt);
    // }

    const scope = this;
    this.otherCharacterMap.forEach((otherCharacter)=>{
      otherCharacter.Update(timeElapsedS);
    });

    if(this._thirdPersonCamera){
      this._thirdPersonCamera.Update(timeElapsedS);
    }

    if(scope.mainCharacter && scope.mainCharacter.Object){

    const characterBox = scope.mainCharacter.Box;
    if(characterBox){
      const matches = []
      scope.otherCharacterMap.forEach((otherPlayer: OtherCharacter, key: string) => {
        const otherBox = otherPlayer.Box;
        if(!otherBox) return;
        if(characterBox.intersectsBox(otherBox)){
          matches.push(otherPlayer);
        }
      });


      if(matches.length>0){
        const match = matches[0]
               
        if(!scope.intentFor){
          scope.intentFor = match.publicAddress
          scope._handleIntent(1, {receiver: match.publicAddress, status: match.Status});

          scope.otherCharacterMap.forEach((otherPlayer: OtherCharacter, key: string) => {
            if(otherPlayer.publicAddress == match.publicAddress){
              otherPlayer.ShowStatus(true);
            }
            else{
              otherPlayer.ShowStatus(false);
            }
          })
        }
        
      }
      else{
        scope.intentFor = null
        scope._handleIntent(2, {});
        scope.otherCharacterMap.forEach((otherPlayer: OtherCharacter, key: string) => {
          otherPlayer.ShowStatus(false);
        })
      }
 

    }

  }

  }

}

