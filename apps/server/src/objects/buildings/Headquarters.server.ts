import { ServerBody } from "../../logic/ServerBody";
import { IBuilding } from "shared";
import HeadquartersBody from "shared/bodies/buildings/HeadquartersBody";
import { Bodies } from "matter-js";

export default class Headquarters extends ServerBody {
    constructor(config:IBuilding,world: Matter.World) {
        //@ts-ignore
        const body = Bodies.rectangle(...HeadquartersBody(config));
        const id = config.id;
        super(id,body,world);
    }
}