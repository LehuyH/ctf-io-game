import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Item, Player, PlayerSummary } from "../schema/state";
import { Client } from "colyseus";
import { IPlayer, ItemType } from 'shared'
import uniqid from 'uniqid'

interface IConfig{
    name:string;
    authID?:string;
    client: Client;
}

export class PlayerJoin extends Command<BaseRoom, IConfig> {
  validate({authID, name}: IConfig){
      //Prevent duplicate names
      const nameTaken = (
        Array.from(this.state.players.values()).find(p => p.name.toLowerCase().trim() === name.toLowerCase().trim()) || 
        this.room.db.players.getAll().find((p:IPlayer) => p.name.toLowerCase().trim() === name.toLowerCase().trim())
      )
    
      if (nameTaken){
        throw new Error("That nickname is taken!")
      }

      if (!authID) return true
      const playerSave = this.state.players.get(authID)
      if (!playerSave) return true

      //Preventing joining twice
      if (Array.from(this.state.players.values()).find(p => p.publicID === playerSave.publicID)){
        throw new Error("You are already in the game!")
      }

      return true
  }

  execute({ name, client, authID }: IConfig) {
    let playerState = {
      name,
      sessionID: client.sessionId,
      x: 2752,
      y: 2752,
      health:100,
      maxHealth:100,
      equippedItemIndex: 0,
      civID: null as string|null,
      publicID: uniqid(),
      authID: authID || this.room.db.players.genAuthID(),
      items: [{
        name: "Wooden Axe",
        type: ItemType.AXE,
        texture: "wooden_axe",
        damage:10
      }],
      inventory:{}
    }

    //Returning player
    if(authID){
      const playerSave = this.room.db.players.getPlayer(authID)
      if(!playerSave) return

      playerState = {
        ...playerSave,
        sessionID: client.sessionId,
        items: [{
          name: "Wooden Axe",
          type: ItemType.AXE,
          texture: "wooden_axe",
          damage:10
        }],
        equippedItemIndex: 0
      }

    }
    
    //Add player to civ with least players
    const civs = Array.from(this.state.civs.values()).sort((a,b) => a.members.length - b.members.length)
    const smallestCiv = civs[0]

    playerState.civID = smallestCiv.id
    const civHQ = [...this.state.buildings.values()].find(b=>b.type === "headquarters" && b.ownerCivID === smallestCiv.id)
    playerState.x = civHQ.x
    playerState.y = civHQ.y

    //Add player to state
    this.state.players.set(client.sessionId, new Player(playerState));
    const newPlayer = this.state.players.get(client.sessionId);

    smallestCiv.members.push(new PlayerSummary({
      publicID: newPlayer.publicID,
      name: newPlayer.name,
    }))

    //Restore items 
    playerState.items.forEach(item=>{
      newPlayer.items.push(new Item(item))
    })
    //Restore inventory
    for(const key in playerState.inventory){
      //@ts-ignore
      newPlayer.inventory[key] = playerState.inventory[key]
    }

    //Add player to physics
    this.room.physics.objects.addPlayerBody(this.state.players.get(client.sessionId) as Player);
  }
}