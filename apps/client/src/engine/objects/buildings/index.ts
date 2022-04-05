import { IBuilding } from "shared"
import ClientRoom from "~/engine/types/ClientRoom"
import { useLocalPlayerID } from "~/state"

export default class Building extends Phaser.GameObjects.Sprite{
    playingDamagedAnim: boolean = false
    isNearLocalPlayer: boolean = false

    constructor(scene: ClientRoom, config:IBuilding,body:MatterJS.BodyType,texture:string){
        super(scene,config.x,config.y,texture)
        this.setName(config.id)
        this.scene.matter.add.gameObject(this, body)
        this.setData({
            health: 100,
            maxHealth: 100,
        })
        scene.add.existing(this)
    }

    create(){
        this.on("changedata-health",(obj:any,currentHealth:number,lastHealth:number)=>{
            if(currentHealth <= 0){
               this.cleanup()
            }
        });

        const body = this.body as MatterJS.BodyType
        //Detect if player is near
        body.onCollideCallback = (event:any) => {
            if(event.bodyA.label === `player-${useLocalPlayerID()}`){
                this.emit("nearLocalPlayer")
            }
        }
        body.onCollideEndCallback = (event:any) => {
            if(event.bodyA.label === `player-${useLocalPlayerID()}`){
                this.emit("notNearLocalPlayer")
            }
        }
    }
    
    update(time: number, delta: number): void {
    }
    cleanup(){
        this.scene.matter.world.remove(this.body)
        //FadeOut and Shrink
        this.scene.tweens.add({
            targets: [this],
            scale:0,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                super.destroy()
            }
        })
    }
}