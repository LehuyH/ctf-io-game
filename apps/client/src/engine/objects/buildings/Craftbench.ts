import { IBuilding } from 'shared'
import Building from './index';
import CraftbenchBody from 'shared/bodies/buildings/CraftbenchBody';
import ClientRoom from '~/engine/types/ClientRoom';
import { uiState } from '~/state';


export default class Craftbench extends Building {
    constructor(scene: ClientRoom, buildingConfig: IBuilding) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...CraftbenchBody(buildingConfig))
        super(scene, buildingConfig,collisionBox,"craftbench");
    }
    create(): void {
        super.create()
        this.on("nearLocalPlayer",()=>{
            uiState.interactHint.text = "craft tools and weapons here"
            uiState.interactHint.gameObject = this
        })
        this.on("notNearLocalPlayer",()=>{
            uiState.interactHint.text = null
            uiState.interactHint.gameObject = null
        })
    }
    cleanup(): void {
        super.cleanup()
    }
}