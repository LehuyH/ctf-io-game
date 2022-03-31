import { ServerBody } from "../../logic/ServerBody";
import { IHarvestable } from "shared";
import TreeDesertBody from 'shared/bodies/harvestables/TreeDesertBody'
import { Bodies } from "matter-js";

export default class TreeBright extends ServerBody {
    constructor(config:IHarvestable) {
        //@ts-ignore
        const body = Bodies.rectangle(...TreeDesertBody(config));
        const id = config.id;
        super(id,body);
    }
}