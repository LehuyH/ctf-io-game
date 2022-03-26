export interface IPlayer {
    id: string;
    state: PlayerState;
    anim: PlayerAnimState;
    x: number;
    y: number;
    speed: number;
    health: number;
    maxHealth: number;
    velocityX: number;
    velocityY: number;
    inventory: Record<string, number>;
    equippedItemIndex: number;
    items: Item[];
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
    type: string;
    ownerID: string;
}

export interface Item{
    name: string;
    type:ItemType;
    texture:string;
    damage:number;
}

export type Cost = Record<string, number>;

export enum PlayerState {
    IDLE = 'idle',
    MOVING = 'moving',
    BASIC_ATTACK = 'basic-attack',
    SPECIAL_ATTACK_A = 'special-attack-a',
    SPECIAL_ATTACK_B = 'special-attack-b',
    SPECIAL_ATTACK_C = 'special-attack-c',
    SPECIAL_ATTACK_D = 'special-attack-d',
    INVUNERABLE = 'invunerable',
    DEAD = 'dead',
}

export enum PlayerAnimState{
    IDLE = 'idle',
    MOVING = 'moving',
    BASIC_ATTACK = 'basic-attack',
}

export enum EventType{
    HARVESTING = 'harvesting',
}

export enum ItemType{
    SWORD = 'sword',
    AXE = 'axe',
    PICKAXE = 'pickaxe',
    BOW = 'bow',
    BOMB = 'bomb'
}
