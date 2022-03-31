import { Engine, Bodies, Composite, Events } from 'matter-js';
import { IState } from 'shared';
import Runner from 'shared/physics/runner';
import { ServerBody } from './ServerBody';
import TileStorage from 'shared/helpers/tiles';
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
        Events.on(this.engine,"collisionend",(event)=>{
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
        
        const harvestableLayer = map.layers.find((layer:any) => layer.type === "objectgroup" && layer.name === "HARVESTABLES")
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
                    const body = Bodies.rectangle(col*map.tileheight,row*map.tileheight,map.tileheight,map.tileheight,{
                        isStatic: true
                    })
                    Composite.add(this.world,body)
                }
            }
       }

       //Insert harvestable objects
       harvestableLayer.objects.forEach((o:any) => {
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
}