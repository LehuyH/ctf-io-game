import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Item, Player } from "../schema/state";
import { Client } from "colyseus";
import { PlayerAnimState } from 'shared'
import { calcHarvestDamage } from 'shared/helpers'

interface IConfig{
    client: Client
}

export class UseActiveTool extends Command<BaseRoom, IConfig> {
  validate({ client }:IConfig): boolean {
    const player = this.state.players.get(client.sessionId);
    const heldItem = player.items[player.equippedItemIndex]
    return !!heldItem
  }

  execute({ client }: IConfig) {
    const player = this.state.players.get(client.sessionId);

    const collidedHarvestables = this.room.physics.getCollisions(`player-${client.id}`).filter(id=>id.startsWith("harvestable-"))
    const collidedBuildings = this.room.physics.getCollisions(`player-${client.id}`).filter(id=>id.startsWith("building-"))
    const heldItem = player.items[player.equippedItemIndex]

    this.room.broadcast(`${client.sessionId}-anim`,PlayerAnimState.BASIC_ATTACK)

    //Handle harvestables
    collidedHarvestables.forEach(id=>{
        const harvestableState = this.state.harvestables.get(id.split("-")[1])
        if(!harvestableState) return
        harvestableState.health -= calcHarvestDamage(harvestableState,heldItem)

        if(harvestableState.health <= 0){
           //Remove harvestable
           this.room.physics.objects.removeHarvestable(id.split("-")[1])
           
            //Give resource to player
            player.inventory.set(harvestableState.resource,player.inventory.get(harvestableState.resource) || 0)
            player.inventory.set(harvestableState.resource,player.inventory.get(harvestableState.resource) + harvestableState.value)

            //Add it back after 60 seconds
            this.room.physics.runner.addDelayedCallback((delta,state)=>{
                const newState = {
                  ...harvestableState,
                  health: harvestableState.maxHealth,
                }
                this.room.physics.objects.addHarvestable(newState)
            },60 * 1000)
            
        }
    })

    //Handle buildings
    collidedBuildings.forEach(id=>{
        const buildingState = this.state.buildings.get(id.split("-")[1])
        if(!buildingState) return
        buildingState.health -= heldItem.damage
        if(buildingState.health <= 0){
            //Remove building from state
            this.state.buildings.delete(id.split("-")[1])
        }
    })
  }
}