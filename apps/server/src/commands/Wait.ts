import { Command } from "@colyseus/command"
export class Wait extends Command<any, number> {
    async execute(ms:number) {
      await this.delay(ms);
    }
}