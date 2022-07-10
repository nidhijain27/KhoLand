import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {CharacterFSM} from './CharacterStateMachine';
import { STATUS_SCALE } from './OtherCharacter';

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

const ANIMATIONS = ['Dance', 'Idle', 'Run', 'Walk'];
const SCALE = 12.9;

export class MainCharacter {
  private scene:THREE.Scene;
  private _decceleration:THREE.Vector3;
  private _acceleration:THREE.Vector3;
  private _velocity:THREE.Vector3;
  private _stateMachine:CharacterFSM;
  public _target:THREE.Object3D;
  private _mixer:THREE.AnimationMixer;
  private _mixerPlayer:THREE.AnimationMixer;
  private _animations:any;
  private _characterId:string;
  private _position=new THREE.Vector3();
  private _onLoadModel:CallableFunction;
  private _publicAddress: string;
  private _socketId:string;
  private _statusIdentifier:string
  private _statusLoaded:string
  private _statusVisible: boolean = false;
  private _statusObject: THREE.Object3D

  private _ringGeometry:THREE.RingGeometry;
  private _ringMaterial:THREE.MeshBasicMaterial;
  private _ringMesh:THREE.Mesh;

  private statusRotationAxis = new THREE.Vector3(0.5,1,0).normalize()

  public action = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  };

  constructor(
    socketId:string,
    scene:THREE.Scene,
    characterId:string, 
    position:THREE.Vector3, 
    publicAddress:string, 
    status: string,
    onLoad:CallableFunction
  ) {
    this.scene=scene;
    this._characterId=characterId;
    this._position = position;
    this._onLoadModel = onLoad;
    this._publicAddress = publicAddress;
    this._socketId = socketId;
    this._statusIdentifier = status;
    this._ringGeometry = new THREE.RingGeometry( 10, 10.2, 32 );
    this._ringMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    this._ringMesh = new THREE.Mesh( this._ringGeometry, this._ringMaterial );
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 60.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._animations = {};
    this._stateMachine = new CharacterFSM(
        new BasicCharacterControllerProxy(this._animations));
    this._Init();
  }

  _Init() {

    const loader = new GLTFLoader();
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath(`${PUBLIC_URL}/draco/`);
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
    const statusUrl = `${PUBLIC_URL}/models/status/${this._statusIdentifier}.glb`;

    const scope = this;
    Promise.all([
      loader.loadAsync(characterUrl),
      loader.loadAsync(statusUrl),
      loader.loadAsync(animIdleUrl),
      loader.loadAsync(animWalkUrl),
      loader.loadAsync(animRunUrl),
    ]).then(gltfLoaded=>{
      const characterObj:THREE.Object3D = gltfLoaded[0].scene;
      const statusObj:THREE.Object3D = gltfLoaded[1].scene;
      const idleClip:THREE.AnimationClip = gltfLoaded[2].animations[0];
      const walkClip:THREE.AnimationClip = gltfLoaded[3].animations[0];
      const runClip:THREE.AnimationClip = gltfLoaded[4].animations[0];
      
      // Setting avatar
      characterObj.scale.set(SCALE,SCALE,SCALE);
      characterObj.traverse(object3D => {
        object3D.castShadow = true;
      });
      scope._target = characterObj;
      scope._target.position.copy(scope._position);
      scope.scene.add(scope._target);

      // Set status
      scope.addStatus(statusObj);

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
      scope._onLoadModel();

    });

  }

  get PublicAddress(){
    return this._publicAddress;
  }

  get CharacterId(){
    return this._characterId;
  }

  get Position() {
    if(this._target===undefined){
      return this._position;
    }
    else{
      return this._target.position;
    }
  }

  get StateName(){
    if(this._stateMachine!==undefined && 
      this._stateMachine._currentState!==undefined && 
      this._stateMachine._currentState.Name!==undefined)return this._stateMachine._currentState.Name
    return 'idle'
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

  get Status(){
    return this._statusIdentifier
  }

  get StatusVisible(){
    return this._statusVisible
  }

  addStatus(statusObj:THREE.Object3D){
    if(this._statusLoaded === this._statusIdentifier){
      return;
    }
    const mScale = STATUS_SCALE[this._statusIdentifier]
    statusObj.scale.set(mScale,mScale,mScale);

    const statusPosition = this._target.position.clone();
    statusPosition.y = 28;

    if(this._statusObject){
      this.scene.remove(this._statusObject);
    }
    this._statusObject = statusObj;
    this._statusObject.position.copy(statusPosition);
    this.scene.add(this._statusObject);
    this._statusLoaded = this._statusIdentifier;
  }

  UpdateStatus(status:string){
    if(this._statusLoaded === status){
      // no-need to update
      return;
    }
    if(status==null){
      // clear status
      if(this._statusObject){
        this.scene.remove(this._statusObject);
        this._statusObject=null;
      }
      this._statusIdentifier = null;
      this._statusLoaded = null
      return;
    }
    const scope = this;
    this._statusIdentifier = status;
    const url = `${PUBLIC_URL}/models/status/${this._statusIdentifier}.glb`;

    const _gltfLoader = new GLTFLoader();

    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    _gltfLoader.setDRACOLoader(dracoLoader);

    _gltfLoader.load(url, (gltf) => {
      const obj = gltf.scene;
      scope.addStatus(obj);
    })

  }

  UpdateStatusVisible(statusVisible:boolean){
    this._statusVisible = statusVisible 
  }

  UpdatePosition(newPosition:THREE.Vector3){
    this._target.position.copy(newPosition);
  }

  Kill(){
    this.scene.remove(this._target);
    this.scene.remove(this._ringMesh)
    if(this._statusObject){
      this.scene.remove(this._statusObject);
    }
  }

  Update(timeInSeconds) {
    if (!this._stateMachine._currentState) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this.action);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this.action.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this._stateMachine._currentState.Name == 'dance') {
      acc.multiplyScalar(0.0);
    }

    if (this.action.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this.action.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this.action.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 2.0 * Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this.action.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 2.0 * -Math.PI * timeInSeconds * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();
    forward.multiplyScalar(velocity.z * timeInSeconds);
    controlObject.position.add(forward);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
    if(this._mixerPlayer){
      this._mixerPlayer.update(timeInSeconds);
    }

    if(this._ringMesh){
      const ringPosition = this._position.clone()
      ringPosition.y += 1.0
      this._ringMesh.position.copy(ringPosition);
    }

    if(this._statusObject){
      const statusPosition = this._target.position.clone();
      statusPosition.y = 28
      this._statusObject.position.copy(statusPosition);
      this._statusObject.rotateOnAxis(this.statusRotationAxis, 0.04);
    }

  }
};
