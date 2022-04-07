<template>
     <section>
         <aside v-if="!selectedNation">
             <h1 class="font-bold text-2xl">Nations</h1>
             <p>These are the current nations established on this server. Request to join one or create your own by building a headquarters!</p>
             <hr />
             <div class="p-2">
                <button v-for="nation in nations" :key="nation.id" @click="selectedNationID=nation.id"
                    :style="`background-color:${nation.color};`"
                    class="flex my-2 items-center justify-center p-2 py-8 rounded hover:scale-105 transition-transform w-full">
                    <Icon icon="bi:flag-fill" class="inline-block text-white" />
                    <span class="ml-2 text-outline text-white font-bold">{{nation.name}}</span>
                </button>
             </div>
         </aside>
         <aside v-else>
             <h1 class="font-bold text-2xl">
                 <button @click="selectedNationID=null"
                     class="bg-slate-100 p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                     <Icon icon="zondicons:cheveron-left" /></button>
                 {{selectedNation.name}}
             </h1>
             <hr />
             <br>
             <button v-if="!localNation"
                 @click="requestJoin"
                 class="rounded text-white font-semibold px-4 py-2 bg-slate-500 transition-colors hover:bg-slate-400">
                 Request To Join
                 <Icon icon="ion:enter" class="inline-block" />
             </button>
             <button v-if="isInSelectedNation"
                 @click="leaveNation"
                 class=" text-white rounded font-semibold px-4 py-2 bg-rose-400 transition-colors hover:bg-rose-300">
                 Leave Nation
                 <Icon icon="ion:exit" class="inline-block" />
             </button>
             <br><br>
             <details class="m-2">
                 <summary class="text-lg font-bold">Current Members</summary>
                 <ul>
                     <li v-for="member in selectedNation.members">
                         {{member.name}}
                     </li>
                 </ul>
             </details>
             <!-- Private Details -->
             <section v-if="isInSelectedNation">
                 <details class="m-2">
                     <summary class="text-lg font-bold">Join Requests</summary>
                     <ul class="pr-24">
                         <li v-for="request in selectedNation.joinRequests">
                             <span>{{request.name}}</span> 
                             <button @click="acceptJoin(request.publicID)" class="bg-green-600 text-white text-sm font-semibold p-2 rounded transition-colors hover:bg-green-500">
                                 Accept
                             </button>
                             <button @click="rejectJoin(request.publicID)" class="bg-rose-600 text-white text-sm font-semibold p-2 rounded transition-colors hover:bg-rose-500">
                                 Reject
                             </button>
                         </li>
                         <li v-if="!selectedNation.joinRequests.length">
                             No join requests
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
    import { state, useLocalPlayer, useScene } from '~/state';
    import { INation } from 'shared';
        
    const selectedNationID = ref<string|null>(null);
    const selectedNation = computed(()=>{
        const nationID = selectedNationID.value;
        if(!nationID) return null;
        return state.nations[nationID];
    })
    const localPlayer = useLocalPlayer();
    const scene = useScene();

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
        selectedNationID.value = null;
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

    function requestJoin(){
        if(!selectedNation.value) return;
       scene.value?.connection.inputs.requestJoin(selectedNation.value.id);
    }

    function acceptJoin(playerID:string){
        if(!selectedNation.value) return;
        scene.value?.connection.inputs.acceptJoinRequest(playerID);
    }

    function rejectJoin(playerID:string){
        if(!selectedNation.value) return;
        scene.value?.connection.inputs.rejectJoinRequest(playerID);
    }

    function leaveNation(){
        if(!selectedNation.value) return;
        scene.value?.connection.inputs.leaveNation();
    }
</script>