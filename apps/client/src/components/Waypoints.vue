<template>
    <section  class="w-screen h-screen fixed top-0 bottom-0 pointer-events-none">
        <ul>
            <li v-for="waypoint in transformedWaypoints" class="fixed text-sm bg-slate-800 p-4 rounded-full text-white duration-300 transition-all ease-linear -translate-y-[50%] -translate-x-[50%]" :style="`
                top: ${waypoint.y}%;
                left: ${waypoint.x}%;
                transform: scale(${waypoint.scale}%);
                opacity: ${(waypoint.scale < 150) ? 1 : 0};
                color: ${waypoint.color};
                `">
                <Icon :icon="waypoint.icon"/>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { uiState, useLocalPlayer, useScene } from '~/state';
import { Icon } from '@iconify/vue';

const transformedWaypoints = computed(()=>{
    const player = useLocalPlayer().value
    const scene = useScene().value
    if(!player || !scene) return []

    const cameraWidth = scene.cameras.main.width
    const cameraHeight = scene.cameras.main.height
    const playerX = player.x
    const playerY = player.y
    

    const waypoints = uiState.waypoints.map(waypoint=>{
        const relativeX = waypoint.x + cameraWidth/2
        const relativeY = waypoint.y + cameraHeight/2
        //Make waypoints relative to the screen size as a percentage
        const x = (relativeX - playerX) / cameraWidth * 100
        const y = (relativeY - playerY) / cameraHeight * 100

        //Distance from player
        const distance = {
            x: Math.abs(playerX - waypoint.x),
            y: Math.abs(playerY - waypoint.y)
        }

        const scale = (Math.min(1,(100/distance.x)) * 50) + (Math.min(1,(100/distance.y)) * 50) + 50  
        return{
            ...waypoint,
            x:Math.max(Math.min(x,90),5),
            y:Math.max(Math.min(y,90),5),
            scale
        }
    })


    return waypoints
})
</script>