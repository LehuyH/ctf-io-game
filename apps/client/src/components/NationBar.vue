<template>
     <section>
         <aside v-if="!selectedNation">
             <h1 class="font-bold text-2xl">Nations</h1>
             <p>These are the current nations established on this server. Request to join one or create your own by building a headquarters!</p>
             <hr />
             <div class="p-2">
                <button v-for="nation in nations" :key="nation.id" @click="selectedNation=nation"
                    :style="`background-color:${nation.color};`"
                    class="flex my-2 items-center justify-center p-2 py-8 rounded hover:scale-105 transition-transform w-full">
                    <Icon icon="bi:flag-fill" class="inline-block text-white" />
                    <span class="ml-2 text-outline text-white font-bold">{{nation.name}}</span>
                </button>
             </div>
         </aside>
         <aside v-else>
             <h1 class="font-bold text-2xl">
                 <button @click="selectedNation=null"
                     class="bg-slate-100 p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                     <Icon icon="zondicons:cheveron-left" /></button>
                 {{selectedNation.name}}
             </h1>
             <hr />
             <br>
             <button v-if="!localNation" class="rounded text-white font-semibold px-4 py-2 bg-slate-500 transition-colors hover:bg-slate-400">
                 Request To Join <Icon icon="ion:enter" class="inline-block" />
             </button>
             <button v-if="isInSelectedNation" class=" text-white rounded font-semibold px-4 py-2 bg-rose-400 transition-colors hover:bg-rose-300">
                 Leave Nation <Icon icon="ion:exit" class="inline-block" />
             </button>

             <section v-if="isInSelectedNation" class="mt-10">
              <details>
                  <summary class="text-lg font-bold">Current Members</summary>
                  <ul class="pr-24">
                      <li>
                          <span>Username</span>
                      </li>
                  </ul>
              </details>
              <br>
              <details>
                  <summary class="text-lg font-bold">Join Requests</summary>
                  <ul class="pr-24">
                      <li>
                          <span>Username</span> <button
                              class="bg-green-600 text-white text-sm font-semibold p-2 rounded transition-colors hover:bg-green-600">Accept</button>
                      </li>
                  </ul>
              </details>
             </section>
         </aside>
     </section>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';
    import { computed, onUnmounted, ref } from 'vue';   
    import { state, useLocalPlayer } from '~/state';
    import { INation } from 'shared';
        
    const selectedNation = ref<INation|null>(null);
    const localPlayer = useLocalPlayer();

    const localNation = computed(() => {
        const nationID = localPlayer.value?.nationID
        if(!nationID) return null;
        return state.nations[nationID] || null;
    });

    const isInSelectedNation = computed(() => {
        const nationID = localPlayer.value?.nationID
        if(!nationID) return false;
        return nationID === selectedNation.value?.id;
    });

    onUnmounted(()=>{
        selectedNation.value = null;
    });

    const nations = computed<INation[]>(() => {
        //If player is in a nation put that at the top
        const nationID = localPlayer.value?.nationID
        if(nationID){
            const nation = state.nations[nationID]
            if(nation){
                return [nation, ...Object.values(state.nations).filter((n:any) => n.id !== nationID)]
            }
        }
        return Object.values(state.nations);
    });
</script>