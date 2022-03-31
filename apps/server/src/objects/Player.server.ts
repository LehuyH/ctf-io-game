import { ServerBody } from "../logic/ServerBody";
import { Bodies, Body } from "matter-js";
import { IPlayer, IState } from "shared";
import { ServerState } from "../schema/state"

export default class PlayerBody extends ServerBody {
    interactBody: Body;
    constructor(config:IPlayer,world:Matter.World) {
        //@ts-ignore
        const body = Bodies.rectangle(config.x,config.y,20,20,{
            inertia: Infinity,
            mass:100,
            label: `player-${config.id}-collider`
        });
        const id = config.id;
        super(id,body,world);

        this.interactBody = Bodies.circle(config.x,config.y,30,{
            isSensor: true,
            label: `player-${config.id}`
        });
    }

    sync(state:ServerState){
        //Sync position
        state.players.get(this.id).x = Math.round(this.body.position.x);
        state.players.get(this.id).y = Math.round(this.body.position.y);

        //Sync velocity
        state.players.get(this.id).velocityX = this.body.velocity.x;
        state.players.get(this.id).velocityY = this.body.velocity.y;
    }

    update(delta: number, state: ServerState){
        const player = state.players.get(this.id);
        const { move } = player;
        const { body } = this;
        //Set velocity
        if(move.left){
            Body.setVelocity(body,{
                x: -player.speed,
                y: body.velocity.y
            })
        }
        else if(move.right){
            Body.setVelocity(body,{
                x: player.speed,
                y: body.velocity.y
            })
        }
        else{
            Body.setVelocity(body,{
                x: 0,
                y: body.velocity.y
            })
        }

        if(move.up){
            Body.setVelocity(body,{
                x: body.velocity.x,
                y: -player.speed
            })
        }
        else if(move.down){
            Body.setVelocity(body,{
                x: body.velocity.x,
                y: player.speed
            })
        }
        else{
            Body.setVelocity(body,{
                x: body.velocity.x,
                y: 0
            })
        }
    };
}