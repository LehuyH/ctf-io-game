import { ServerBody } from "../../logic/ServerBody";
import { IHarvestable } from "shared";
import TreeBrightBody from 'shared/bodies/harvestables/TreeBrightBody'
import { Bodies } from "matter-js";

export default class TreeBright extends ServerBody {
    constructor(config:IHarvestable) {
        //@ts-ignore
        const body = Bodies.rectangle(...TreeBrightBody(config));
        const id = config.id;
        super(id,body);
    }
}