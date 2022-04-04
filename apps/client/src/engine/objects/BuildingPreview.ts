import { uiState } from "~/state";
import ClientRoom from "../types/ClientRoom";

export default class BuildingPreview extends Phaser.GameObjects.Sprite{
    constructor(scene: ClientRoom) {
        //Placeholder data
        super(scene, 0, 0, "craftbench");
        this.setDepth(1)

        //Request build on click
        scene.input.on('pointerdown', () => {
            if(!uiState.isBuilding) return;
            scene.connection.inputs.buildings.build(uiState.isBuilding, this.scene.input.activePointer.worldX,this.scene.input.activePointer.worldY);
        })
    }

    update(): void {
        if(uiState.isBuilding){
            this.alpha = 0.5;
            this.setTexture(uiState.isBuilding);
            //Go to mouse position
            this.x = this.scene.input.activePointer.worldX;
            this.y = this.scene.input.activePointer.worldY;
        }else{
            this.alpha = 0;
        }
    }
}