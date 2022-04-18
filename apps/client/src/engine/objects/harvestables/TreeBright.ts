import { IHarvestable } from "shared";
import Harvestable from ".";
import TreeBody from "shared/bodies/harvestables/TreeBrightBody";

export default class TreeBright extends Harvestable {
    constructor(scene: Phaser.Scene, harvestableConfig: IHarvestable) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...TreeBody(harvestableConfig))
        //Variance in the texture
        const treeSubIndex = Math.round(Math.random())
        super(scene, harvestableConfig,collisionBox,`Tree_bright_${treeSubIndex}`);
        this.originY = 0.8

        this.play(`tree-bright-idle-${treeSubIndex}`)
    }
}