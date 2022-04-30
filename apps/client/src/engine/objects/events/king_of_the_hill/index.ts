import { IKingOfTheKillState, ZoneRadius } from "shared/events/kingOfTheHill"
import { ClientEventManager } from "../index"
import { IEventInfo } from "shared"
import ClientRoom from "~/engine/types/ClientRoom";
import { uiState } from "~/state";

export class KingOfTheHillClient implements ClientEventManager<IKingOfTheKillState>{
    name: string;
    description: string;
    duration: number;
    data: IKingOfTheKillState;
    scene: ClientRoom;
    id:string;
    objects: {
        zone?: Phaser.GameObjects.GameObject
    }

    constructor(scene:ClientRoom,state:IEventInfo<IKingOfTheKillState>){
        this.name = state.name
        this.description = state.description
        this.duration = state.duration
        this.data = state.data
        this.id = state.id
        this.scene = scene
        this.objects = {}
    }

    setup(){
        const cir = this.scene.add.circle(this.data.x, this.data.y, ZoneRadius, 0x888888,0.5)
        this.objects.zone = this.scene.matter.add.gameObject(cir,this.scene.matter.bodies.circle(this.data.x,this.data.y,ZoneRadius))
        this.scene.tweens.add({
            targets:this.objects.zone,
            alpha:{
                from:0,
                to:1
            },
            duration:1000,
            ease: "Cubic"
        })
        uiState.waypoints.push({
            x:this.data.x,
            y:this.data.y,
            icon:"clarity:target-solid",
            name:"Zone",
            color:"white"
        })
    }
    cleanup(){
        this.scene.tweens.add({
            targets:this.objects.zone,
            alpha:{
                from:1,
                to:0
            },
            duration:1000,
            ease: "Cubic",
            onComplete: ()=>{
                this.objects.zone?.destroy()
            }
        })

        uiState.waypoints = uiState.waypoints.filter(w=>w.name!="Zone")
    }
    update(){}  
}