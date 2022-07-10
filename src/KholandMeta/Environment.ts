import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const PUBLIC_URL = `${process.env.PUBLIC_URL}/assets/v1`;
export class Environment{
    
    private loader:GLTFLoader;

    constructor(){
        this.loader = new GLTFLoader();
    }
    
    load(scene: THREE.Scene){
        const scope=this;
        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderConfig({ type: 'js' });
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

        const size = 5000;
        const divisions = 200;
        const gridHelper = new THREE.GridHelper( size, divisions );
        gridHelper.position.y=-5;
        scene.add( gridHelper );

        scope.loader.setDRACOLoader(dracoLoader);
        scope.loader.load(`${PUBLIC_URL}/models/landscape/landscape.glb`, (fbx) => { 
            //fbx.scale.setScalar(1);
            fbx.scene.scale.set(80,80,80);
            fbx.scene.position.y = -47;
            fbx.scene.traverse(c => {
              c.castShadow = true;
              c.receiveShadow = true;
            });
            scene.add(fbx.scene);
        });
    }

}
