import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Item } from "../schema/state";
import { Client } from "colyseus";
import { canPay, processPay } from "shared/helpers";
import itemsData from 'shared/data/items.json'

interface IConfig{
    itemName:string;
    buildingName:string;
    client: Client;
}

const allowedItems = {
    craftbench: ["Wooden Axe", "Wooden Pickaxe", "Wooden Sword"]
} as Record<string, string[]>

export class CraftItem extends Command<BaseRoom, IConfig> {
  validate({itemName,buildingName,client}:IConfig){
    const player = this.state.players.get(client.sessionId)
    const itemShop = allowedItems[buildingName]
    if(!player || !itemShop) return false

    //Check to see if player is close to building
    const collisions = this.room.physics.getCollisions(`player-${client.id}`).filter(id=>id.endsWith(buildingName))
    if(collisions.length === 0) return false

    //Check to see if item is craftable at the building
    const isAllowed = itemShop.includes(itemName)
    if(!isAllowed) return false
    
    const item = itemsData.find(i=>i.name===itemName)
    return canPay(item.cost,player.inventory as any)
  }
  execute({itemName,client}:IConfig){
    const item = itemsData.find(i=>i.name===itemName)
    const player = this.state.players.get(client.sessionId)

    processPay(item.cost,player.inventory as any)

    player.items.push(new Item(item))
  }
}