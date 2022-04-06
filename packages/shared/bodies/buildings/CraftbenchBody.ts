import { IBuilding } from "../../index";

export default (config:IBuilding)=>{
    return [config.x,config.y,32,38,{
        isStatic: true,
        label: `building-${config.id}-craftbench`
    }]
}