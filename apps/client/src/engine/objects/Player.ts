import { IPlayer } from "shared";
import ClientRoom from "../types/ClientRoom"
import { PlayerAnimState } from "shared"
import { useLocalPlayerID } from "~/state"

export default class Player extends Phaser.GameObjects.Sprite{
    hpBar: Phaser.GameObjects.Graphics
    item: Phaser.GameObjects.Sprite
    moveTween: Phaser.Tweens.Tween|null = null
    nameTag: Phaser.GameObjects.Text
    heldInfluence: Phaser.GameObjects.Text
    isStopped: boolean = false
    local: boolean = false
    interactBody: MatterJS.BodyType

    constructor(scene: ClientRoom, config:IPlayer){
        super(scene,config.x, config.y, "male_player_1")
        scene.add.existing(this)

        //Physics body
        this.scene.matter.add.gameObject(this,{
            inertia: Infinity,
            mass:100,
            isSensor: true,
            label: `player-${config.sessionID}-collider`
        })
        //Interact body
        this.interactBody = this.scene.matter.add.circle(config.x,config.y,30,{
            isSensor: true,
            label: `player-${config.sessionID}`
        })

        this.setData(config)
        this.setName(config.sessionID)
        //Set camera if local player
        if(config.sessionID === useLocalPlayerID()){
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

        //Create heldInfluence text
        const heldInfluence = scene.add.text(config.x,config.y,"",{
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            wordWrap: {
                width: 100
            }
        })
        heldInfluence.setDepth(10)
        heldInfluence.setOrigin(0.5,0.5)
        heldInfluence.setVisible(false)
        this.heldInfluence = heldInfluence
        this.heldInfluence.setPipeline('BitmapFont')




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

        this.on(`changedata-x`,(object:any,currX:number,prevX:number)=>{
            this.flipX = Math.sign(currX - prevX) === 1
            this.play(`${this.texture.key}_walkX`,true)
        })
        this.on(`changedata-y`,(object:any,currY:number,prevY:number)=>{
            const currentAnimName = (this as any).anims?.getName() || ""
            const animIsPlaying = (this as any).anims?.isPlaying || false

            if(animIsPlaying && currentAnimName && (currentAnimName.endsWith("_walkX"))){
                return;
            }

            const animName = (Math.sign(currY - prevY) === 1) ? `${this.texture.key}_walkDown` : `${this.texture.key}_walkUp`
            this.play(animName,true)
        })
    }

    update(time: number, delta: number): void {
        if(this.isStopped) return;

        const player = this as any
        if(!this.body) return

        const civ = (this.scene as ClientRoom).state.getState("civs",player.getData('civID') || '')

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


        this.item.flipX = player.flipX
        
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

        //Convert color hex to hexadecimal
        const color = `0x${civ.color.replace("#","")}`
        //Update HP bar
        this.hpBar.clear()
        this.hpBar.fillStyle(color as any, 1)
        this.hpBar.lineStyle(1, 0x000000, 1)
        //Bar
        this.hpBar.fillRect(this.x-18,this.y-22,(35*(this.data.get('health')/this.data.get('maxHealth'))),5)
        //Border
        this.hpBar.strokeRect(this.x-18,this.y-22,35,6)

        //Update nametag location
        this.nameTag.x = this.x
        this.nameTag.y = this.y - 30

        //Update heldInfluence text
        if (this.getData('inventory').influencePoints > 0) {
            this.heldInfluence.x = this.x
            this.heldInfluence.y = this.y - 45
            this.heldInfluence.setText(`Holding ${this.getData('inventory').influencePoints} influence!`)
            this.heldInfluence.setVisible(true)
        } else {
            this.heldInfluence.setVisible(false)
        }
        
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
        this.heldInfluence.destroy()
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
            angle: player.flipX ? 360 : -360,
            duration: 200,
            ease: "Phaser.Math.Easing.Expo.InOut"
        })
    }
}