<template>
    <main class="flex justify-center items-center min-h-screen bg-blue-400">
        <section v-if="!uiState.loaded" class="text-2xl text-white">
            <h1>Game Is Loading...</h1>
            <Icon icon="eos-icons:loading" />
        </section>
        <form v-else-if="selectedRoom" @submit.prevent="joinRoom" class="bg-slate-100 p-8">
            <header class="flex items-center gap-2">
            <button @click="selectedRoom=null"
                class="bg-slate-300 p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                <Icon icon="zondicons:cheveron-left" class="inline-block" />
            </button>
            <h1 class="font-bold text-3xl inline-block">Join {{selectedRoom.metadata.name}}</h1>
            </header>

            <p v-if="!authID">This is your first time playing on this server! Please select a nickname</p>
            <p v-else>Welcome Back!</p>
            <input v-if="!authID" required maxlength="10" minlength="3" type="text" class="bg-slate-300 p-4 w-full m-2"
                v-model="nickname" placeholder="Nickname" />
            <button
                class="px-4 py-2 bg-blue-500 font-bold rounded hover:bg-blue-400 text-white text-center my-4">Join</button>
        </form>
        <section v-else class="bg-slate-100 p-8">
            <h1 class="font-bold text-3xl">Join A Room</h1>
            <ul>
                <li v-for="room in rooms" :key="room.roomId">
                    <b>{{room.metadata.name}}:</b><span>{{room.clients}}/{{room.maxClients}}</span>
                    <button @click="selectedRoom=room" class="bg-green-700 text-white p-2">Join</button>
                </li>
            </ul>
        </section>
    </main>
</template>

<script setup lang="ts">
import { RoomAvailable } from 'colyseus.js';
import { onMounted, ref, watchEffect } from 'vue';
import { connection } from '~/connection';
import { useRouter } from 'vue-router';
import { uiState } from '~/state';
import { Icon } from '@iconify/vue';
const router = useRouter();
const nickname = ref("");
const selectedRoom = ref<RoomAvailable|null>(null);
const authID = ref<string|null>(null);
const rooms = ref<RoomAvailable[]>([]);

onMounted(() => {
    connection.room.value?.leave();
    connection.getRooms()
        .then(res => rooms.value = res)
        .catch(err => {
            console.error(err);
            alert(err.message);
    });
})

watchEffect(()=>{
    if(selectedRoom.value){
        const storedAuthID = localStorage.getItem(`${selectedRoom.value.roomId}-authID`)
        if(storedAuthID) authID.value = storedAuthID;
    }
})

async function joinRoom() {
    if(!selectedRoom.value) return;
    await connection.joinRoom(selectedRoom.value.roomId, {name:nickname.value, authID:authID.value});
    selectedRoom.value = null;
    router.push("/game")
}
</script>