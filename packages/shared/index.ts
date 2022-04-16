export interface IState {
    players: Record<string, IPlayer>|any
    harvestables: Record<string, IHarvestable>|any
    buildings: Record<string, IBuilding>|any
    parties: Record<string, IParty>|any
}

export interface IPlayer {
    name:string;
    sessionID: string;
    partyID: string|null;
    authID: string;
    publicID: string;
    anim: PlayerAnimState;
    nationID:string|null;
    x: number;
    y: number;
    speed: number;
    health: number;
    maxHealth: number;
    velocityX: number;
    velocityY: number;
    inventory: Record<string, number>|any;
    equippedItemIndex: number;
    items: Item[];
}

export interface IPlayerSummary {
    name: string;
    publicID: string;
}

export interface IParty{
    name: string;
    id: string;
    partyLeaderPublicID: string;
    members: IPlayerSummary[]|any;
    joinRequests: IPlayerSummary[]|any;
}

export interface IHarvestable {
    id: string;
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    type:string;
    resource: string;
    value:number;
}

export interface IBuilding{
    id: string;
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    type: string;
    ownerPlayerID: string;
    ownerNationID: string;
}

export type Cost = Record<string, number>;

export interface Item{
    name: string;
    type:ItemType;
    texture:string;
    damage:number;
    cost?:Cost
}

export enum PlayerAnimState{
    IDLE = 'idle',
    MOVING = 'moving',
    BASIC_ATTACK = 'basic-attack',
}

export enum EventType{
    PlayerStartMove = 'PlayerStartMove',
    PlayerStopMove = 'PlayerStopMove',
    UseActiveTool = 'UseActiveTool',
    Build = 'Build',
    CraftItem = 'CraftItem',
    SetActiveItem = 'SetActiveItem',
    CreateParty = 'CreateParty',
    RequestJoinParty = 'RequestJoinParty',
    AcceptJoinParty = 'AcceptJoinParty',
    RejectJoinParty = 'RejectJoinParty',
    LeaveParty = 'LeaveParty'
}

export enum ItemType{
    SWORD = 'sword',
    AXE = 'axe',
    PICKAXE = 'pickaxe',
    BOW = 'bow',
    BOMB = 'bomb'
}
