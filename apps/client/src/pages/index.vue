<template>
    <main class="flex justify-center items-center min-h-screen bg-blue-400">
        <section v-if="!uiState.loaded">
            <Icon icon="eos-icons:loading" />
        </section>
        <form v-else-if="!showRooms" @submit.prevent="showRooms = true" class="bg-slate-100 p-8">
            <h1 class="font-bold text-3xl">Civ Testing</h1>
            <br>
            <input required maxlength="10" minlength="3" type="text" class="bg-slate-300 p-4 w-full" v-model="nickname"
                placeholder="Nickname" />
            <button
                class="px-4 py-2 bg-blue-500 font-bold rounded hover:bg-blue-400 text-white text-center my-4">Next</button>
        </form>
        <section v-else class="bg-slate-100 p-8">
            <h1 class="font-bold text-3xl">Join A Room</h1>
            <ul>
                <li v-for="room in rooms" :key="room.roomId">
                    <b>{{room.metadata.name}}:</b><span>{{room.clients}}/{{room.maxClients}}</span>
                    <button @click="joinRoom(room.roomId)" class="bg-green-700 text-white p-2">Join</button>
                </li>
            </ul>
        </section>
    </main>
</template>

<script setup lang="ts">
import { RoomAvailable } from 'colyseus.js';
import { ref, watchEffect } from 'vue';
import { connection } from '~/connection';
import { useRouter } from 'vue-router';
import { uiState } from '~/state';
import { Icon } from '@iconify/vue';
const router = useRouter();
const nickname = ref("");
const showRooms = ref(false);
const rooms = ref<RoomAvailable[]>([]);

watchEffect(()=>{
    if(showRooms.value){
        connection.getRooms()
        .then(res=>rooms.value = res)
        .catch(err=>{
            console.error(err);
            alert(err.message);
            showRooms.value = false;
        });
    }
})

async function joinRoom(id:string) {
    await connection.joinRoom(id, {name:nickname.value})
    router.push("/game")
}
</script>