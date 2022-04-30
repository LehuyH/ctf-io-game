<template>
    <main>
        <ResourceBar class="fixed bottom-0 right-0 rounded-tl"/>
        <ItemsBar class="fixed w-screen bottom-[5%] right-0"/>
        <SideBar class="fixed top-0 left-0"/>
        <InteractHint/>
        <CraftMenu/>
        <Leaderboard/>
        <WaitingStatus/>
        <EventInfo/>
        <Waypoints/>
    </main>
</template>

<script setup lang="ts">
import ResourceBar from '~/components/ResourceBar.vue';
import ItemsBar from '~/components/ItemsBar.vue';
import InteractHint from '~/components/InteractHint.vue';
import CraftMenu from '~/components/CraftMenu.vue';
import Leaderboard from '~/components/Leaderboard.vue';
import SideBar from '~/components/SideBar.vue';
import WaitingStatus from '~/components/WaitingStatus.vue';
import EventInfo from '~/components/EventInfo.vue';
import Waypoints from '~/components/Waypoints.vue';

import { onMounted } from 'vue';
import { game } from '~/engine/instance';
import { connection } from '~/connection';
import { setLocalPlayerID } from '~/state';
import { useRouter } from 'vue-router';

onMounted(()=>{
    const room = connection.room.value
    if(!room){
        useRouter().push('/')
        return;
    }
    setLocalPlayerID(room.sessionId);
    game.scene.start("Overworld")
})
</script>