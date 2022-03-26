import ClientRoom from "../types/ClientRoom";
import ConnectionManager from "../types/ConnectionManager";
import { PlayerState } from "shared"
import { useLocalPlayerID, uiState } from "~/state";

export default class ConnectionManagerOffline{
    scene: ClientRoom;
    keys: Record<string,Phaser.Input.Keyboard.Key> = {}

    constructor(scene: ClientRoom) {
        this.scene = scene;
    }

    create(): void {
        this.keys = this.scene.input.keyboard.addKeys("W,A,S,D") as Record<string,Phaser.Input.Keyboard.Key>;

        this.scene.input.on('pointerdown',()=>{
            this.scene.serverEmulator?.actions.harvest(useLocalPlayerID())
        })
    }

    update(time: number, delta: number): void {
        this.scene.state.getPlayer(useLocalPlayerID()).velocityX = 0;
        this.scene.state.getPlayer(useLocalPlayerID()).velocityY = 0;

        if(this.keys.W.isDown){
            this.inputs.start.up();
        }
        if(this.keys.S.isDown){
            this.inputs.start.down();
        }
        if(this.keys.A.isDown){
            this.inputs.start.left();
        }
        if(this.keys.D.isDown){
            this.inputs.start.right();
        }
    }
    
    inputs = {
        start: {
            up: () => {
                this.scene.state.getPlayer(useLocalPlayerID()).velocityY = -2;
            },
            down: () => {
                this.scene.state.getPlayer(useLocalPlayerID()).velocityY = 2;
            },
            left: () => {
                this.scene.state.getPlayer(useLocalPlayerID()).velocityX = -2;
            },
            right: () => {
                this.scene.state.getPlayer(useLocalPlayerID()).velocityX = 2;
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