import Matter from "matter-js";
import { IEventInfo } from "shared";
import ServerPhysics from "../../logic/ServerPhysics";
import { ServerState } from "../../schema/state";
export interface ServerEventManager<T> extends IEventInfo<T>{
    setup: (state:ServerState,world:Matter.World,physics:ServerPhysics)=>void,
    update: (state:ServerState,world:Matter.World,physics:ServerPhysics)=>void,
    cleanup: (state:ServerState,world:Matter.World,physics:ServerPhysics)=>void
}