import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Item, Player } from "../schema/state";
import { Client } from "colyseus";
import { ItemType, PlayerAnimState } from 'shared'
import { calcHarvestDamage, calcPlayerDamage } from 'shared/helpers'
import Matter from "matter-js";

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
    const collidedPlayers = this.room.physics.getCollisions(`player-${client.id}`).filter(id=>id.startsWith("player-") && !id.endsWith("-collider"))
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
            this.room.physics.objects.removeBuilding(id.split("-")[1])
        }
    })

    //Handle players
    collidedPlayers.forEach(id=>{
        const targetPlayerState = this.state.players.get(id.split("-")[1])
        const attackingPlayerState = this.state.players.get(client.sessionId)

        if (!targetPlayerState || !attackingPlayerState) return

        //Same team
        if (targetPlayerState.civID === attackingPlayerState.civID) return

         
        const {body:targetBody} = targetPlayerState.body
        const {body:attackingBody} = attackingPlayerState.body
        
        //Apply damage
        const dmg = calcPlayerDamage(heldItem)
        targetPlayerState.health -= dmg

        //Calculate knockback vector
        if (targetPlayerState.health > 0) {
          const baseVector = Matter.Vector.normalise(Matter.Vector.sub(targetBody.position, attackingBody.position))
          const knockbackVector = Matter.Vector.mult(baseVector, 2)
          Matter.Body.applyForce(targetBody, targetBody.position, knockbackVector)
        }
        
        //Handle death
        if(targetPlayerState.health <= 0){
          //Respawn at civ HQ
          /** @TODO - load capital location from map */
          const civHQ = false
          if (civHQ) {
            //Matter.Body.setPosition(targetBody, civHQ.body.position)
          } else {
            Matter.Body.setPosition(targetBody, {
              x: 2752,
              y: 2752
            })
          }

          //Remove collision records
          this.room.physics.removeCollision(`player-${client.sessionId}`,`player-${targetPlayerState.sessionID}`)
          this.room.physics.removeCollision(`player-${client.sessionId}`,`player-${targetPlayerState.sessionID}-collider`)
          this.room.physics.collisions[`player-${targetPlayerState.sessionID}`] = []
          this.room.physics.collisions[`player-${targetPlayerState.sessionID}-collider`] = []

          targetPlayerState.health = targetPlayerState.maxHealth
          targetPlayerState.items = [
            new Item({
              name: "Wooden Axe",
              type: ItemType.AXE,
              texture: "wooden_axe",
              damage:10
            })
          ]
          targetPlayerState.equippedItemIndex = 0
          targetPlayerState.inventory.clear()
        }
    })
  }
}