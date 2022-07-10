import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {CharacterFSM} from './CharacterStateMachine';
import { Object3D } from 'three';

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1`;
class BasicCharacterControllerProxy {

  private  _animations:THREE.AnimationClip;
  constructor(animations:THREE.AnimationClip) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

const ANIMATIONS = ['Dance', 'Idle', 'Run', 'Walk', 'Win', 'Sad'];
const SCALE = 12.9;
export const STATUS_SCALE = {'chess':0.11,'ludo':0.11, 'car':1}
export class OtherCharacter {
  private scene:THREE.Scene;
  private _stateMachine:CharacterFSM;
  public _target:THREE.Object3D;
  private _mixer:THREE.AnimationMixer;
  private _animations:any;
  private _characterId:string;
  private _initialPosition=new THREE.Vector3();
  private _positionToReach = new THREE.Vector3();
  private loadingDone = false
  private _onLoadModel:CallableFunction;
  private _publicAddress:string;
  private _lastHeartBeat:number;
  
  private _gltfLoader = new GLTFLoader();
  private _statusLoadingStatus = 'none'

  private _statusIdentifier:string;
  private _statusLoading: boolean
  private _statusVisible: boolean
  private _showStatusInProximity: boolean
  private _statusObject: Object3D

  private statusRotationAxis = new THREE.Vector3(0.5,1,0).normalize()
	private rad = 0.05

  private _ringGeometry = new THREE.RingGeometry( 10, 10.2, 32 );
  private _ringMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
  private _ringMesh = new THREE.Mesh( this._ringGeometry, this._ringMaterial );


  constructor(
    scene:THREE.Scene, 
    characterId:string, 
    position:THREE.Vector3,
    publicAddress: string, 
    statusVisible: boolean, 
    onLoad:CallableFunction) {
    this.scene=scene;

    // const gender = ['m', 'f'];
    // const loadlCharacterId = `${gender[this.getRandomInt(2)]}_${this.getRandomInt(11)+1}`

    this._characterId=characterId;
    this._onLoadModel = onLoad;
    this._initialPosition.copy(position);
    this._positionToReach.copy(position);
    this._publicAddress = publicAddress;
    this._statusLoading = false;
    this._statusVisible = statusVisible
    this._animations = {};
    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));
    //this._LoadModels();


    const loader = new GLTFLoader();
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    // TODO: Fix f_8, f_11 not working.
    if(this._characterId == 'f_8' || this._characterId == 'f_11'){
      this._characterId = 'f_1';
    }
    const gender = this._characterId[0];
    const animationDir = `${PUBLIC_URL}/models/characters/animation`;

    const characterUrl = `${PUBLIC_URL}/models/characters/avatar/${this._characterId}.gltf`;
    const animIdleUrl = `${animationDir}/Idle-${gender}.gltf`;
    const animWalkUrl = `${animationDir}/Walking-${gender}.gltf`;
    const animRunUrl = `${animationDir}/Running-${gender}.gltf`;

    const scope = this;
    Promise.all([
      loader.loadAsync(characterUrl),
      loader.loadAsync(animIdleUrl),
      loader.loadAsync(animWalkUrl),
      loader.loadAsync(animRunUrl),
    ]).then(gltfLoaded=>{
      const characterObj:THREE.Object3D = gltfLoaded[0].scene;
      const idleClip:THREE.AnimationClip = gltfLoaded[1].animations[0];
      const walkClip:THREE.AnimationClip = gltfLoaded[2].animations[0];
      const runClip:THREE.AnimationClip = gltfLoaded[3].animations[0];

      // Setting avatar
      characterObj.scale.set(SCALE,SCALE,SCALE);
      characterObj.traverse(object3D => {
        object3D.castShadow = true;
      });
      scope._target = characterObj;
      scope._target.position.copy(scope._initialPosition);
      scope.scene.add(scope._target);

      // Seting ring
      scope.scene.add(scope._ringMesh)
      scope._ringMesh.rotation.x = Math.PI / 2;

      // Setting animations
      scope._mixer = new THREE.AnimationMixer(scope._target);
      scope._animations['idle'] = {
        clip: idleClip,
        action: scope._mixer.clipAction(idleClip)
      }
      scope._animations['walk'] = {
        clip: walkClip,
        action: scope._mixer.clipAction(walkClip)
      }
      scope._animations['run'] = {
        clip: runClip,
        action: scope._mixer.clipAction(runClip)
      }
      
      scope._stateMachine.SetState('idle');
      scope.loadingDone = true 
      scope._onLoadModel();
    });
  }


  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  get publicAddress(){
    return this._publicAddress;
  }
  
  loadStatusInMemory(statusObj:THREE.Object3D){
    const mScale = STATUS_SCALE[this._statusIdentifier]
    statusObj.scale.set(mScale,mScale,mScale);
    if(this._statusObject){
      this.scene.remove(this._statusObject);
    }
    this._statusObject = statusObj;
    this._statusLoading = false
  }

  get StateName(){
    if(this._stateMachine!==undefined && 
      this._stateMachine._currentState!==undefined && 
      this._stateMachine._currentState.Name!==undefined)return this._stateMachine._currentState.Name
    return 'idle'
  }

  get Position() {
    if(this._target===undefined){
      return this._initialPosition;
    }
    else{
      return this._target.position;
    }
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  get Object(){
    return this._target;
  }

  get Box(){
    if(!this._target){
      return null;
    }
    const characterBox = new THREE.Box3().setFromObject(this._target)
    characterBox.expandByScalar(10.0)
    return characterBox;
  }
  get HeartBeat(){
    return this._lastHeartBeat;
  }
  
  ChangeState(_state){
    if(_state!==undefined && this.loadingDone){
      this._stateMachine.SetState(_state)
    }
    this._lastHeartBeat = new Date().getTime();
  }

  get Status(){
    return this._statusIdentifier;
  }

  get StatusVisible(){
    return this._statusVisible
  }

  ChangeStatus(newStatus){
    if(this._statusLoading)return
    if(this._statusIdentifier === newStatus){
      // no-need to update
      return;
    }
    if(newStatus==null){
      // clear status
      if(this._statusObject){
        this.scene.remove(this._statusObject);
      }
      this._statusObject=null;
      this._statusIdentifier = null;
      return;
    }

    const scope = this;
    scope._statusLoading = true
    this._statusIdentifier = newStatus;
    const url = `${PUBLIC_URL}/models/status/${this._statusIdentifier}.glb`;
    const _gltfLoader = new GLTFLoader();

    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    _gltfLoader.setDRACOLoader(dracoLoader);

    _gltfLoader.load(url, (gltf) => {
      const obj = gltf.scene;
      scope.loadStatusInMemory(obj);
    });
  }

  ChangeStatusVisibility(isStatusVisibleNow){
    this._statusVisible = isStatusVisibleNow
  }

  UpdatePosition(newPosition:THREE.Vector3){
    if(!this._target) return;
    this._lastHeartBeat = new Date().getTime();
    this._positionToReach.copy(newPosition);
    const lastPosition = new THREE.Vector3(
        this._target.position.x,
        this._target.position.y,
        this._target.position.z
    );
    const eye = new THREE.Vector3();
    eye.subVectors(newPosition, lastPosition);
    this.UpdateRotation(eye);
  }

  UpdateRotation(lookAt:THREE.Vector3){
    this._lastHeartBeat = new Date().getTime();
    const eye = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
    const rotationMatrix = new THREE.Matrix4().lookAt(eye,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
    var quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
    this._target.quaternion.copy(quaternion);
  }

  ShowStatus(show:boolean){
    if(this._showStatusInProximity === show)return;
    this._showStatusInProximity = show;
    if(show){
      //Object could be null in case status is null
      if(this._statusObject){
        this.scene.add(this._statusObject);
      }
    }else{
      if(this._statusObject){
        this.scene.remove(this._statusObject);
      }
    }
  }

  almostEqual(a:THREE.Vector3, b:THREE.Vector3){
    const threshold = 0.1;
    return (Math.abs(a.x-b.x)<threshold && Math.abs(a.y-b.y)<threshold && Math.abs(a.z-b.z)<threshold);
  }

  Update(timeInSeconds) {
    if (!this._stateMachine._currentState) {
      return;
    }

    const lastPosition = new THREE.Vector3();
    lastPosition.copy(this._target.position);
    const intermidatePosition = new THREE.Vector3();
    intermidatePosition.x = THREE.MathUtils.lerp(lastPosition.x, this._positionToReach.x, 0.1);
    intermidatePosition.y = THREE.MathUtils.lerp(lastPosition.y, this._positionToReach.y, 0.1);
    intermidatePosition.z = THREE.MathUtils.lerp(lastPosition.z, this._positionToReach.z, 0.1);

    if(!this.almostEqual(lastPosition, intermidatePosition)){      
      this._target.position.copy(intermidatePosition);
      this._initialPosition.copy(intermidatePosition);
    }
   
    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }

    if(this._statusObject){
      const statusPosition = this._target.position.clone();
      statusPosition.y = 28
      this._statusObject.position.copy(statusPosition);
      this._statusObject.rotateOnAxis(this.statusRotationAxis,this.rad);
    }

    const ringPosition = this.Position.clone()
    ringPosition.y += 1.0
    this._ringMesh.position.copy(ringPosition);
  }

  Kill(){
    this.scene.remove(this._target);
    this.scene.remove(this._ringMesh)
    if(this._statusObject){
      this.scene.remove(this._statusObject);
    }
  }

};