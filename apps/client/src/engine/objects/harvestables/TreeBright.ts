import { IHarvestable } from "shared";
import Harvestable from ".";
import TreeBody from "shared/bodies/harvestables/TreeBrightBody";

interface Config{
    x: number;
    y: number;
    id: string;
}

export default class TreeBright extends Harvestable {
    constructor(scene: Phaser.Scene, config: Config) {
        const harvestableConfig: IHarvestable = {
            x: config.x,
            y: config.y,
            type: "tree",
            resource: "wood",
            id:config.id,
            health: 100,
            maxHealth: 100,
            value: 10,
        }
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...TreeBody(harvestableConfig))
        super(scene, harvestableConfig,collisionBox,"Tree_bright");
        this.originY = 0.8

        this.play("tree-bright-idle")
    }
}