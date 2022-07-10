
import { Socket } from "socket.io-client";
import { PlayerDTO, TurnResult, MetaPlayerDto, MetaActionDto } from './Dto';


export interface ServerToClientEvents {
  // META
  metaRegistered: (player:MetaPlayerDto) => void;
  metaStatusActionUpdated: (action:MetaActionDto) => void;
  metaRemoteData: (player:MetaPlayerDto[]) => void;

  // LUDO
  ludoWaitForPlayers: (remaningPlayer:number) => void;
  ludoStartGame: (players:PlayerDTO[]) => void;
  ludoPlayerIndicator: (currentPlayer:PlayerDTO) => void;
  ludoRollTheDice: (currentPlayer:PlayerDTO, diceNumber:number) => void;
  ludoAddShakeAnimation: (movableGottis:string[]) => void;
  ludoMoveGotti: (gottiId:string, turnResult: TurnResult) => void;
  ludoShowMessage: (sender:PlayerDTO, message:string) => void;
  ludoRemovePlayer: (player:PlayerDTO) => void;
  ludoGameOver: (winner:PlayerDTO) => void;
}
  
export interface ClientToServerEvents {
  connection:(socket: SocketType)  => Promise<void>;
  disconnect: ()=> void;

  // META
  metaMove: (player:MetaPlayerDto) => void;
  metaStatusAction: (action:MetaActionDto) => void;

  // LUDO
  ludoRoll: () => void;
  ludoGottiClicked: (gottiId:string) => void;
  ludoSendMessage: (message:string) => void;
  ludoFinishedMoving: () => void;
  ludoJoinGame: (gameType:number) => void;
}
  
export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

