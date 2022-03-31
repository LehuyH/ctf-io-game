<template>
    <main>
        <ResourceBar class="fixed bottom-0 right-0 rounded-tl"/>
        <ItemsBar class="fixed w-screen bottom-[5%] right-0"/>
        <BuildBar class="fixed top-0 left-0"/>
    </main>
</template>

<script setup lang="ts">
import ResourceBar from '~/components/ResourceBar.vue';
import ItemsBar from '~/components/ItemsBar.vue';
import BuildBar from '~/components/BuildBar.vue';
import { onMounted } from 'vue';
import { game } from '~/engine/instance';
import { connection } from '~/connection';
import { setLocalPlayerID } from '~/state';

onMounted(()=>{
    const room = connection.room.value
    if(!room) return;
    setLocalPlayerID(room.sessionId);
    game.scene.start("Overworld")
})
</script>