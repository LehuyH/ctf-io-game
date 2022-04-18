import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { CiVNames, ICiv, IPlayer } from "shared";
import { Civ, PlayerSummary } from "../schema/state";

const defaultCivs = {
    [CiVNames.GRASSLAND]: {
        name: "Grassland",
        color: "#00b894",
        influence: 0,
        members: [],
    },
    [CiVNames.DESERT]: {
        name: "Desert",
        color: "#A8644D",
        influence: 0,
        members: [],
    },
    [CiVNames.MESA]: {
        name: "Mesa",
        color: "#e17055",
        influence: 0,
        members: [],
    },
    [CiVNames.WETLAND]: {
        name: "Wetland",
        color: "#079992",
        influence: 0,
        members: [],
    }
} as Record<CiVNames,ICiv>

export class BuildCivs extends Command<BaseRoom> {
    execute(){
        const numPlayers = this.state.players.size;

        //Aim for 4 player per civ before adding more
        const numAllowedCiv = Math.min(Math.max(2, Math.ceil(numPlayers / 4)),4);

        const civs = Object.entries(JSON.parse(JSON.stringify(defaultCivs))).slice(0, numAllowedCiv) as [CiVNames, ICiv][]

        //Create civs if they don't exist in state
        civs.forEach(([civName, civ]) => {
            if(!this.state.civs.get(civName)){
                this.state.civs.set(civName, new Civ({
                    name: civ.name,
                    color: civ.color,
                    id: civName,
                }));
            }else{
                //Reset civ members if civ already exists
                this.state.civs.get(civName).members.clear()
            }
        })

        //Remove civs that are not in the list
        this.state.civs.forEach((civ, civName) => {
            if(!civs.find(([civName2, civ2]) => civName2 === civName)){
                this.state.civs.delete(civName);
            }
        })

        const targetPlayersPerCiv = Math.max(Math.ceil(numPlayers / civs.length),1);
        const parties:Record<string,IPlayer[]> = {}

        this.state.players.forEach((player) => {
            if(player.partyID){
                if(!parties[player.partyID]){
                    parties[player.partyID] = []
                }
                parties[player.partyID].push(player)
            }else{
                //Put player by themself in a party
                parties["noParty-" + player.publicID] = [player]
            }
        })

        //Biggest party first
        const partiesSorted = Object.values(parties).sort((a,b) => b.length - a.length)
        const civQueue = Array.from(this.state.civs.values())
        let civIndex = 0;

        //Assign players to civ until target is reached. Keep parties together
        while(civIndex < civQueue.length && partiesSorted.length > 0){
            while(civQueue[civIndex].members.length < targetPlayersPerCiv){
                //If first party is empty, remove it
                if(partiesSorted[0].length === 0) partiesSorted.shift()
    
                //If no parties left, break
                if(partiesSorted.length === 0) break;
    
                const playerToAdd = partiesSorted[0].shift()
    
                //Assign player to civ
                civQueue[civIndex].members.push(new PlayerSummary({
                    publicID: playerToAdd.publicID,
                    name: playerToAdd.name
                }))
                playerToAdd.civID = civQueue[civIndex].id
            }
            civIndex++
        }
    }
}