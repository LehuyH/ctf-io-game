import * as Colyseus from "colyseus.js";
import { IState } from "shared";
import { ref } from "vue";
const client = new Colyseus.Client(import.meta.env.VITE_SERVER_URL as string);

export const connection = {
    async getRooms(mode="base_game"){
        return await client.getAvailableRooms(mode);
    },
    async joinRoom(roomId:string, options:any){
        const roomReq = await client.joinById(roomId,options)
        this.room.value = roomReq as Colyseus.Room<IState>;
    },
    room: ref<Colyseus.Room<IState>>()
}