import { IBuilding, ICiv, IPlayer } from 'shared'
import Building from './index';
import HeadquartersBody from 'shared/bodies/buildings/HeadquartersBody';
import ClientRoom from '~/engine/types/ClientRoom';
import { uiState, useLocalPlayer } from '~/state';

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
            const localPlayerState = useLocalPlayer()
            if(!civID || !localPlayerState.value) return

            const civ = (this.scene as ClientRoom).state.getState("civs",civID)
            if(!civ) return

            uiState.interactHint.gameObject = this

            //Player is not in the same civ and can steal infuencePoints
            if(localPlayerState.value.civID !== civID){
                if(civ.influence === 0){
                    uiState.tooltip = `${civ.name}'s headquarters has no influence points to steal`
                }else{
                    uiState.interactHint.text = `to steal some of ${civ.name}'s influence points`
                }
                return;
            }

            //Player is holding influence points they can deposit to this building
            if(localPlayerState.value.inventory.influencePoints > 0){
                uiState.interactHint.text = `to deposit ${localPlayerState.value.inventory.influencePoints} influence points to ${civ.name}`
                return;
            }

            uiState.tooltip = `${civ.name}'s headquarters`
        })
        this.on("notNearLocalPlayer",()=>{
            uiState.interactHint.text = null
            uiState.interactHint.gameObject = null
            uiState.tooltip = null
            uiState.waitingStatus = null
        })
        this.scene.input.keyboard.on("keydown-E",()=>{
            if(!this.isNearLocalPlayer) return;
            if(uiState.waitingStatus) return;
            const localPlayerState = useLocalPlayer()
            const civID = this.getData("ownerCivID")
            const civ = (this.scene as ClientRoom).state.getState("civs",civID)

            if(!civ || !localPlayerState.value) return

            uiState.interactHint.text = null
            uiState.interactHint.gameObject = null
            uiState.tooltip = null

            //Deposit influence points
            if(localPlayerState.value.civID === civID){
                (this.scene as ClientRoom).connection.inputs.depositPoints()
                return;
            }

            //Steal influence points
            if(civ.influence === 0 ) return
            uiState.waitingStatus = {
                duration: 2000,
                text: `Robbing ${civ.name}'s headquarters`
            };
            (this.scene as ClientRoom).connection.inputs.stealPoints()
        })
    }
    cleanup(): void {
        super.cleanup()
    }
}