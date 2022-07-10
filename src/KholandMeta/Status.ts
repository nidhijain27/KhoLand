import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1`;

export class Status {
	private scene:THREE.Scene;
	public _target:THREE.Object3D;
	private _initialPosition=new THREE.Vector3();
	private loadingDone = false
	private _onLoadModel:CallableFunction;
	private _publicAddress:string;
	private axis = new THREE.Vector3(0,0,1).normalize()
	private rad = 0.03
  
	constructor(scene:THREE.Scene, position:THREE.Vector3, publicAddress:string, onLoad:CallableFunction) {
	  this.scene=scene;
	  this._onLoadModel = onLoad;
	  this._initialPosition.copy(position);
	  this._publicAddress = publicAddress
	  this._Init();
	}
  
	get publicAddress(){
	  return this._publicAddress;
	}
	
	_Init() {
	  this._LoadModels();
	}
  
	_LoadModels() {
	  const scope = this;
	  const loader = new FBXLoader();
	  const url = `${PUBLIC_URL}/models/status/chess/chess.fbx`;
	  console.log("url", url);
	  loader.load(url, (fbxObj) => {
		console.log("FBX", fbxObj);
		
		const obj = fbxObj.children[0]
		obj.scale.set(1,1,1);

		console.log("OBJ", obj);

		scope._target = obj;
		scope._target.position.copy(scope._initialPosition);
		scope.scene.add(scope._target);
		
		scope.loadingDone = true     
		console.log("In async load done func")                                                                                                                                    
		scope._onLoadModel();
	  });

	  if(scope._target){
		scope._target.position.copy(scope._initialPosition);
	  }
	}
  

  
	get Position() {
	  if(this._target===undefined){
		return this._initialPosition;
	  }
	  else{
		return this._target.position;
	  }
	}
  
  
	get Object(){
	  return this._target;
	}

	
  
    
	Update(timeInSeconds) {
		this._target.rotateOnAxis(this.axis,this.rad);
	}	
  
	Kill(){
	  this.scene.remove(this._target);
	}
  
  };