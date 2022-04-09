//Name to Gameobject mapping
import Craftbench from "../objects/buildings/Craftbench"
import Headquarters from "../objects/buildings/Headquarters"
import Campfire from "../objects/buildings/Campfire"

export default  {
    "craftbench":Craftbench,
    "headquarters":Headquarters,
    "campfire":Campfire
} as Record<string,any>