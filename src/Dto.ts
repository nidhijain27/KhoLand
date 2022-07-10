export type MetaPlayerDto = {
    id: string;
    characterId: string;
    publicAddress: string;
    status: string;
    state : string;
    statusVisible: boolean;
    position: {x: number, y: number, z: number};
    rotation: {x: number, y: number, z: number};
}

export type MetaActionDto = {
    action: string,
    senderAddress: string,
    receiverAddress: string,
    status: string
}

export type PlayerDTO = {
    socketId: string;
    userId: number;
    playerColor: string;
    playerIndex: number;
    nickName: string;
};

export type TurnResult = {
    path:number[],
    type:string,
    homeGotti:string|undefined,
    killedGotti:string|undefined
}