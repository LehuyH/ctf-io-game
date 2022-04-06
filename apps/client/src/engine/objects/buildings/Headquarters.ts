import { IBuilding } from 'shared'
import Building from './index';
import HeadquartersBody from 'shared/bodies/buildings/HeadquartersBody';
import ClientRoom from '~/engine/types/ClientRoom';



export default class Headquarters extends Building {
    constructor(scene: ClientRoom, buildingConfig: IBuilding) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...HeadquartersBody(buildingConfig))
        super(scene, buildingConfig,collisionBox,"headquarters");
        this.setOrigin(0.5,0.7)
    }
    cleanup(): void {
        super.cleanup()
    }
}