import { IState } from 'shared';
import Matter from 'matter-js';

export class ServerBody{
    id: string
    body: Matter.Body
    constructor(id: string, body: Matter.Body,world:Matter.World){
        this.id = id;
        this.body = body;
        Matter.World.add(world,body);
    }
    sync(state: IState){}
    update(delta: number,state: IState){}
    cleanup(state: IState,world:Matter.World){
        Matter.World.remove(world,this.body);
    }
}