import * as THREE from 'three';
import Nebula, {SpriteRenderer} from 'three-nebula';

import GameCircleParticle from "./GameCircleParticle.json";

export class GameCircle{
    private _scene:THREE.Scene;
    private _ringMaterial:THREE.MeshBasicMaterial;
    private _ringMesh:THREE.Mesh;
    private _nebula;

    constructor(scene:THREE.Scene){
        this._scene = scene;

        const ringGeometry = this._cylinderLathe(50, 48, 4);
        this._ringMaterial = new THREE.MeshLambertMaterial( { color: 0x6049B7, side: THREE.DoubleSide } );
        this._ringMesh = new THREE.Mesh( ringGeometry, this._ringMaterial );
    
        this._ringMesh.traverse(object3D => {
          object3D.castShadow = true;
          object3D.receiveShadow = true;
        });
    
        this._scene.add(this._ringMesh)
        this._ringMesh.position.x = 140;
        this._ringMesh.position.y = 0;
        const scope = this;
        Nebula.fromJSONAsync(GameCircleParticle, THREE).then(loaded => {
          const nebulaRenderer = new SpriteRenderer(scope._ringMesh, THREE);
          console.log(nebulaRenderer);
          scope._nebula = loaded.addRenderer(nebulaRenderer);
        });
    }

    _cylinderLathe(R, r, h){
      const halfH = h * 0.5;
      const points = [
        new THREE.Vector2(r, -halfH),
        new THREE.Vector2(R, -halfH),
        new THREE.Vector2(R, halfH),
        new THREE.Vector2(r, halfH),
        new THREE.Vector2(r, -halfH)
      ];
      return new THREE.LatheBufferGeometry(points, 72);    
    }

    Update(){
      if(this._nebula){
        this._nebula.update();
      }
    }

}
