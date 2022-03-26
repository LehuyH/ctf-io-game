export default class BootScene extends Phaser.Scene{
    preload(){
       // this.load.image('logo', 'assets/logo.png')
    }
    create(){
       //Add square
       this.add.rectangle(400, 300, 64, 64, 0xffffff)
    }
}