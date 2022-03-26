import { IPlayer } from "shared";
import ClientRoom from "../types/ClientRoom"
import { PlayerAnimState, PlayerState } from "shared"
import { useLocalPlayerID } from "~/state"

export default class Player extends Phaser.GameObjects.Rectangle{
    hpBar: Phaser.GameObjects.Graphics
    currentState: PlayerState = PlayerState.IDLE
    item: Phaser.GameObjects.Sprite
    anims: Record<string, Phaser.Animations.Animation|Phaser.Tweens.Timeline> = {}

    constructor(scene: ClientRoom, config:IPlayer){
        super(scene,config.x, config.y, 20, 20, 0xffffff)
        scene.add.existing(this)

        //Physics body
        this.scene.matter.add.gameObject(this,{
            inertia: Infinity,
            mass:100,
            label: `player-${config.id}-collider`
        })
        //Interact body
        const interactBody = this.scene.matter.add.circle(config.x,config.y,30,{
            isSensor: true,
            label: `player-${config.id}`
        })
        //Connect to collider
        this.scene.matter.world.add(this.scene.matter.constraint.create({
            bodyA: interactBody,
            bodyB: this.body as any,    
        }))

        this.setData({
            velocityX: 0,
            velocityY: 0,
        })
        this.setName(config.id)

        //Set camera if local player
        if(config.id === useLocalPlayerID()){
            scene.cameras.main.startFollow(this)
        }

        //Create item
        this.item = scene.add.sprite(config.x,config.y,'items',21)

        //Create HP Bar
        this.hpBar = scene.add.graphics()
        this.hpBar.fillStyle(0xffffff,1)
        this.hpBar.setDepth(10)
        


        //Event Listeners ========

        //Handle animation requests
        this.scene.events.on(`${this.name}-anim`,(requestedAnim:PlayerAnimState)=>{
            if(requestedAnim === PlayerAnimState.BASIC_ATTACK){
                this.basicAttack()
            }
        })

        //Draw item animation
        this.on(`changedata-equippedItemIndex`,()=>{
            this.scene.tweens.add({
                targets: this.item,
                scaleX:{
                    from: 0,
                    to: 1,
                },
                scaleY:{
                    from: 0,
                    to: 1,
                },
                duration: 100,
            })
        })
    }

    update(time: number, delta: number): void {
        const player = this as any
        
        player.setVelocityX(player.data.get('velocityX'))
        player.setVelocityY(player.data.get('velocityY'))

        //Change where player faces based on mouse position
        player.flipX = this.scene.sys.game.scale.gameSize.width/2 > this.scene.input.activePointer.x
        this.item.flipX = !player.flipX
        
        //Update item appearance
        const currentItem = player.data.get('items')[player.data.get('equippedItemIndex')]
        this.item.setTexture(currentItem.texture)


        //Update item position
        if(this.item.flipX){
            this.item.setOrigin(0,0.9)
            this.item.x = this.x + 5
            this.item.y = this.y + 5
        }else{
            this.item.setOrigin(0.9,0.9)
            this.item.x = this.x - 10
            this.item.y = this.y + 5
        }

        //Update HP bar
        this.hpBar.clear()
        this.hpBar.fillStyle(0x00ff00, 1)
        this.hpBar.lineStyle(1, 0x000000, 1)
        //Bar
        this.hpBar.fillRect(this.x-18,this.y-20,(35*(this.data.get('health')/this.data.get('maxHealth'))),5)
        //Border
        this.hpBar.strokeRect(this.x-18,this.y-20,35,6)
    }

    cleanup(){
        this.scene.matter.world.remove(this.body)
        super.destroy()
    }

    /** Only plays animation */
    basicAttack(){
        const weapon = this.item
        const player = this as any
        this.scene.tweens.add({
            targets: weapon,
            angle: player.flipX ? -360 : 360,
            duration: 200,
            ease: "Phaser.Math.Easing.Expo.InOut"
        })
    }
}