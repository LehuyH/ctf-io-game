<template>
   <button class="rounded text-center grid md:grid-rows-3 grid-rows-1 grid-cols-3 md:grid-cols-1 hover:scale-105 transition-transform bg-slate-50 text-black w-64 md:h-80 h-32 group shadow-lg">
      <aside class="bg-purple-800 h-full transition-colors rounded-t group-hover:bg-purple-700 md:row-span-2 p-8 text-white flex justify-center items-center">
         <Icon class="md:text-7xl text-3xl group-hover:scale-125 transition-transform" :icon="icon" />
      </aside>
      <section class="p-8 h-full flex justify-center items-center flex-col col-span-2">
         <h1 class="font-semibold text-xl">{{name}}</h1>
         <p class="italics text-sm">{{desc}}</p>
      </section>
   </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { defineProps } from 'vue';

defineProps<{
    name:string,
    desc:string,
    icon:string
}>()
</script>