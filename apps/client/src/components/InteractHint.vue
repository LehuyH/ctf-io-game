<template>
 <transition
    enter-active-class="fadeInUp"
    leave-active-class="fadeOutDown"
 >
    <p v-if="uiState.interactHint.text"
        class="font-bold font-lg inline-block left-[50%] origin-center -translate-x-[50%] bg-slate-200 p-12 rounded-md shadow-md fixed z-20 bottom-16">
        Press E to {{uiState.interactHint.text}}</p>
 </transition>
</template>

<script setup lang="ts">
import { uiState } from '~/state';
</script>

<style scoped>
.fadeInUp {
    animation: fadeInUp .3s;
}
.fadeOutDown {
    animation: fadeInUp .3s reverse;
}

@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(20px) translateX(-50%);
    }
    100% {
        opacity: 1;
        transform: translateY(0) translateX(-50%);
    }
}
</style>