import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { MathUtils } from 'three';

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1`;
const SCALE = 12.9;

export class AvatarDisplay {
  private _renderer:THREE.WebGLRenderer;
  private _scene:THREE.Scene;
  private _previousRAF:number = null;
  private _domRoot:any;
  private _width:number;
  private _height:number;
  private stats:Stats;
  private _showLoading: CallableFunction;
  private _avatarId:string;
  private _camera:THREE.PerspectiveCamera;
  private _mixer: THREE.AnimationMixer;
  private _character:THREE.Object3D;
  private _ringGeometry:THREE.CylinderGeometry;
  private _ringMaterial:THREE.MeshBasicMaterial;
  private _ringMesh:THREE.Mesh;
  
  constructor(domRoot:any, showLoading:CallableFunction) {
    console.log("constructor-in");

    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
      const progress = Math.ceil(itemsLoaded*100/itemsTotal);
      showLoading(progress);
    };
    
    this._scene = new THREE.Scene();
    //this.stats = Stats();

    this._renderer = new THREE.WebGLRenderer({
      antialias:true, 
      alpha: true
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._showLoading = showLoading;

    if(!this._domRoot){
      this._domRoot=domRoot;
      this._width=this._domRoot.clientWidth;
      this._height = this._domRoot.clientHeight;
      this._renderer.setSize(this._width, this._height);
      this._domRoot.innerHTML = '';
      this._domRoot.append(this._renderer.domElement);
      //this._domRoot.append(this.stats.dom);
    }
    this._Initialize();
  }

  UpdateState(avatarId){
    console.log("UpdateState-in", avatarId);
    const scope = this;
    scope._avatarId = avatarId;
    if(scope._character){
      scope._scene.remove(scope._character);
      scope._character = null;
    }
    const loader = new GLTFLoader();
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath(`${PUBLIC_URL}/draco/`);
    loader.setDRACOLoader(dracoLoader);
    const characterUrl = `${PUBLIC_URL}/models/characters/avatar/${this._avatarId}.gltf`;
    const animationUrl = `${PUBLIC_URL}/models/characters/animation/Dance-${this._getRandomInt(4)}.gltf`;
    console.log(animationUrl);
    const dance = loader.loadAsync(animationUrl);
    const character = loader.loadAsync(characterUrl);
    
    Promise.all([character, dance]).then((glTFList) => {

      const gltfCharacter = glTFList[0];
      const gltfDance = glTFList[1];

      scope._character = gltfCharacter.scene;
      gltfCharacter.scene.scale.set(SCALE,SCALE,SCALE);
      scope._character.rotateOnAxis(new THREE.Vector3( 0,1,0), MathUtils.degToRad(-45));
      gltfCharacter.scene.traverse(object3D => {
        object3D.castShadow = true;
      });
      scope._scene.add(gltfCharacter.scene);
      scope._mixer = new THREE.AnimationMixer(gltfCharacter.scene);
      const animationAction = scope._mixer.clipAction(gltfDance.animations[0]);
      animationAction.play();

      scope._ringGeometry = new THREE.CylinderGeometry( 12, 12, 1, 32 );
      scope._ringMaterial = new THREE.MeshLambertMaterial( { color: 0x6049B7, side: THREE.DoubleSide } );
      scope._ringMesh = new THREE.Mesh( scope._ringGeometry, scope._ringMaterial );
      scope._ringMesh.position.y = -0.4;
      scope._ringMesh.position.x = 0;
      scope._ringMesh.position.z = 0;
      this._ringMesh.traverse(object3D => {
        object3D.castShadow = true;
        object3D.receiveShadow = true;
      });

      scope._scene.add(scope._ringMesh);
      scope._showLoading(false);
    });
  }

  _getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  _Initialize() {
    this.addLights();
    this.addSky();
    this._RAF();
    this.addCamera();
    (window as any).onresize = this._OnWindowResize;
  }

  addCamera(){
    this._camera = new THREE.PerspectiveCamera(
        75,
        this._width / this._height,
        0.1,
        1000
    )
    this._camera.position.set(-30, 20, 20);
    this._camera.lookAt(new THREE.Vector3(0,7,0));
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

  addLights(){
    const light = new THREE.DirectionalLight(0xcae6e9, 0.5);;
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
  }

  _OnWindowResize() {
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
    this._renderer && this._renderer.setSize(this._width, this._height);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      this._RAF();
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;

    if(this.stats){
      this.stats.update();
    }

    if(this._renderer){
      this._renderer.render(this._scene, this._camera);
    }

    if (this._mixer) {
      this._mixer.update(timeElapsedS);
    }
  }

}

