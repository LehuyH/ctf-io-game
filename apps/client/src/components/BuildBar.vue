<template>
     <section>
         <aside v-if="!selectedBuilding">
             <h1 class="font-bold text-2xl">Buildings</h1>
             <hr />
             <ul class="mt-4">
                 <li v-for="b in buildings" class="p-2 inline-block">
                     <button @click="setBuilding(b)"
                         :class="`${(checkCanBuild(b)) ? '' : 'opacity-50'} bg-slate-100 transition-colors hover:bg-slate-200 p-8 inline-block rounded`">
                         <img class="m-auto w-12 h-12" :src="b.icon" />
                     </button>
                     <p class="text-sm m-auto text-center">{{b.name}}</p>
                 </li>
             </ul>
         </aside>
         <aside v-else>
             <h1 class="font-bold text-2xl">
                 <button @click="stopBuilding"
                     class="bg-slate-100 p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                     <Icon icon="zondicons:cheveron-left" /></button>
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
             <p class="mt-12 text-red-500 font-bold text-xl" v-if="!canBuild">You do not have enough resources to build
                 this!</p>
             <p v-else class="text-xl font-bold mt-12">Click on the location where you want to build this.</p>
         </aside>
     </section>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';
    import { computed, onUnmounted, ref } from 'vue';
    import { uiState } from '~/state';
    import buildingsData from "shared/data/buildings.json";
    import { useLocalPlayer } from '~/state';
    import { canPay } from 'shared/helpers';
        
    const selectedBuilding = ref<any>(null);
    const localPlayer = useLocalPlayer();

    const isInNation = computed(() => {
        return localPlayer.value?.nationID
    });

    const buildings = computed(() => {
        //Must build HQ first
        if(!isInNation.value) return buildingsData.filter(b => b.type === 'headquarters');
        return buildingsData.filter(b => b.type !== 'headquarters');
    });


    const canBuild = computed(() => {
        if(!selectedBuilding.value) return false;
        const cost = selectedBuilding.value.cost;
        const inventory = localPlayer.value.inventory;
        
        return canPay(cost, inventory);
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

    onUnmounted(()=>{
        uiState.isBuilding = null;
        selectedBuilding.value = null;
    });
</script>