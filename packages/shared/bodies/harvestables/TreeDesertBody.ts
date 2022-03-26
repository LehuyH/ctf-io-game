import { IHarvestable } from "../../index";

export default (config:IHarvestable)=>{
    return [config.x,config.y,18,24,{
        isStatic: true,
        label: `harvestable-${config.id}`
    }]
}