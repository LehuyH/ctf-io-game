<template>
    <section ref="buildBar" class="fixed p-4 left-0 z-20 h-screen w-[30vw] bg-slate-200 bg-opacity-80 backdrop-blur-sm transition-transform" :class="sideBarClasses">
     <button @click="showSideBar=!showSideBar" class="absolute top-[50%] -translate-y-[50%] left-[100%] p-4 rounded-r bg-blue-400 text-white 
        transition-all hover:border-r-2 hover:border-b-2 hover:border-t-2 text-4xl">
         <Icon icon="zondicons:cheveron-right" v-if="!showSideBar" />
         <Icon icon="zondicons:cheveron-left" v-else />
     </button>
     <section>
         <button v-if="sideBarPage" class="text-red-500 text-3xl transition-colors hover:text-red-400" @click="sideBarPage=null">
            <Icon icon="akar-icons:circle-x-fill" />
         </button>
        <BuildBar v-if="sideBarPage==='build'"/>
        <PartyBar v-else-if="sideBarPage==='parties'"/>
        <aside v-else>
            <button @click="sideBarPage='build'" class="p-12 my-2 text-2xl font-bold w-full bg-slate-100 transition-colors hover:bg-slate-50 rounded">
                Build <Icon icon="ion:construct" class="inline-block"/>
            </button>
            <button @click="sideBarPage='parties'" class="p-12 my-2 text-2xl font-bold w-full bg-slate-100 transition-colors hover:bg-slate-50 rounded">
                Parties <Icon icon="bi:people-fill" class="inline-block"/>
            </button>
        </aside>
     </section>
    </section>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';
    import { computed, ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useScene } from '~/state';
    import BuildBar from './BuildBar.vue';
    import PartyBar from './PartyBar.vue';
        
    const showSideBar = ref(false);
    const buildBar = ref(null);
    const scene = useScene();

    type SideBarPage = null|'build'|'parties';
    const sideBarPage = ref<SideBarPage>(null);

    const sideBarClasses = computed(() => {
        return {
            'translate-x-0': showSideBar.value,
            '-translate-x-[100%]': !showSideBar.value,
        }
    });


    onClickOutside(buildBar, () => {
        showSideBar.value = false;
        scene.value?.sys.canvas.focus()
        sideBarPage.value = null;
    });
</script>