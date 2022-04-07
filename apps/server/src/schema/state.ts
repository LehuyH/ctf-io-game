import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { IPlayer, IState, PlayerAnimState, ItemType, IHarvestable, IBuilding, INation, IPlayerSummary } from "shared";
import { Item as ItemInterface } from "shared";
import { ServerBody } from "../logic/ServerBody";

export class Building extends Schema implements IBuilding{
    @type("string") id: string;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") health: number;
    @type("number") maxHealth: number;
    @type("string") type: string;
    @type("string") ownerPlayerID: string;
    @type("string") ownerNationID: string;
}

export class PlayerSummary extends Schema implements IPlayerSummary {
    @type("string") name: string;
    @type("string") publicID: string;
}

export class Nation extends Schema implements INation{
    @type("string") id: string;
    @type("string") name: string;
    @type("string") tag: string;
    @type("string") color: string;
    @type("boolean") isProtected: boolean = false;
    @type([ PlayerSummary ]) members = new ArraySchema<PlayerSummary>();
    @type([ PlayerSummary ]) joinRequests = new ArraySchema<PlayerSummary>();
}

export class Harvestable extends Schema implements IHarvestable {
    @type("string") id:string;
    @type("number") x:number;
    @type("number") y:number;
    @type("number") health:number;
    @type("number") maxHealth:number;
    @type("string") type:string;
    @type("string") resource:string;
    @type("number") value:number;
}

export class Item extends Schema implements ItemInterface{
    @type("string") name: string;
    @type("string") type: ItemType;
    @type("string") texture: string;
    @type("number") damage: number;
}

export class Player extends Schema implements IPlayer{
    @type("string") name:string;
    @type("string") nationID:string|null = null;
    @type("string") sessionID: string;
    @type("string") publicID: string;
    @type("string") anim: PlayerAnimState;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") speed: number = 3;
    @type("number") health: number = 100;
    @type("number") maxHealth: number = 100;
    velocityX: number = 0;
    velocityY: number = 0;
    @type({map:"number"}) inventory = new MapSchema<number>(); 
    @type("number") equippedItemIndex: number;
    @type([ Item ]) items: Item[] = new ArraySchema<Item>();

    //Server only
    body: ServerBody;
    move = {
        left: false,
        right:false,
        up:false,
        down:false
    }
    authID: string;
}


export class ServerState extends Schema implements IState{
    @type({map:Player}) players = new MapSchema<Player>();
    @type({map:Harvestable}) harvestables = new MapSchema<Harvestable>();
    @type({map:Building}) buildings = new MapSchema<Building>();
    @type({map:Nation}) nations = new MapSchema<Nation>();
}