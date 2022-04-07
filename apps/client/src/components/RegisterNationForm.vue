<template>
 <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
     <section v-if="uiState.showNationRegister" ref="registerNationContainer"
         class="bg-slate-200 p-8 fixed z-10 top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] rounded shadow-md max-w-xl w-full mx-4">
         <h1 class="font-bold text-2xl">Register Your New Nation</h1>
         <form @submit.prevent="registerNation" class="my-4">
             <label>Nation Name</label>
             <input required minlength="3" maxlength="20" type="text" v-model="nationName" class="w-full p-2 rounded" />
             <label>Nation Color</label>
             <br>
             <input required type="color" v-model="nationColor"/>
             <br><br>
             <button
                 class="rounded px-4 py-2 bg-blue-500 hover:bg-blue-400 transition-colors text-white font-bold m-auto block text-center">
                 Register
                 <Icon icon="bi:flag-fill" class="inline-block" />
             </button>
         </form>
     </section>
 </transition>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Icon } from '@iconify/vue';
import { uiState, useScene } from "~/state";
import { onClickOutside } from "@vueuse/core";

const nationName = ref<string|null>(null);
const nationColor = ref<string|null>("#0984e3");
const registerNationContainer = ref(null);
const scene = useScene()

onClickOutside(registerNationContainer,()=>{
    uiState.craftmenu.allowed = null;
    uiState.craftmenu.buildingName = null;
    nationName.value = null;
})

watchEffect(()=>{
    if(!uiState.showNationRegister){
        registerNationContainer.value = null;
    }
})

function registerNation(){
    if(!nationName.value || !nationColor.value){
        return;
    }
    scene.value?.connection.inputs.registerNation(nationName.value,nationColor.value)
    uiState.showNationRegister = false;
}
</script>