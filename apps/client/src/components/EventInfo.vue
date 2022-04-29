<template>
    <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <section v-if="event"
         class="bg-black p-4 text-white bg-opacity-30 pt-4 fixed z-10 left-4 top-4 rounded shadow-md max-w-sm mx-4 inline-block overflow-hidden">
         <h1 class="font-bold text-lg inline-block">{{event.name}}</h1> <span class="bg-slate-500 px-2">{{timeLeft}} Seconds</span>
         <br>
         <p class="marquee overflow-hidden inline-block whitespace-nowrap">{{event.description}}</p>
     </section>
    </transition>
</template>

<script setup lang="ts">
import { state } from '~/state';
import { computed } from 'vue'
import { IEventInfo } from 'shared';
const event = computed(()=>{
    if(state.currentEvent?.id){
        return state.currentEvent as IEventInfo<any>
    }else{
        return null
    }
})
const timeLeft = computed(()=>{
    if(state.currentEvent?.id){
        return state.currentEvent.duration/1000 as number
    }else{
        return null
    }
})
</script>

<style scoped>
.marquee{
    animation: marquee 15s linear infinite;
}
@keyframes marquee {
    0%   { transform: translate(100%, 0); }
    100% { transform: translate(-110%, 0); }
}

.fadeIn{
    animation: fadeIn 1s ease-in-out;
}

.fadeOut{
    animation: fadeIn 1s ease-in-out reverse;
}

@keyframes fadeIn{
  0% {
    opacity: 0;
    transform: translateX(-150%);
  }
  100% {
    opacity: 1;
    transform: translateX(0%);
  }
}

</style>