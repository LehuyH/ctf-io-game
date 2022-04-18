import { IBuilding } from "../../index";

export default (config:IBuilding)=>{
    return [config.x,config.y,32,32,{
        isStatic: true,
        label: `building-${config.id}-campfire`
    }]
}