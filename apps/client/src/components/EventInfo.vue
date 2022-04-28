<template>
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
        <section v-if="state.currentEvent"
         class="bg-black text-white bg-opacity-50 pt-4 fixed z-10 top-[10%] left-4 top-4 rounded shadow-md max-w-xl mx-4">
         {{state.currentEvent}}
     </section>
    </transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watchEffect } from 'vue';
import { state } from '~/state';
</script>

<style scoped>
.progress{
    transition-property: transform;
    transform-origin: left;
    transition-timing-function: linear;
}
</style>