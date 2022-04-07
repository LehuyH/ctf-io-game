import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { Nation, PlayerSummary } from "../schema/state";
import uniqid from "uniqid";

interface IConfig{
    name:string;
    tag:string;
    color:string;
    client: Client
}

export class RegisterNation extends Command<BaseRoom, IConfig> {
    validate({name,client,color,tag}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false

        //Tag is inbetween 2 and 5 characters
        if(tag.length < 2 || tag.length > 5) return false

        //Color must be valid hex
        if(!/^#[0-9A-F]{6}$/i.test(color)) return false

        //Already in a nation
        if(player.nationID) return false

        //Between 3-12 characters alphanumeric
        if(name.length < 3 || name.length > 20) return false

        //Check if name or is taken
        const nameTaken = Array.from(this.state.nations.values()).some(n=>n.name.toLowerCase().trim() === name.toLowerCase().trim())
        const tagTaken = Array.from(this.state.nations.values()).some(n=>n.tag.toLowerCase().trim() === tag.toLowerCase().trim())
        if(nameTaken || tagTaken) return false

        //Check if by player owned headquarters
        const collidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))

        if(!collidedHQ) return false
        const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
  
        if(hqState.ownerNationID) return false
        if(hqState.ownerPlayerID !== player.publicID) return false

        return true
    }
    execute({name,client,color,tag}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const collidedHQ = this.room.physics.getCollisions(`player-${client.id}`).find(c=>c.endsWith("headquarters"))
        const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
        
        //Add nation to state
        const nationID = uniqid()
        const nation = new Nation({
            name,
            tag,
            id: nationID
        })
        nation.members.push(
            new PlayerSummary({
                name: player.name,
                publicID: player.publicID
            })
        )
        nation.color = color
        this.state.nations.set(nationID,nation)

        //Add nation to player
        player.nationID = nationID
        
        //Add nation to headquarters
        hqState.ownerNationID = nationID
    }
}