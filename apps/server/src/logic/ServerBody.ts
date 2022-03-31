import { IState } from 'shared';
import Matter from 'matter-js';

export class ServerBody{
    id: string
    body: Matter.Body
    constructor(id: string, body: Matter.Body){
        this.id = id;
        this.body = body;
    }
    sync(state: IState){}
    update(delta: number,state: IState){}
    cleanup?: (state: IState) => void
}