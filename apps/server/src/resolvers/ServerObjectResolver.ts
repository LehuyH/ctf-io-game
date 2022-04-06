//Name to ServerBody mapping

//Import harvestables   
import TreeBright from "../objects/harvestables/TreeBright.server"
import TreeDesert from "../objects/harvestables/TreeDesert.server"
//Import buildings
import Craftbench from "../objects/buildings/Craftbench.server"
import Headquarters from "../objects/buildings/Headquarters.server"


//Map name to ServerBody
export const harvestables = {
    "Tree_bright":TreeBright,
    "Tree_desert":TreeDesert
} as Record<string,any>

export const buildings = {
    "craftbench":Craftbench,
    "headquarters":Headquarters
} as Record<string,any>