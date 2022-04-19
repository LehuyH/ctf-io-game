<template>
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
        <section v-if="uiState.waitingStatus"
         class="bg-slate-200 pt-4 fixed z-10 top-[10%] left-[50%] -translate-y-[50%] -translate-x-[50%] rounded shadow-md max-w-xl mx-4">
         <h1 class="font-semibold px-8">{{uiState.waitingStatus.text}}...</h1>
         <div ref="statusProgress" class="border-b-[6px] w-full border-emerald-600 h-4 rounded-b progress"></div>
     </section>
    </transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watchEffect } from 'vue';
import { uiState } from '~/state';

const statusProgress = ref<HTMLElement>();

watchEffect(async ()=>{
    if(uiState.waitingStatus && statusProgress.value){
        console.log('waiting for status');
        statusProgress.value.style.transform = "scaleX(0)"
        statusProgress.value.style.transitionDuration = `${uiState.waitingStatus.duration}ms`;
        setTimeout(()=>{
            if(!statusProgress.value) return
            statusProgress.value.style.transform = "scaleX(1)"
        },0)
        setTimeout(()=>{
         uiState.waitingStatus = null;
        },2000)
    }
})
</script>

<style scoped>
.progress{
    transition-property: transform;
    transform-origin: left;
    transition-timing-function: linear;
}
</style>