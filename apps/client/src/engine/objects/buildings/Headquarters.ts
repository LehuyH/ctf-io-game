import { IBuilding } from 'shared'
import Building from './index';
import HeadquartersBody from 'shared/bodies/buildings/HeadquartersBody';
import ClientRoom from '~/engine/types/ClientRoom';
import { uiState, useLocalPlayerID } from '~/state';


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
            const nationID = this.getData("ownerNationID")
            const localPlayerID = useLocalPlayerID()
            const ownerPlayerID = this.getData("ownerPlayerID")

            //Unregistered nation, prompt to register
            if(ownerPlayerID === localPlayerID && !nationID){
                uiState.interactHint.text = "register your nation!"
                uiState.interactHint.gameObject = this
                return
            }

            const nation = (this.scene as ClientRoom).state.getState("nations",nationID)
            uiState.tooltip = `${nation.name}'s headquarters`
            uiState.interactHint.gameObject = this

        })
        this.on("notNearLocalPlayer",()=>{
            uiState.interactHint.text = null
            uiState.interactHint.gameObject = null
            uiState.tooltip = null
            uiState.showNationRegister = false
        })
        this.scene.input.keyboard.on("keydown-E",()=>{
            if(this.isNearLocalPlayer){
                uiState.showNationRegister = true
                uiState.interactHint.text = null
            }
        })
    }
    cleanup(): void {
        super.cleanup()
    }
}