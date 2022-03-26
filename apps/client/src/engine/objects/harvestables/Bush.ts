import { IHarvestable } from "shared";
import BushBody from "shared/bodies/harvestables/BushBody";
import Harvestable from ".";

interface Config{
    x: number;
    y: number;
    id: string;
}

export default class Bush extends Harvestable {
    constructor(scene: Phaser.Scene, config: Config) {
        const harvestableConfig: IHarvestable = {
            x: config.x,
            y: config.y,
            type: "bush",
            resource: "wood",
            id:config.id,
            health: 100,
            value: 5,
        }
        //@ts-ignore
        const body = scene.matter.bodies.rectangle(...BushBody(harvestableConfig))
        super(scene, harvestableConfig,body,"bush");
        this.play("bush-idle")
    }
}