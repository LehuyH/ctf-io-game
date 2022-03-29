import ClientRoom from "../types/ClientRoom";
import { EventType, IHarvestable, IPlayer, PlayerAnimState } from "shared"
import Runner from 'shared/physics/runner'
import buildingBodies from 'shared/bodies'
import uniqid from 'uniqid'
import { calcHarvestDamage, canPay, processPay } from 'shared/helpers'
import TileStorage, { TileType } from 'shared/helpers/tiles'
import buildingsData from '~/assets/data/buildings.json'

export interface EventPayload {
    type: EventType;
}

export default class ServerEmulator {
    collisions: Record<string,Array<string>> = {};
    scene: ClientRoom
    runner: Runner
    tiles: TileStorage = null as any
    constructor(scene: ClientRoom){
        this.scene = scene;
        this.runner = new Runner(this.scene.matter.world,this.scene.state.state)
        //@ts-ignore
        window.collisions = this.collisions
        scene.matter.world.on("collisionstart",(event:any, bodyA:MatterJS.BodyType, bodyB:MatterJS.BodyType)=>{
            //If none are player ignore
            if(!bodyA.label.startsWith("player-") && !bodyB.label.startsWith("player-")){
                return;
            }
            //If both are players
            if(bodyA.label.startsWith("player-") && bodyB.label.startsWith("player-")){
                const playerA = bodyA.label
                const playerB = bodyB.label
                this.storeCollision(playerA,playerB)
                this.storeCollision(playerB,playerA)
            }
            const playerBody = bodyA.label.startsWith("player-") ? bodyA : bodyB;
            const otherBody = bodyA.label.startsWith("player-") ? bodyB : bodyA;

            this.storeCollision(playerBody.label,otherBody.label)
        })
        scene.matter.world.on("collisionend",(event:any, bodyA:MatterJS.BodyType, bodyB:MatterJS.BodyType)=>{
            //If none are player ignore
            if(!bodyA.label.startsWith("player-") && !bodyB.label.startsWith("player-")){
                return;
            }
            //If both are players
            if(bodyA.label.startsWith("player-") && bodyB.label.startsWith("player-")){
                const playerA = bodyA.label
                const playerB = bodyB.label
                this.removeCollision(playerA,playerB)
                this.removeCollision(playerB,playerA)
            }
            const playerBody = bodyA.label.startsWith("player-") ? bodyA : bodyB;
            const otherBody = bodyA.label.startsWith("player-") ? bodyB : bodyA;

            this.removeCollision(playerBody.label,otherBody.label)
    
        })
    }

    storeCollision(target:string,collided:string){
        if(!this.collisions[target]){
            this.collisions[target] = []
        }
        if(!this.collisions[target].includes(collided)){
            this.collisions[target].push(collided)
        }
    }

    removeCollision(target:string,collided:string){
        if(this.collisions[target]){
            this.collisions[target] = this.collisions[target].filter(id=>id!==collided)
        }
    }

    getCollisions(target:string){
        return this.collisions[target] || []
    }

    actions = {
        harvest: (playerID:string)=>{
            const collidedHarvestables = this.getCollisions(`player-${playerID}`).filter(id=>id.startsWith("harvestable-"))
            const collidedBuildings = this.getCollisions(`player-${playerID}`).filter(id=>id.startsWith("building-"))
            const player = this.scene.state.getState<IPlayer>("players",playerID)
            this.scene.connection.mockBroadcast(`${playerID}-anim`,PlayerAnimState.BASIC_ATTACK)

            const heldItem = player.items[player.equippedItemIndex]

            collidedHarvestables.forEach(id=>{
                const h = this.scene.state.getState<IHarvestable>("harvestables",id)
                h.health -= calcHarvestDamage(h,heldItem)

                if(h.health <= 0){
                    this.scene.state.removeState("harvestables",id)
                    //Give item to player
                    player.inventory[h.resource] = player.inventory[h.resource] || 0
                    player.inventory[h.resource] += h.value
                }
            })

            collidedBuildings.forEach(id=>{
                const b = this.scene.state.getState<any>("buildings",id)
                b.health -= heldItem.damage
                if(b.health <= 0){
                    this.scene.state.removeState("buildings",id)
                }
            })
        },
        nextItem: (playerID:string)=>{
            const playerState = this.scene.state.getPlayer(playerID)
            const currentItemIndex = playerState.equippedItemIndex
            if(!playerState.items[currentItemIndex+1]) return
            playerState.equippedItemIndex += 1
        },
        prevItem: (playerID:string)=>{
            const playerState = this.scene.state.getPlayer(playerID)
            const currentItemIndex = playerState.equippedItemIndex
            if(currentItemIndex === 0) return
            playerState.equippedItemIndex -= 1
        },
        setItem: (playerID:string,itemIndex:number)=>{
            const playerState = this.scene.state.getPlayer(playerID)
            if(!playerState.items[itemIndex]) return
            playerState.equippedItemIndex = itemIndex
        },
        build: (type:string,playerID:string,x:number,y:number)=>{
            const player = this.scene.state.getPlayer(playerID)
            const buildingData = buildingsData.find(b=>b.type===type)
            if(!buildingData || !player || !buildingBodies[type]) return

            const cost = buildingData.cost
            const inventory = player.inventory  

            if(!canPay(cost,inventory)) return

            const body = buildingBodies[type]({x,y})
            const width = body[2]
            const height = body[3]
            const maxHealth = buildingData.maxHealth

            //Check if there is a collision
            const collision = this.checks.collidesWithAny({
                x,
                y,
                width,
                height
            })

            //Check if touches water
            const touchesWater = this.checks.touchesWater({
                x,
                y,
                width,
                height
            })

            if(collision || touchesWater) return;

            processPay(cost,inventory)
            const id = uniqid()
            this.scene.state.state.buildings[id] = {
                type,
                x,
                y,
                health: maxHealth,
                maxHealth,
                id,
                ownerID:playerID
            }
        }
    }

    checks = {
        collidesWithAny: (body:{x:number,y:number,width:number,height:number})=>{
           return this.scene.matter.intersectRect(body.x,body.y,body.width,body.height).length > 0
        },
        touchesWater: (body:{x:number,y:number,width:number,height:number})=>{
            return this.tiles.getTilesInRect(body).includes(TileType.WATER)
        }
    }

    update(delta:number){
        this.runner.tick(delta)
    }
}