import { IBuilding } from "shared"

export default class Building extends Phaser.GameObjects.Sprite{
    hpBar: Phaser.GameObjects.Graphics
    playingDamagedAnim: boolean = false

    constructor(scene: Phaser.Scene, config:IBuilding,body:MatterJS.BodyType,texture:string){
        super(scene,config.x,config.y,texture)
        this.setName(config.id)
        this.scene.matter.add.gameObject(this, body)
        this.setData({
            health: 100,
        })
        scene.add.existing(this)
        
        //HP Bar
        this.hpBar = this.scene.add.graphics()
    }

    create(){
        this.on("changedata-health",(obj:any,currentHealth:number,lastHealth:number)=>{
            if(currentHealth <= 0){
               this.cleanup()
            }
        })
    }
    
    update(time: number, delta: number): void {
        //Renders HP Bar
        if(this.data.get('health') === 100) return
        this.hpBar.clear()
        this.hpBar.fillStyle(0x00ff00, 1)
        this.hpBar.lineStyle(1, 0x000000, 1)
        this.hpBar.fillRect(this.x-25,this.y-10,this.data.get('health')/2,5)
        this.hpBar.strokeRect(this.x-25,this.y-10,50,6)
    }
    cleanup(){
        this.scene.matter.world.remove(this.body)
        this.hpBar.destroy()
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