import { IBuilding } from 'shared'
import Building from './index';
import CraftbenchBody from 'shared/bodies/buildings/CraftbenchBody';

interface Config {
    id: string;
    x: number;
    y: number;
}

export default class Craftbench extends Building {
    constructor(scene: Phaser.Scene, config: Config) {
        const buildingConfig: IBuilding = {
            x: config.x,
            y: config.y,
            type: "tree",
            id:config.id,
            health: 100
        }
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...CraftbenchBody(buildingConfig))
        super(scene, buildingConfig,collisionBox,"craftbench");
    }
}