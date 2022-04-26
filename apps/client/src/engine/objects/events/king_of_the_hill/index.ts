import { IKingOfTheKillState, ZoneRadius } from "shared/events/kingOfTheHill"
import { ClientEventManager } from "../index"
import { IEventInfo } from "shared"
import ClientRoom from "~/engine/types/ClientRoom";

export class KingOfTheHillClient implements ClientEventManager<IKingOfTheKillState>{
    name: string;
    description: string;
    duration: number;
    data: IKingOfTheKillState;
    scene: ClientRoom;

    objects: {
        zone?: Phaser.GameObjects.Arc
    }

    constructor(scene:ClientRoom,state:IEventInfo<IKingOfTheKillState>){
        this.name = state.name
        this.description = state.description
        this.duration = state.duration
        this.data = state.data
        this.scene = scene
        this.objects = {}
    }

    setup(){
        this.objects.zone = this.scene.add.circle(this.data.x, this.data.y, ZoneRadius, 0x888888, 0.5)
        this.scene.matter.add.gameObject(this.objects.zone)
    }
    cleanup(){
        this.objects.zone?.destroy()
        delete this.objects.zone
    }
    update(){}
}