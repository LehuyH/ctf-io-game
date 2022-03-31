import ClientRoom from "../types/ClientRoom";
import ConnectionManager from "../types/ConnectionManager";
import { EventType, IState } from "shared";
import { useLocalPlayerID, uiState, } from "~/state";
import { connection } from "~/connection";
import type * as Colyseus from "colyseus.js";

export default class ConnectionManagerOnline{
    scene: ClientRoom;
    keys: Record<string,Phaser.Input.Keyboard.Key> = {}
    room: Colyseus.Room<IState>;

    constructor(scene: ClientRoom) {
        if(!connection.room.value) throw new Error("ConnectionManagerOnline requires you to be connected to a server");
        this.room = connection.room.value;
        this.scene = scene;
        //Setup events
        this.room.onStateChange((newState)=>{
           this.patchState(newState);
        })
    }

    patchState(state:IState){
        const parsedState = JSON.parse(JSON.stringify(state))
        Object.assign(this.scene.state.state,parsedState)
    }

    create(): void {
        this.patchState(this.room.state);
        this.keys = this.scene.input.keyboard.addKeys("W,A,S,D") as Record<string,Phaser.Input.Keyboard.Key>;

        //Register input handlers
        this.scene.input.on('pointerdown',()=>{
            this.scene.serverEmulator?.actions.harvest(useLocalPlayerID())
        })

        this.keys.W.on('down',()=>{
           this.inputs.start.up();
        })
        this.keys.W.on('up',()=>{
            this.inputs.stop.up();
        })
        this.keys.A.on('down',()=>{
            this.inputs.start.left();
        })
        this.keys.A.on('up',()=>{
            this.inputs.stop.left();
        })
        this.keys.S.on('down',()=>{
            this.inputs.start.down();
        })
        this.keys.S.on('up',()=>{
            this.inputs.stop.down();
        })
        this.keys.D.on('down',()=>{
            this.inputs.start.right();
        })
        this.keys.D.on('up',()=>{
            this.inputs.stop.right();
        })
    }

    update(time: number, delta: number): void { 
    }
    
    inputs = {
        start: {
            up: () => {
                this.room.send(EventType.PlayerStartMove,{dir: "up"});
            },
            down: () => {
                this.room.send(EventType.PlayerStartMove,{dir: "down"});
            },
            left: () => {
                this.room.send(EventType.PlayerStartMove,{dir: "left"});
            },
            right: () => {
                this.room.send(EventType.PlayerStartMove,{dir: "right"});
            },
        },
        stop:{
            up: () => {
                this.room.send(EventType.PlayerStopMove,{dir: "up"});
            },
            down: ()=>{
                this.room.send(EventType.PlayerStopMove,{dir: "down"});
            },
            left: ()=>{
                this.room.send(EventType.PlayerStopMove,{dir: "left"});
            },
            right: () => {
                this.room.send(EventType.PlayerStopMove,{dir: "right"});
            }, 
        },
        items:{
            set: (index:number)=>{
                this.scene.serverEmulator?.actions.setItem(useLocalPlayerID(),index)
            },
            next: ()=>{
                this.scene.serverEmulator?.actions.nextItem(useLocalPlayerID())
            },
            prev: ()=>{
                this.scene.serverEmulator?.actions.prevItem(useLocalPlayerID())
            }
        },
        buildings: {
            build: (type:string,x:number,y:number)=>{
                if(!uiState.isBuilding) return;
                this.scene.serverEmulator?.actions.build(uiState.isBuilding,useLocalPlayerID(),x,y)
                uiState.isBuilding = null;
            }
        }
    }

    mockBroadcast(type: string, data: any): void {
        this.scene.events.emit(type, data);
    }
}