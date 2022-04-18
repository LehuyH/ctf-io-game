import { Room } from "colyseus.js";

export default interface ConnectionManager {
    room?: Room;
    inputs:{
        start: {
            up: () => void;
            down: () => void;
            left: () => void;
            right: () => void;
        }
        items:{
            set: (index:number)=>void;
            next: ()=>void;
            prev: ()=>void;
        }
        buildings:{
            build: (type:string,x:number,y:number)=>void;
        }
        useTool: ()=>void;
        craftItem: (itemName:string,buildingName:string)=>void;
        createParty: (name:string)=>void;
        requestJoin: (partyID:string)=>void;
        acceptJoinRequest: (playerID:string)=>void;
        rejectJoinRequest: (playerID:string)=>void;
        leaveParty: ()=>void;
    }
    create(): void;
    update(time: number, delta: number): void;
    mockBroadcast(type: string, data: any): void;
}