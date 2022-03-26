import { IHarvestable } from "shared"

export default class Harvestable extends Phaser.GameObjects.Sprite{
    hpBar: Phaser.GameObjects.Graphics
    playingDamagedAnim: boolean = false

    constructor(scene: Phaser.Scene, config:IHarvestable,body:MatterJS.BodyType,texture:string){
        super(scene,config.x,config.y,texture)
        this.setName(config.id)
        this.scene.matter.add.gameObject(this, body)
        this.setData({
            health: 50,
            maxHealth: 50
        })
        this.setDepth(1)
        scene.add.existing(this)
        
        
        //HP Bar
        this.hpBar = this.scene.add.graphics()
        this.hpBar.setDepth(2)
    }

    create(){
        this.on("changedata-health",(obj:any,currentHealth:number,lastHealth:number)=>{
            if(currentHealth === this.getData('maxHealth')) return;
            if(currentHealth <= 0){
               this.cleanup()
            }else{
                 //Damage indicator
                 const damageText = this.scene.add.text(this.x - 15, this.y - 10, `${lastHealth-currentHealth}`, {
                     fontSize: '15px',
                     color: '#ffffff',
                     fontFamily: 'Arial',
                     align: 'center'
                 })

                 damageText.setDepth(2)

                 this.scene.tweens.add({
                     targets: damageText,
                     alpha: 0,
                     duration: 1000,
                     y: "-=30",
                     onComplete: () => {
                         damageText.destroy()
                     }
                 })

                //Pulse the object
                if(this.playingDamagedAnim) return
                this.playingDamagedAnim = true
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => this.playingDamagedAnim = false
                })
            }
        })
    }
    
    update(time: number, delta: number): void {
        //Renders HP Bar
        if(this.data.get('health') === this.data.get('maxHealth')) return
        this.hpBar.clear()
        this.hpBar.fillStyle(0x00ff00, 1)
        this.hpBar.lineStyle(1, 0x000000, 1)
        this.hpBar.fillRect(this.x-25,this.y-10,this.data.get('health')/2,5)
        this.hpBar.strokeRect(this.x-25,this.y-10,this.data.get('maxHealth')/2,6)
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