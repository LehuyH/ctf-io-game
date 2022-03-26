import { IHarvestable } from "../../index";

export default (config:IHarvestable)=>{
    return [config.x,config.y,32,32,{
        isStatic: true,
        label: `harvestable-${config.id}`
    }]
}