export const statusList = ["chess", "ludo"]
export const optionsForStatus ={
    "chess": ["play_chess", "some_other_chess_option"],
    "ludo": ["play_ludo", "some_other_ludo_option"]
}

export interface StatusToAndroid{
    statusIdentifier: string,
    statusForPublicAddress: string,
    options: Array<String>
}