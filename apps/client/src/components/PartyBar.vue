<template>
     <section>
         <aside v-if="!selectedParty">
             <h1 class="font-bold text-2xl">Parties</h1>
             <p>Want to play with a group of friends? Create or join a party and the game will try its best to accommodate!</p>
             <hr />
             <div class="p-2">
                <details v-if="!localPlayer || !localPlayer.partyID">
                    <summary class="font-semibold text-lg my-4">Create A New Party</summary>
                    <form @submit.prevent="createParty">
                        <label class="block">Party Name</label>
                        <input required minlength="3" maxlength="20" type="text" v-model="partyName" class="w-full p-2 rounded" />
                        <button class="rounded text-white font-semibold px-4 py-2 bg-slate-500 transition-colors hover:bg-slate-400 w-full my-2">Create</button>
                    </form>
                </details>
                <h2 class="font-semibold text-lg mt-4" v-if="parties.length > 0" >Parties In This Server</h2>
                <button v-for="party in parties" :key="party.id" @click="selectedPartyID=party.id"
                    class="flex my-2 items-center justify-center p-2 py-2 hover:scale-105 transition-transform w-full bg-slate-400">
                    <span class="ml-2 text-outline text-white font-bold">{{party.name}}</span>
                </button>
                <p v-if="parties.length === 0" class="font-bold">
                    No parties have been established on this server.
                </p>
             </div>
         </aside>
         <aside v-else>
             <h1 class="font-bold text-2xl">
                 <button @click="selectedPartyID=null"
                     class="bg-slate-100 p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                     <Icon icon="zondicons:cheveron-left" /></button>
                 {{selectedParty.name}}
             </h1>
             <hr />
             <br>
             <button v-if="!localParty && !requestedToJoin"
                 @click="requestJoin"
                 class="rounded text-white font-semibold px-4 py-2 bg-slate-500 transition-colors hover:bg-slate-400">
                 Request To Join
                 <Icon icon="ion:enter" class="inline-block" />
             </button>
             <button v-else-if="!localParty" 
                 disabled
                 class="rounded text-white font-semibold px-4 py-2 bg-slate-500 transition-colors opacity-30">
                 Your Request Was Sent
                 <Icon icon="ion:enter" class="inline-block" />
             </button>
             <button v-if="isInSelectedParty"
                 @click="leaveParty"
                 class=" text-white rounded font-semibold px-4 py-2 bg-rose-400 transition-colors hover:bg-rose-300">
                 Leave Party
                 <Icon icon="ion:exit" class="inline-block" />
             </button>
             <br><br>
             <details class="m-2">
                 <summary class="text-lg font-bold">Current Members</summary>
                 <ul>
                     <li v-for="member in selectedParty.members">
                       <Icon class="inline-block" v-if="selectedParty.partyLeaderPublicID === member.publicID" icon="jam:crown-f" />
                       {{member.name}}
                     </li>
                 </ul>
             </details>
             <!-- Private Details -->
             <section v-if="isInSelectedParty && selectedParty.partyLeaderPublicID === localPlayer.publicID">
                 <details class="m-2">
                     <summary class="text-lg font-bold">Join Requests</summary>
                     <ul class="pr-24">
                         <li v-for="request in selectedParty.joinRequests">
                             <span>{{request.name}}</span> 
                             <button @click="acceptJoin(request.publicID)" class="bg-green-600 text-white text-sm font-semibold p-2 rounded transition-colors hover:bg-green-500">
                                 Accept
                             </button>
                             <button @click="rejectJoin(request.publicID)" class="bg-rose-600 text-white text-sm font-semibold p-2 rounded transition-colors hover:bg-rose-500">
                                 Reject
                             </button>
                         </li>
                         <li v-if="!selectedParty.joinRequests.length">
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
    import { IParty } from 'shared';
        
    const selectedPartyID = ref<string|null>(null);
    const partyName = ref<string>('');
    const selectedParty = computed<IParty>(()=>{
        const partyID = selectedPartyID.value;
        if(!partyID) return null;
        return state.parties[partyID];
    })
    const localPlayer = useLocalPlayer();
    const scene = useScene();

    const localParty = computed(() => {
        const partyID = localPlayer.value?.partyID
        if(!partyID) return null;
        return state.parties[partyID] || null;
    });

    const isInSelectedParty = computed(() => {
        const localPartyID  = localPlayer.value?.partyID

        if(!localPartyID) return false;
        return localPartyID === selectedPartyID.value
    });

    onUnmounted(()=>{
        selectedPartyID.value = null;
    });

    const parties = computed<IParty[]>(() => {
        //If player is in a party put that at the top
        const partyID = localPlayer.value?.partyID
        if(partyID){
            const party = state.parties[partyID]
            if(party){
                return [party, ...Object.values(state.parties).filter((n:any) => n.id !== partyID)]
            }
        }
        return Object.values(state.parties);
    });

    function requestJoin(){
        if(!selectedParty.value) return;
       scene.value?.connection.inputs.requestJoin(selectedParty.value.id);
    }

    const requestedToJoin = computed(()=>{
        if(!selectedParty.value) return false;
        return selectedParty.value.joinRequests.some((r:any) => r.publicID === localPlayer.value?.publicID);
    })

    function acceptJoin(playerID:string){
        if(!selectedParty.value) return;
        scene.value?.connection.inputs.acceptJoinRequest(playerID);
    }

    function rejectJoin(playerID:string){
        if(!selectedParty.value) return;
        scene.value?.connection.inputs.rejectJoinRequest(playerID);
    }

    function leaveParty(){
        if(!selectedParty.value) return;
        scene.value?.connection.inputs.leaveParty();
    }
    
    function createParty() {
        if (!partyName.value) {
            return;
        }
        scene.value?.connection.inputs.createParty(partyName.value);
    }
</script>