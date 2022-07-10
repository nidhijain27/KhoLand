import * as THREE from 'three';
import { MainCharacter } from './Character';

export class ThirdPersonCamera {

  private _currentPosition = new THREE.Vector3();
  private _currentLookat = new THREE.Vector3();
  private _camera:THREE.PerspectiveCamera;
  private _target:MainCharacter;
  private width:number;
  private height:number;

  constructor(target:MainCharacter, width:number, height:number) {
    this._target = target;

    this.width = width;
    this.height = height;

    const fov = 50;
    const aspect = this.width / this.height;
    const near = 1.0;
    const far = 500.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //this._camera.position.set(25, 10, 25);
  }

  resize(width:number, height:number){
    this.width = width;
    this.height = height;
    this._camera.aspect = this.width / this.height;
    this._camera.updateProjectionMatrix();
  }

  getThreeCamera(){
    return this._camera;
  }
  
  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-3, 40, -80);
    idealOffset.applyQuaternion(this._target.Rotation);
    idealOffset.add(this._target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 0, 40);
    idealLookat.applyQuaternion(this._target.Rotation);
    idealLookat.add(this._target.Position);
    return idealLookat;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();
    
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    const lookAt = this._currentLookat.clone();
    this._camera.lookAt(lookAt);
  }
}
