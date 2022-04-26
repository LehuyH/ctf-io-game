import { IEventInfo } from "shared";
export interface ServerEventManager<T> extends IEventInfo<T>{
    setup: ()=>void,
    update: ()=>void,
    cleanup: ()=>void
}