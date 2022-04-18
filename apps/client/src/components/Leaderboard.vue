<template>
    <section class="fixed p-4 text-white bg-black bg-opacity-20 transition-all hover:bg-opacity-30 w-[12.5vw] min-w-[12rem] h-[30vh] overflow-y-scroll right-0">
        <h1 class="text-lg font-bold">Players Online</h1>
        <ul>
            <li v-for="players,teamName in leaderboard">
                <details>
                    <summary class="font-semibold text-md px-2 text-outline" :style="`background-color:${civColors[teamName]};`">
                        {{teamName}} ({{players.length}})
                    </summary>
                    <ul class="px-4">
                        <li v-for="player in players">
                            {{player}}
                        </li>
                    </ul>
                </details>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { IPlayer } from 'shared';
import { state } from '~/state';

const leaderboard = computed(()=>{
    const leaderboardData = {} as Record<string,string[]>
    Object.values(state.players).forEach((p:any)=>{
        const player = p as IPlayer

        if(!player.civID){
            leaderboardData["Free Agency"].push(player.name)
        }else{
            const civ = state.civs[player.civID]
            if(!leaderboardData[civ.name]){
                leaderboardData[civ.name] = []
            }
            leaderboardData[civ.name].push(player.name)
        }
    })
    return leaderboardData
})

const civColors = computed(()=>{
    const civColors = {} as Record<string,string>
    
    Object.values(state.civs).forEach((n:any)=>{
        civColors[n.name] = n.color
    })
    return civColors
})
</script>