import type Phaser from 'phaser'

export enum TileType{
    LAND = "land",
    WATER = "water",
}

export default class TileStorage{
    map: TileType[][] = []
    width:number
    height:number
    size:number
    /** Provide tiles, only size in in PX */
    constructor(width:number,height:number,size:number){
        this.width = width
        this.height = height
        this.size = size
        
        //Create 2d array of tiles set to null
        this.map = new Array(width).fill(TileType.WATER).map(()=>new Array(height).fill(TileType.WATER))
        
    }
    /** Converts coords to tile */
    getTileAtPoint(x:number,y:number){
        return this.map[Math.floor(x/this.size)][Math.floor(y/this.size)]
    }

    /** Finds tile inside a rect boundary */
    getTilesInRect(rect:{x:number,y:number,width:number,height:number}){
        //Convert values into tile coords
        const topX = Math.floor(rect.x/this.size)
        const topY = Math.floor(rect.y/this.size)
        const bottomX = Math.floor((rect.x+rect.width)/this.size)
        const bottomY = Math.floor((rect.y+rect.height)/this.size)
        const tiles:TileType[] = []
        for(let row = topY; row <= bottomY; row++){
            for(let col = topX; col <= bottomX; col++){
                tiles.push(this.map[col][row])
            }
        }
        return tiles
    }

    /** Converts tile to coords */
    getPointAtTile(row:number,col:number){
        return {
            x: row*this.size,
            y: col*this.size
        }
    }
    /** Store phaser tilelayers in localmap */
    importMapPhaser(tilemap: Phaser.Tilemaps.Tilemap){
        const landLayers = tilemap.layers.filter(layer=>layer.name !== 'Ocean')
        //Overwrite ocean tiles where land is present
        landLayers.forEach(layer=>{
            for(let row = 0; row < this.height; row++){
                for(let col = 0; col < this.width; col++){
                    const tile = layer.data[row][col]
                    if(tile.index > 1){
                        this.map[col][row] = TileType.LAND
                    }
                }
            }
        })
    }

    /** Tiled JSON parser */
    importMapRaw(mapRaw:string){
        const map = JSON.parse(mapRaw)
        const landLayers = map.layers.filter((layer:any)=>layer.name !== 'Ocean' && layer.type === 'tilelayer')
        //Overwrite ocean tiles where land is present
        landLayers.forEach((layer:any)=>{
            //Convert layer data to 2d array
            const layerData = []
            while(layer.data.length){
                layerData.push(layer.data.splice(0,this.width))
            }
            //Overwrite ocean tiles where land is present
            for(let row = 0; row < this.height; row++){
                for(let col = 0; col < this.width; col++){
                    if(layerData[row][col] > 1){
                        this.map[col][row] = TileType.LAND
                    }
                }
            }
        })
    }
}