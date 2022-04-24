import ClientRoom from "../types/ClientRoom";
import { EventType, IState } from "shared";
import { useLocalPlayerID, uiState, useLocalPlayer, } from "~/state";
import { connection } from "~/connection";
import type * as Colyseus from "colyseus.js";
import ConnectionManager from "../types/ConnectionManager";
import IsMobile from "./IsMobile";

export default class ConnectionManagerOnline implements ConnectionManager{
    scene: ClientRoom;
    keys: Record<string,Phaser.Input.Keyboard.Key> = {}
    room: Colyseus.Room<IState>;
    joyStick: any;
    joyStickKeys: Record<string,Phaser.Input.Keyboard.Key> = {}
    constructor(scene: ClientRoom) {
        if(!connection.room.value) throw new Error("ConnectionManagerOnline requires you to be connected to a server");
        this.room = connection.room.value;
        this.scene = scene;
        //Setup events
        this.room.onStateChange((newState)=>{
           this.patchState(newState);
        })
        this.room.onMessage("*", (event,data)=>{
            this.scene.events.emit(event as string, data);
        })
        //@ts-ignore
        this.joyStick = scene.plugins.get("rexvirtualjoystickplugin").add(scene,{
            x: 640 * 0.2,
            y: 360 * 0.6,
            radius:20,
            base: scene.add.circle(0, 0, 50, 0x888888, 0.3),
            thumb: scene.add.circle(0, 0, 25, 0xcccccc, 0.3)
        })
        this.joyStick.setScrollFactor(0);
        this.joyStick.thumb.setDepth(10);
        this.joyStick.base.setDepth(10);

        if(!IsMobile()){
            this.joyStick.setVisible(false);
        }else{
            document.body.requestFullscreen();
        }
      
    }

    patchState(state:IState){
        const parsedState = JSON.parse(JSON.stringify(state))
        Object.assign(this.scene.state.state,parsedState)
    }

    get inputAllowed(){
        return true
    }

    create(): void {
        this.patchState(this.room.state);
        this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,E,space",false) as Record<string,Phaser.Input.Keyboard.Key>;
        this.joyStickKeys = this.joyStick.createCursorKeys();

        //Register input handlers
        this.scene.input.on('pointerdown',()=>{
            //Move joystick to pointer
            const joyStickIsUsed =
                this.joyStickKeys.up.isDown ||
                this.joyStickKeys.down.isDown ||
                this.joyStickKeys.left.isDown ||
                this.joyStickKeys.right.isDown;

            if(!joyStickIsUsed){
                this.joyStick.x = this.scene.input.x;
                this.joyStick.y = this.scene.input.y;
            }

            if(uiState.isBuilding) return;
            if(uiState.craftmenu.buildingName) return;
            this.inputs.useTool();
        })
        this.keys.space.on('down',()=>{
            if(uiState.isBuilding) return;
            if(uiState.craftmenu.buildingName) return;
            this.inputs.useTool();
        })
        
        this.joyStickKeys.up.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.up();
        })
        this.joyStickKeys.up.on('up',()=>{
            this.inputs.stop.up();
        })
        this.joyStickKeys.down.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.down();
        })
        this.joyStickKeys.down.on('up',()=>{
            this.inputs.stop.down();
        })
        this.joyStickKeys.left.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.left();
        })
        this.joyStickKeys.left.on('up',()=>{
            this.inputs.stop.left();
        })
        this.joyStickKeys.right.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.right();
        })
        this.joyStickKeys.right.on('up',()=>{
            this.inputs.stop.right();
        })
        
        this.keys.W.on('down',()=>{
           if(!this.inputAllowed) return;
           this.inputs.start.up();
        })
        this.keys.W.on('up',()=>{
            this.inputs.stop.up();
        })
        this.keys.A.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.left();
        })
        this.keys.A.on('up',()=>{
            this.inputs.stop.left();
        })
        this.keys.S.on('down',()=>{
            if(!this.inputAllowed) return;
            this.inputs.start.down();
        })
        this.keys.S.on('up',()=>{
            this.inputs.stop.down();
        })
        this.keys.D.on('down',()=>{
            if(!this.inputAllowed) return;
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
                this.room.send(EventType.SetActiveItem,{index});
            },
            next: ()=>{
                const localplayer = this.scene.state.getState("players",useLocalPlayerID());
                const index = localplayer.equippedItemIndex + 1;
                this.inputs.items.set(index);
            },
            prev: ()=>{
                const localplayer = this.scene.state.getState("players",useLocalPlayerID());
                const index = localplayer.equippedItemIndex - 1;
                this.inputs.items.set(index);
            }
        },
        buildings: {
            build: (type:string,x:number,y:number)=>{
                this.room.send(EventType.Build,{type,x,y})
            }
        },
        useTool: ()=>{
            this.room.send(EventType.UseActiveTool)
        },
        craftItem: (itemName:string,buildingName:string)=>{
            this.room.send(EventType.CraftItem,{itemName,buildingName})
        },
        createParty: (name:string)=>{
            this.room.send(EventType.CreateParty,{name})
        },
        requestJoin: (partyID:string)=>{
            this.room.send(EventType.RequestJoinParty,{partyID})
        },
        acceptJoinRequest: (playerID:string)=>{
            this.room.send(EventType.AcceptJoinParty,{playerID})
        },
        rejectJoinRequest: (playerID:string)=>{
            this.room.send(EventType.RejectJoinParty,{playerID})
        },
        leaveParty: ()=>{
            this.room.send(EventType.LeaveParty)
        },
        stealPoints: ()=>{
            this.room.send(EventType.StealPoints)
        },
        depositPoints: ()=>{
            this.room.send(EventType.DepositPoints)
        }
}

    mockBroadcast(type: string, data: any): void {
        this.scene.events.emit(type, data);
    }
}