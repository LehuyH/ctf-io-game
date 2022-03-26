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
                <button @click="setBuilding(b)" class="bg-slate-100 transition-colors hover:bg-slate-200 p-8 inline-block rounded">
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
            {{selectedBuilding.cost}}
        </ul>
    </aside>
    </section>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';
    import { computed, ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { uiState } from '~/state';
    import buildingsData from "~/assets/data/buildings.json";
        
    const showBuildBar = ref(false);
    const buildBar = ref(null);
    const selectedBuilding = ref<any>(null);

    const sideBarClasses = computed(() => {
        return {
            'translate-x-0': showBuildBar.value,
            '-translate-x-[100%]': !showBuildBar.value,
        }
    });

    onClickOutside(buildBar, () => {
        showBuildBar.value = false;
        selectedBuilding.value = null;
    });

    function setBuilding(building: any) {
        selectedBuilding.value = building;
        uiState.isBuilding = building.type;
    }

    function stopBuilding(){
        uiState.isBuilding = null;
        selectedBuilding.value = null;
    }
</script>