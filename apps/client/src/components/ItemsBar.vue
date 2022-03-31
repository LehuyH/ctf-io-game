<template>
    <div v-if="player && items" class="p-4 w-full">
        <ul class="flex text-white justify-center items-center gap-4">
            <li v-for="(item,index) in items">
                <button class="outline-none text-left" @click="scene?.connection.inputs.items.set(index)">
                    <img :src="`/items/${item.texture}.png`" :class="`w-[4.5rem] h-[4.5rem] bg-opacity-80 backdrop-blur-md rounded-full p-4 transition-all
                     ${(index===equippedItemIndex) ? 'bg-slate-200 text-black' : 'hover:bg-slate-700 bg-slate-800'}`" />
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLocalPlayer, useScene } from '~/state';
import { onKeyStroke, useScroll, whenever } from '@vueuse/core';

const player = useLocalPlayer();
const { directions } = useScroll(window.document.body);
const items = computed(()=>player.value.items);
const equippedItemIndex = computed(()=>player.value.equippedItemIndex);
const scene = useScene()


//Number shortcuts to change items
onKeyStroke(["1","2","3","4","5","6","7","8","9"], (event) => {
    event.preventDefault();
    const index = parseInt(event.key.replace(/[^0-9]/g, '')) - 1;
    if (index >= 0 && index < items.value.length) {
        scene.value?.connection.inputs.items.set(index);
    }
});

onMounted(()=>{
    //Paginate items when scrolling
    window.addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
            scene.value?.connection.inputs.items.next();
        } else {
            scene.value?.connection.inputs.items.prev();
        }
    });
})
</script>