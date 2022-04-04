import { IHarvestable } from "shared";
import Harvestable from ".";
import TreeBody from "shared/bodies/harvestables/TreeDesertBody";

export default class TreeDesert extends Harvestable {
    constructor(scene: Phaser.Scene, harvestableConfig: IHarvestable) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...TreeBody(harvestableConfig))
        super(scene, harvestableConfig,collisionBox,"Tree_desert");
        this.originY = 0.7

        this.play("tree-desert-idle")
    }
}