<template>
 <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown" @click="emitInteract">
    <p v-if="uiState.tooltip"
       class="font-bold font-lg -translate-y-[50%] inline-block left-[50%] origin-center -translate-x-[50%] bg-slate-200 p-12 rounded-md shadow-md fixed z-20 bottom-2">
       {{ uiState.tooltip }}
    </p>
    <p v-else-if="uiState.interactHint.text"
       class="font-bold font-lg -translate-y-[50%] inline-block left-[50%] origin-center -translate-x-[50%] bg-slate-200 p-12 rounded-md shadow-md fixed z-20 bottom-2">
      {{(isMobile) ? "Tap here" : "Press E" }} to {{uiState.interactHint.text}}
    </p>
 </transition>
</template>

<script setup lang="ts">
import IsMobile from '~/engine/logic/IsMobile';
import { uiState, useScene } from '~/state';
const isMobile = IsMobile();
const scene = useScene();

function emitInteract(){
   if(!scene.value) return;
   scene.value.input.keyboard.emit("keydown-E")
}
</script>