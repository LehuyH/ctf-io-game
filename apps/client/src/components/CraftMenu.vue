<template>
 <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
     <section v-if="uiState.craftmenu.buildingName" ref="craftmenu"
         class="bg-slate-200 p-4 fixed z-10 top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] rounded shadow-md max-w-xl w-full mx-4">
         <h1 class="font-bold text-2xl">Craft Items</h1>
         <ul class="text-center">
             <li v-for="item in items" class="p-2 m-2 inline-block">
                 <button @click="selectItem(item as any)"
                     :class="`${(item.name === selectedItem?.name) ? 'bg-amber-100' : 'bg-white'} m-auto text-center block p-2 rounded transition-all hover:scale-110 hover:shadow-md`">
                     <img class="w-12 h-12" :src="`/items/${item.texture}.png`" />
                 </button>
                 <p class="text-sm m-auto text-center">{{item.name}}</p>
             </li>
         </ul>
         <aside v-if="selectedItem" class="px-4">
             <ul class="mt-4">
                 <li class="font-semibold">Resources Needed</li>
                 <li v-for="(c,type) in selectedItem.cost" class="inline-block mx-2">
                     <span class="capitalize">{{type}}:</span> {{c}}
                 </li>
             </ul>
             <button v-if="canCraft(selectedItem)"
                 class="rounded px-4 py-2 mt-4 bg-blue-500 hover:bg-blue-400 transition-colors text-white font-bold w-full text-center"
                 @click="craftItem(selectedItem as Item)">
                 Craft
                 <Icon icon="bi:hammer" class="inline-block" />
             </button>
             <p v-else class="mt-12 text-red-500 font-bold text-xl">You do not have enough resources to craft this!</p>
         </aside>
     </section>
 </transition>
</template>

<script setup lang="ts">
import type { Item } from "shared";
import itemsData from "shared/data/items.json";
import { ref, watchEffect } from "vue";
import { Icon } from '@iconify/vue';
import { uiState, useLocalPlayer, useScene } from "~/state";
import { onClickOutside } from "@vueuse/core";
import { computed } from "@vue/reactivity";
import { canPay } from "shared/helpers";

const selectedItem = ref<Item|null>(null);
const craftmenu = ref(null);
const scene = useScene()
const player = useLocalPlayer()

const items = computed(()=>itemsData.filter(i => uiState.craftmenu.allowed?.includes(i.name)))

onClickOutside(craftmenu,()=>{
    uiState.craftmenu.allowed = null;
    uiState.craftmenu.buildingName = null;
    selectedItem.value = null;
})

watchEffect(()=>{
    if(!uiState.craftmenu.allowed){
        selectedItem.value = null;
    }
})

function selectItem(item: Item){
    selectedItem.value = item;
}

function craftItem(item: Item){
    if(!uiState.craftmenu.buildingName) return;
    scene.value?.connection.inputs.craftItem(item.name,uiState.craftmenu.buildingName)
}

function canCraft(item: Item){
    const cost = item.cost
    if(!cost) return false

    return canPay(cost,player.value.inventory)
}
</script>