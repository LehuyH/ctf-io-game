<template>
 <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
    <p v-if="uiState.tooltip"
       class="font-bold font-lg -translate-y-[50%] inline-block left-[50%] origin-center -translate-x-[50%] bg-slate-200 p-12 rounded-md shadow-md fixed z-20 bottom-2">
       {{ uiState.tooltip }}
    </p>
    <p v-else-if="uiState.interactHint.text"
       class="font-bold font-lg -translate-y-[50%] inline-block left-[50%] origin-center -translate-x-[50%] bg-slate-200 p-12 rounded-md shadow-md fixed z-20 bottom-2">
       Press E to {{uiState.interactHint.text}}
    </p>
 </transition>
</template>

<script setup lang="ts">
import { uiState } from '~/state';
</script>