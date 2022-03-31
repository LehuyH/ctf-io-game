import { reactive, ref, computed } from "vue";
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
    buildings: {}
})

export const uiState = reactive({
    isBuilding: null as null | string,
    loaded: false
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