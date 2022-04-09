import { IBuilding } from 'shared'
import Building from './index';
import CampfireBody from 'shared/bodies/buildings/CampfireBody';
import ClientRoom from '~/engine/types/ClientRoom';


export default class Campfire extends Building {
    constructor(scene: ClientRoom, buildingConfig: IBuilding) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...CampfireBody(buildingConfig))
        super(scene, buildingConfig,collisionBox,"campfire");
        this.play("campfire_idle")
    }
}