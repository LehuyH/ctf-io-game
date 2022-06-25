<template>
   <main class="min-h-screen menu min-w-screen">
      <section class="text-white flex justify-center items-center h-screen" v-if="!uiState.loaded || connectionError">
         <p class="animate-pulse" v-if="!uiState.loaded">Loading...</p>
         <p v-else-if="connectionError" class="font-bold text-red-600">Unable To Connect To Server</p>
      </section>
      <div v-else-if="page.displayed === 'rooms'" class="h-screen w-screen bg-black backdrop-blur-sm bg-opacity-20">
            <section class="max-w-6xl p-8 text-white m-auto block">
            <h1 class="font-bold text-4xl">
                 <button @click="page.displayed = null"
                class="bg-slate-100 text-black p-2 rounded transition-colors hover:bg-slate-200 mb-2">
                <Icon class="text-base" icon="zondicons:cheveron-left" />
            </button>
                Join A Game
            </h1>
            <br>
            <ul>
                <li v-for="room in rooms">
                    {{room.metadata.name}}
                    <button @click="joinRoom(room)" class="rounded bg-green-500 p-2">Join</button>
                </li>
            </ul>
            </section>
      </div>
      <div v-else class="h-screen w-screen bg-black backdrop-blur-sm bg-opacity-20">
         <section class="max-w-6xl p-8 text-white m-auto block">
            <h1 class="font-bold text-4xl">Civ Royale</h1>
            <br>
            <form @submit.prevent="handleMenuClick" class="flex gap-4 justify-center flex-col md:flex-row items-center">
                <aside class="flex flex-col justify-center items-center w-64 h-80">
                    <div class="justify-center items-center flex flex-col">
                        <input required maxlength="10" minlength="3" type="text" class="bg-slate-200 p-4 w-full m-2 rounded text-black"
                v-model="nickname" placeholder="Nickname" />
                    </div>
                <button @click="page.selected='avatar'" class="text-2xl p-2 font-bold flex justify-start items-end hover:scale-105 transition-transform rounded bg-sky-600 text-white group w-full md:flex-grow">
                        <Icon class="text-3xl" icon="map:clothing-store" />
                        <p>Edit Avatar</p>
                </button>
                </aside>
               <GameMode @click="roomType='classic';page.selected='rooms'" name="Classic" desc="Jump into the game right away!" icon="ri:sword-fill"/>
               <GameMode @click="page.selected='learn'" name="Learn" desc="Learn the basics of Civ Royale" icon="fluent:hat-graduation-20-filled"/>
            </form>
         </section>
      </div>
   </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import GameMode from '~/components/GameMode.vue';
import { RoomAvailable } from 'colyseus.js';
import { onMounted, ref, watchEffect, reactive } from 'vue';
import { connection } from '~/connection';
import { useRouter } from 'vue-router';
import { uiState } from '~/state';

const router = useRouter();
const nickname = ref("");
const page = reactive({
    displayed:null as string|null,
    selected:null as string|null
})

const authID = ref<string|null>(null);
const rooms = ref<RoomAvailable[]>([]);
const roomType = ref<null|string>(null)
const connectionError = ref(false)

onMounted(() => {
    connection.room.value?.leave();
    connection.getRooms()
        .then(res => rooms.value = res)
        .catch(err => {
            console.error(err);
            connectionError.value = true
    });
})

async function joinRoom(room:RoomAvailable) {
    try {
        await connection.joinRoom(room.roomId, {
            name: nickname.value,
            authID: authID.value
        });
        router.push("/game")
    } catch (err) {
        console.error(err);
        alert(err);
    }
}

async function handleMenuClick(){
    page.displayed = page.selected
}
</script>


<style scoped>
.menu{
    background-image: url('/images/PlainA.png');
    background-size: cover;
    animation: bgpan infinite linear 500s;
}

@keyframes bgpan{
    from{
        background-position: 0px 0px;
    }
    to {
        background-position: -100vw 0px;
    }
}
</style>