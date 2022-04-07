import { IPlayer } from "shared";
import uniqid from "uniqid";

export default class Database{
       playersStorage:Record<string,IPlayer> = {}

       players = {
            genAuthID: () => {
                return uniqid()
            },
            /** Accepts both JSON and PlayerSchema */
            savePlayer: (player:IPlayer) => {
                if((player as any).toJSON){
                    player = (player as any).toJSON()
                }
                this.playersStorage[player.authID] = player
            },
            getPlayer: (authID:string) => {
                return this.playersStorage[authID]
            },
            getPlayerByPublicID: (publicID:string) => {
                return Object.values(this.playersStorage).find(player => player.publicID === publicID)
            },
            getAll:()=>{
                return Object.values(this.playersStorage)
            }
       }
}