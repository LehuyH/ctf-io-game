import { IBuilding } from 'shared'
import Building from './index';
import HeadquartersBody from 'shared/bodies/buildings/HeadquartersBody';
import ClientRoom from '~/engine/types/ClientRoom';
import { uiState, useLocalPlayer, useLocalPlayerID } from '~/state';

/** @TODO Refactor for civ use  */
export default class Headquarters extends Building {
    constructor(scene: ClientRoom, buildingConfig: IBuilding) {
        //@ts-ignore
        const collisionBox = scene.matter.bodies.rectangle(...HeadquartersBody(buildingConfig))
        super(scene, buildingConfig,collisionBox,"headquarters");
        this.setOrigin(0.5,0.7)
    }
    create(): void {
        super.create()
        this.on("nearLocalPlayer",()=>{
            const civID = this.getData("ownerCivID")
            if(!civID) return

            const civ = (this.scene as ClientRoom).state.getState("civs",civID)
            if(!civ) return
            uiState.tooltip = `${civ.name}'s headquarters`
            uiState.interactHint.gameObject = this

        })
        this.on("notNearLocalPlayer",()=>{
            uiState.interactHint.text = null
            uiState.interactHint.gameObject = null
            uiState.tooltip = null
        })
    }
    cleanup(): void {
        super.cleanup()
    }
}