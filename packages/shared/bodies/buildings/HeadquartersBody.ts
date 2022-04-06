import { IBuilding } from "../../index";

export default (config:IBuilding)=>{
    return [config.x,config.y,100,100,{
        isStatic: true,
        label: `building-${config.id}-headquarters`
    }]
}