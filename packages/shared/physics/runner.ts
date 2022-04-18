import Phaser from 'phaser';
import uniqid from 'uniqid';
import { IState } from 'shared'

const FIXED_TIMESTEP = 1000 /60

interface Timed{
    interval: number
    timeElasped: number
    id?: string
    callback: (delta: number,state:IState,remover:any) => void
}

export default class Runner{
    world: Phaser.Physics.Matter.World;
    state: IState;
    accumulator = 0;
    timeElapsed = 0;

    delayedCallbacks: Timed[] = [];
    repeatedCallbacks: Timed[] = [];

    constructor(world: Phaser.Physics.Matter.World, state: IState){
        this.world = world;
        this.state = state;
    }

    tick(delta:number){
        this.accumulator += delta;
        this.timeElapsed += delta;
        // update repeated callbacks
        this.repeatedCallbacks.forEach(callback => {
            callback.timeElasped += delta;
            if(callback.timeElasped >= callback.interval){
                const remover =  ()=> this.repeatedCallbacks = this.repeatedCallbacks.filter(cb=>cb.id!==callback.id)
                callback.callback(delta,this.state,remover);
                callback.timeElasped = 0;
            }
        })

        // trigger delayed callbacks
        const newQueue = [] as Timed[];
        this.delayedCallbacks.forEach(callback => {
            callback.timeElasped += delta;
            if(callback.timeElasped >= callback.interval){
                callback.callback(delta,this.state,null);
            }else{
                newQueue.push(callback);
            }
        })

        this.delayedCallbacks = newQueue;


        while(this.accumulator >= FIXED_TIMESTEP){
            this.accumulator -= FIXED_TIMESTEP;
            this.world.step(FIXED_TIMESTEP);
        }
    }

    addDelayedCallback(callback: (delta: number,state: IState) => void, interval: number){
        this.delayedCallbacks.push({
            interval,
            timeElasped: 0,
            callback
        })
    }

    addRepeatedCallback(callback: (delta: number,state: IState,remover:any) => void, interval: number){
        const id = uniqid()
        this.repeatedCallbacks.push({
            interval,
            id,
            timeElasped: 0,
            callback
        })
        //Return canceler function
        return ()=>{
            this.repeatedCallbacks = this.repeatedCallbacks.filter(callback=>callback.id!==id)
        }
    }


}