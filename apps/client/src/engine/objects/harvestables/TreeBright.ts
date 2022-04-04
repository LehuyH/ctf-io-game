import { IHarvestable } from "shared";
import Harvestable from ".";
import TreeBody from "shared/bodies/harvestables/TreeBrightBody";

export default class TreeBright extends Harvestable {
    constructor(scene: Phaser.Scene, harvestableConfig: IHarvestable) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...TreeBody(harvestableConfig))
        super(scene, harvestableConfig,collisionBox,"Tree_bright");
        this.originY = 0.8

        this.play("tree-bright-idle")
    }
}