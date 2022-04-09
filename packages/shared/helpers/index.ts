import { Cost, IHarvestable, Item, ItemType } from '../index';

export function canPay(cost: Cost, inventory: Record<string, number>): boolean {
    for (const key in cost) {
        if (!inventory[key] || inventory[key] < cost[key]) {
            return false;
        }
    }
    return true;
}

export function processPay(cost: Cost, inventory: Record<string, number>): Record<string, number> {
    for (const key in cost) {
        inventory[key] -= cost[key];
    }
    return inventory;
}

export function calcHarvestDamage(harvestable:IHarvestable,tool:Item){
    const baseDmg = tool.damage
    const multipliers = {
        'wood':[ItemType.AXE],
        'stone':[ItemType.PICKAXE],
        'iron':[ItemType.PICKAXE],
        'gold':[ItemType.PICKAXE]
    } as Record<string,ItemType[]>

    const multiplierTypes = multipliers[harvestable.resource]
    const multiplier = multiplierTypes.includes(tool.type) ? 1.5 : 1

    return baseDmg * multiplier
}

export function calcPlayerDamage(tool:Item){
    const baseDmg = tool.damage
    const multiplier = (tool.type === 'sword') ? 1.5 : 1
    return baseDmg * multiplier
}