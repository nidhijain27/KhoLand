import { MainCharacter } from './Character';

export class CombineControllerInput {

  private mainCharacter:MainCharacter;
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  };
  private enable=false;
  
  constructor(mainCharacter:MainCharacter) {
    this.mainCharacter=mainCharacter;
    this._Init();    
  }

  disableInput(){
    this.enable = false;
  }

  enableInput(){
    this.enable = true;
  }

  updateCharacterAction(){
    if(!this.enable) return;
    this.mainCharacter.action.forward = this.keys.forward;
    this.mainCharacter.action.backward = this.keys.backward;
    this.mainCharacter.action.left = this.keys.left;
    this.mainCharacter.action.right = this.keys.right;
    this.mainCharacter.action.space = this.keys.space;
    this.mainCharacter.action.shift = this.keys.shift;
  }

  _Init() {
    this.updateCharacterAction();
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);

    const scope = this;
    (window as any).move = (x:number,y:number) => {
      if(y>0){
        scope.keys.forward = true;
      }else if(y<0){
        scope.keys.backward = true;
      }else{
        scope.keys.forward = false;
        scope.keys.backward = false;
      }
      if(x<0){
        scope.keys.left = true;
      }else if(x>0){
        scope.keys.right = true;
      }else{
        scope.keys.left = false;
        scope.keys.right = false;
      }
      scope.updateCharacterAction();
    }

    (window as any).moveEnd = (x:number,y:number) => {
      scope.keys.forward = false;
      scope.keys.backward = false;
      scope.keys.left = false;
      scope.keys.right = false;
    }
  }

  moveControl(x:number, y:number){
    const scope = this
    if(y>0){
      scope.keys.backward = true;
    }else if(y<0){
      scope.keys.forward = true;
    }else{
      scope.keys.forward = false;
      scope.keys.backward = false;
    }

    if(x<0){
      scope.keys.left = true;
    }else if(x>0){
      scope.keys.right = true;
    }else{
      scope.keys.left = false;
      scope.keys.right = false;
    }
    scope.updateCharacterAction();
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w
        this.keys.forward = true;
        break;
      case 65: // a
        this.keys.left = true;
        break;
      case 83: // s
        this.keys.backward = true;
        break;
      case 68: // d
        this.keys.right = true;
        break;
      case 32: // SPACE
        this.keys.space = true;
        break;
      case 16: // SHIFT
        this.keys.shift = true;
        break;
    }
    this.updateCharacterAction();
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w
        this.keys.forward = false;
        break;
      case 65: // a
        this.keys.left = false;
        break;
      case 83: // s
        this.keys.backward = false;
        break;
      case 68: // d
        this.keys.right = false;
        break;
      case 32: // SPACE
        this.keys.space = false;
        break;
      case 16: // SHIFT
        this.keys.shift = false;
        break;
    }
    this.updateCharacterAction();
  }
};

