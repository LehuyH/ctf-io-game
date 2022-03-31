import { ServerBody } from "../../logic/ServerBody";
import { IBuilding } from "shared";
import CraftbenchBody from "shared/bodies/buildings/CraftbenchBody";
import { Bodies } from "matter-js";

export default class Craftbench extends ServerBody {
    constructor(config:IBuilding) {
        //@ts-ignore
        const body = Bodies.rectangle(...CraftbenchBody(config));
        const id = config.id;
        super(id,body);
    }
}