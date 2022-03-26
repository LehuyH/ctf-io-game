import ObjectManager from "~/engine/logic/ObjectManager";
import ServerEmulator from "../logic/ServerEmulator";
import StateSyncerOffline from "../logic/StateSync";
import ConnectionManager from "./ConnectionManager";

export default interface ClientRoom extends Phaser.Scene {
    objects: ObjectManager
    connection: ConnectionManager
    state: StateSyncerOffline
    serverEmulator?: ServerEmulator
}