import { IPlayer } from "shared";
import ClientRoom from "../types/ClientRoom"
import { PlayerAnimState } from "shared"
import { useLocalPlayerID } from "~/state"

export default class Player extends Phaser.GameObjects.Rectangle{
    hpBar: Phaser.GameObjects.Graphics
    item: Phaser.GameObjects.Sprite
    anims: Record<string, Phaser.Animations.Animation|Phaser.Tweens.Timeline> = {}
    moveTween: Phaser.Tweens.Tween|null = null
    nameTag: Phaser.GameObjects.Text
    isStopped: boolean = false
    local: boolean = false
    interactBody: MatterJS.BodyType

    constructor(scene: ClientRoom, config:IPlayer){
        super(scene,config.x, config.y, 20, 20, 0xffffff)
        scene.add.existing(this)

        //Physics body
        this.scene.matter.add.gameObject(this,{
            inertia: Infinity,
            mass:100,
            isSensor: true,
            label: `player-${config.id}-collider`
        })
        //Interact body
        this.interactBody = this.scene.matter.add.circle(config.x,config.y,30,{
            isSensor: true,
            label: `player-${config.id}`
        })

        this.setData({
            velocityX: 0,
            velocityY: 0,
        })
        this.setName(config.id)
        //Set camera if local player
        if(config.id === useLocalPlayerID()){
            scene.cameras.main.startFollow(this)
            this.local = true
        }

        //Create item
        this.item = scene.add.sprite(config.x,config.y,"wooden_axe")

        //Create HP Bar
        this.hpBar = scene.add.graphics()
        this.hpBar.fillStyle(0xffffff,1)
        this.hpBar.setDepth(10)

        //Create Nametag
        const nameTag = scene.add.text(config.x,config.y,config.name,{
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
            align: 'center',
            wordWrap: {
                width: 100
            }
        })
        nameTag.setDepth(10)
        nameTag.setOrigin(0.5,0.5)
        this.nameTag = nameTag
        this.nameTag.setPipeline('BitmapFont')
        


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
        if(this.isStopped) return;

        const player = this as any
        if(!this.body) return

        const nation = (this.scene as ClientRoom).state.getState("nations",player.getData('nationID') || '')

        try {
            this.moveTween = this.scene.tweens.add({
                targets: [this],
                x: this.getData('x'),
                y: this.getData('y'),
                duration: 100,
                onUpdate:()=>{
                    //Move interact body with player
                    this.interactBody.position.x = player.x
                    this.interactBody.position.y = player.y 
                }
            })
        } catch (e) {}


        //Change where player faces based on mouse position
        player.flipX = this.scene.sys.game.scale.gameSize.width/2 > this.scene.input.activePointer.x
        this.item.flipX = !player.flipX
        
        this.updateItem()


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

        //Update nametag location
        this.nameTag.x = this.x
        this.nameTag.y = this.y - 30
        this.nameTag.setText(`${(nation) ? `[${nation.tag}]` : ''} ${player.getData('name')}`)
    }

    updateItem(){
        const player = this as any
        //Update item appearance
        const items = player.getData('items')
        if(!items) return
        const currentItem = items[player.getData('equippedItemIndex')]

        if(!currentItem){
            this.item.setAlpha(0)
            return
        }
        this.item.setTexture(currentItem.texture)
    }

    cleanup(){
        this.isStopped = true
        const allTweens = this.scene.tweens.getTweensOf(this,true)

        this.moveTween?.remove()
        allTweens.forEach(t=>{
            t.remove()
        })
        
        this.item.destroy()
        this.hpBar.destroy()
        this.nameTag.destroy()
        this.scene.matter.world.remove(this.interactBody)
        this.destroy()
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