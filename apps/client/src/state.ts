import { reactive, ref, computed, watchEffect } from "vue";
import { IState } from "shared";
import ClientRoom from "./engine/types/ClientRoom";


export const localPlayerID = ref("");
let scene = ref<ClientRoom>();

const localPlayer = computed(() => {
    return state.players[localPlayerID.value];
})

export const state = reactive<IState>({
    players: {},
    harvestables: {},
    buildings: {},
    nations: {},
})

export const uiState = reactive({
    isBuilding: null as null | string,
    loaded: false,
    interactHint:{
        text: null as null | string,
        gameObject: null as null | Phaser.GameObjects.GameObject,
    },
    tooltip: null as null | string,
    /** Opens the craftmenu, stores the allowed items it can craft*/
    craftmenu: {
        allowed: null as null | string[],
        buildingName: null as null | string
    },
    showNationRegister: false,
})

export const resetState = () => {
    state.players = {}
    state.harvestables = {}
}


export const setLocalPlayerID = (id: string) => {
    localPlayerID.value = id
}
export const useLocalPlayer = ()=>localPlayer

export const useLocalPlayerID = () => {
    return localPlayerID.value;
}


export const setScene = (newScene: ClientRoom) => {
    scene.value = newScene
}

export const useScene = () => {
    return scene;
}

//Save authID to localStorage
watchEffect(()=>{
    const connection = scene.value?.connection;
    if(localPlayer.value && connection?.room){
        localStorage.setItem(`${connection.room.id}-authID`,localPlayer.value.authID)
    }
})