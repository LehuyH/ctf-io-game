import { reactive, ref, computed } from "vue";
import { IPlayer, IHarvestable, IBuilding } from "shared";
import ClientRoom from "./engine/types/ClientRoom";

export interface IState {
    players: Record<string, IPlayer>
    harvestables: Record<string, IHarvestable>
    buildings: Record<string, IBuilding>
}

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