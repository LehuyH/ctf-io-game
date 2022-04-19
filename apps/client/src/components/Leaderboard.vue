<template>
    <section class="fixed p-4 text-white bg-black bg-opacity-20 transition-all hover:bg-opacity-30 w-[12.5vw] min-w-[12rem] h-[30vh] overflow-y-scroll right-0">
        <h1 class="text-md font-bold">Civilization Leaderboard</h1>
        <ul>
            <li v-for="entry,civName in leaderboard">
                <details>
                    <summary class="font-semibold text-md px-2 text-outline" :style="`background-color:${civColors[civName]};`">
                        {{civName}} - {{entry.civ.influence}}
                    </summary>
                    <ul class="px-4">
                        <li v-for="player in entry.players">
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
import { ICiv, IPlayer } from 'shared';
import { state } from '~/state';

const leaderboard = computed(() => {
  const leaderboardData = {} as Record<string,{ players: string[]; civ: ICiv }>;
  Object.values(state.players).forEach((p: any) => {
    const player = p as IPlayer;
    if(!player.civID) return

    const civ = state.civs[player.civID];
    if (!leaderboardData[civ.name]) {
      leaderboardData[civ.name] = {
        players: [],
        civ,
      }
    }
    leaderboardData[civ.name].players.push(player.name);
  });

  // Sort by influence
  const leaderboardDataSorted = Object.fromEntries(Object.entries(leaderboardData).sort((a, b) => {
    return b[1].civ.influence - a[1].civ.influence;
  }))

  return leaderboardDataSorted;
});


const civColors = computed(()=>{
    const civColors = {} as Record<string,string>
    
    Object.values(state.civs).forEach((n:any)=>{
        civColors[n.name] = n.color
    })
    return civColors
})
</script>