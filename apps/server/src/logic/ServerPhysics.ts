import Matter, { Engine, Bodies, Composite, Events, Query } from 'matter-js';
import { IState } from 'shared';
import Runner from 'shared/physics/runner';
import buildingsData from 'shared/data/buildings.json'
import TileStorage, { TileType } from 'shared/helpers/tiles';
import uniqid from 'uniqid';
import ServerObjects from './ServerObjects';

export default class ServerPhysics{
    engine: Matter.Engine
    world: Matter.World
    objects: ServerObjects
    runner: Runner
    state: IState
    tileStorage: TileStorage = null as any
    collisions: Record<string,Array<string>> = {};

    constructor(state:IState){
        this.state = state;
        this.engine = Engine.create({
            gravity:{
                y:0
            },
            enableSleeping: false
        })
        this.world = this.engine.world
        this.objects = new ServerObjects(state,this.world)
        // @NOTE this is a hack to make sure the physics can be stepped

        //@ts-ignore
        this.world.step = (delta:number) => {
          Engine.update(this.engine, delta);
        }
        
        //@ts-ignore
        this.runner = new Runner(this.engine.world, this.world)

        //Setup events
        Events.on(this.engine, "collisionStart",(event)=>{
            const bodyA = event.pairs[0].bodyA
            const bodyB = event.pairs[0].bodyB

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
        Events.on(this.engine,"collisionEnd",(event)=>{
            const bodyA =  event.pairs[0].bodyA
            const bodyB =  event.pairs[0].bodyB

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

    tick(delta:number){
        this.objects.update(delta)
        this.runner.tick(delta)
        this.objects.sync()
    }

    //Loads a tiled map into the physics engine
    loadMapJSON(data:string){
        const map = JSON.parse(data)

        this.tileStorage = new TileStorage(map.width,map.height,map.tileheight)
        this.tileStorage.importMapRaw(JSON.stringify(map))
        
        const objectLayer = map.layers.find((layer:any) => layer.type === "objectgroup" && layer.name === "OBJECTS")
        const collisionLayer = map.layers.find((layer:any) => layer.name === "COLLISIONS" && layer.type === "tilelayer")
        //Parsed 2d array of tiles
        const collisionMap = [] 
        while(collisionLayer.data.length > 0){
            collisionMap.push(collisionLayer.data.splice(0,map.width))
        }

       //Create collision from collision layer
       for(let row = 0; row < map.height; row++){
            for(let col = 0; col < map.width; col++){
                const tile = collisionMap[row][col]
                if(tile > 0){
                    const body = Bodies.rectangle(col*map.tileheight+(map.tileheight/2),row*map.tileheight+(map.tileheight/2),map.tileheight,map.tileheight,{
                        isStatic: true
                    })
                    Composite.add(this.world,body)
                }
            }
       }

       //Insert harvestable objects
       const harvestableObjects = objectLayer.objects.filter((o:any)=> o.properties.find((p:any)=>p.name==="type").value === "harvestable")
       harvestableObjects.forEach((o:any) => {
           const id = uniqid()
           const health = o.properties.find((p:any)=>p.name==='health').value as number
           const value = o.properties.find((p:any)=>p.name==='value').value as number
           const resource = o.properties.find((p:any)=>p.name==='resource').value as string

           this.objects.addHarvestable({
                id,
                x: o.x as number,
                y: o.y as number,
                health,
                maxHealth:health,
                type: o.name,
                value,
                resource
            })
        })

        //Add buildings
        const buildingObjects = objectLayer.objects.filter((o:any)=> o.properties.find((p:any)=>p.name==="type").value === "building")
        buildingObjects.forEach((o:any) => {
            const id = uniqid()
            const buildingType = o.properties.find((p:any)=>p.name==='buildingType').value as string
            const building = buildingsData.find(b=>b.type===buildingType)
            const ownerCivID = o.properties.find((p:any)=>p.name==='ownerCivID').value as string

            if(!building) return;

            this.objects.addBuilding({
                id,
                type:building.type,
                x:o.x,
                y:o.y,
                ownerPlayerID: null,
                ownerCivID,
                health: building.maxHealth,
                maxHealth: building.maxHealth,
                cost: building.cost
            })
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

    checks = {
        collidesWithAny: (body:{x:number,y:number,width:number,height:number})=>{
            const bodies = this.world.bodies
            //Center origins bounds
            const bounds = {
                min:{
                    x:body.x-(body.width/2),
                    y:body.y-(body.height/2)
                },
                max:{
                    x:body.x+(body.width/2),
                    y:body.y+(body.height/2)
                }
            }
            const output:Matter.Body[] = [] 
            const result = Query.region(bodies, bounds)

            result.forEach((body) => {
                if(!output.includes(body)){
                    //Do not add if it is the player interact body
                    if(body.label.startsWith("player-") && !body.label.includes("collider")){
                        return;
                    }
                    output.push(body)
                }
            })
            return output.length > 0
         },
         touchesWater: (body:{x:number,y:number,width:number,height:number})=>{
             return this.tileStorage.getTilesInRect(body).includes(TileType.WATER)
         }
    }
}