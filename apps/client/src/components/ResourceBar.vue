<template>
    <div v-if="player" class="bg-slate-800 p-4 bg-opacity-50 backdrop-blur-sm text-white">
    <h1 class="text-xl font-bold">Resources</h1>
        <ul>
            <li v-for="[key,value] in Object.entries(player.inventory).filter((e:any)=>e[1]>0)" class="py-2">
                <span class="font-bold capitalize">{{key}}:</span>
                <Icon :icon="resourceToIcon[key]" class="inline-block" />
                <span>{{value}}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocalPlayer } from '~/state';
import { Icon } from '@iconify/vue';

const player = useLocalPlayer();

const resourceToIcon = {
    wood: 'noto:wood',
    influencePoints: 'fxemoji:trophy'
} as Record<string, string>;
</script>