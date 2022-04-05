<template>
    <section ref="buildBar" class="fixed p-4 left-0 z-20 h-screen w-[30vw] bg-slate-200 bg-opacity-80 backdrop-blur-sm transition-transform" :class="sideBarClasses">
     <button @click="showBuildBar=!showBuildBar" class="absolute top-[50%] -translate-y-[50%] left-[100%] p-4 rounded-r bg-blue-400 text-white 
        transition-all hover:border-r-2 hover:border-b-2 hover:border-t-2 text-4xl">
         <Icon icon="ion:construct" v-if="!showBuildBar" />
         <Icon icon="zondicons:cheveron-left" v-else />
     </button>
    <aside v-if="!selectedBuilding">
        <h1 class="font-bold text-2xl">Buildings</h1>
        <hr />
        <ul class="mt-4">
            <li v-for="b in buildingsData" class="p-2 inline-block">
                <button @click="setBuilding(b)" :class="`${(checkCanBuild(b)) ? '' : 'opacity-50'} bg-slate-100 transition-colors hover:bg-slate-200 p-8 inline-block rounded`">
                    <img class="m-auto w-12 h-12" :src="b.icon" />
                </button>
                <p class="text-sm m-auto text-center">{{b.name}}</p>
            </li>
        </ul>
    </aside>
    <aside v-else>
        <h1 class="font-bold text-2xl">
            <button @click="stopBuilding" class="bg-slate-100 p-2 rounded transition-colors hover:bg-slate-200 mb-2"><Icon icon="zondicons:cheveron-left"/></button>
            {{selectedBuilding.name}}
        </h1>
        <hr />
        <p>
            {{selectedBuilding.description}}
        </p>
        <ul class="mt-4">
            <li class="text-lg font-bold">Resources Needed</li>
            <li v-for="(c,type) in selectedBuilding.cost">
                <b class="capitalize">{{type}}:</b> {{c}}
            </li>
        </ul>
        <p class="mt-12 text-red-500 font-bold text-xl" v-if="!canBuild">You do not have enough resources to build this!</p>
        <p v-else class="text-xl font-bold mt-12">Click on the location where you want to build this.</p>
    </aside>
    </section>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';
    import { computed, ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { uiState, useScene } from '~/state';
    import buildingsData from "shared/data/buildings.json";
    import { useLocalPlayer } from '~/state';
import { canPay } from 'shared/helpers';
        
    const showBuildBar = ref(false);
    const buildBar = ref(null);
    const selectedBuilding = ref<any>(null);
    const scene = useScene();
    const localPlayer = useLocalPlayer();

    const sideBarClasses = computed(() => {
        return {
            'translate-x-0': showBuildBar.value,
            '-translate-x-[100%]': !showBuildBar.value,
        }
    });

    const canBuild = computed(() => {
        if(!selectedBuilding.value) return false;
        const cost = selectedBuilding.value.cost;
        const inventory = localPlayer.value.inventory;
        
        return canPay(cost, inventory);
    });
    onClickOutside(buildBar, () => {
        showBuildBar.value = false;
        selectedBuilding.value = null;
        scene.value?.sys.canvas.focus()
    });

    function setBuilding(building: any) {
        selectedBuilding.value = building;
        uiState.isBuilding = building.type;
    }

    function stopBuilding(){
        uiState.isBuilding = null;
        selectedBuilding.value = null;
    }
    function checkCanBuild(building: any) {
        if(!localPlayer.value) return false;
        const cost = building.cost;
        const inventory = localPlayer.value.inventory;
        return canPay(cost, inventory);
    }
</script>