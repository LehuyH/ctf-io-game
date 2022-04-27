import Matter from "matter-js";
import { IEventInfo, IState } from "shared";
export interface ServerEventManager<T> extends IEventInfo<T>{
    setup: (state:IState,world:Matter.World)=>void,
    update: (state:IState,world:Matter.World)=>void,
    cleanup: (state:IState,world:Matter.World)=>void
}