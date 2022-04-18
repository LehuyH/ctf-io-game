import { ServerBody } from "../../logic/ServerBody";
import { IBuilding } from "shared";
import CampfireBody from "shared/bodies/buildings/CampfireBody";
import { Bodies } from "matter-js";

export default class Campfire extends ServerBody {
    constructor(config:IBuilding,world: Matter.World) {
        //@ts-ignore
        const body = Bodies.rectangle(...CampfireBody(config));
        const id = config.id;
        super(id,body,world);
    }
}