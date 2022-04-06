export default interface ConnectionManager {
    inputs:{
        start: {
            up: () => void;
            down: () => void;
            left: () => void;
            right: () => void;
        }
        items:{
            set: (index:number)=>void;
            next: ()=>void;
            prev: ()=>void;
        }
        buildings:{
            build: (type:string,x:number,y:number)=>void;
        }
        useTool: ()=>void;
        craftItem: (itemName:string,buildingName:string)=>void;
        registerNation: (name:string)=>void;
    }
    create(): void;
    update(time: number, delta: number): void;
    mockBroadcast(type: string, data: any): void;
}