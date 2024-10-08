import {Message} from "discord.js"
import {SlashCommandSubcommand, SlashCommandOption} from "../../structures/SlashCommandOption"
import {Command} from "../../structures/Command"
import {Audio} from "./../../structures/Audio"
import {Embeds} from "./../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"
import {Permission} from "../../structures/Permission"

export default class Pause extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
            description: "Pauses a music stream.",
            help:
            `
            \`pause\` - Pauses the stream
            `,
            examples:
            `
            \`=>pause\`
            `,
            aliases: [],
            guildOnly: true,
            cooldown: 5,
            subcommandEnabled: true
        })
        this.subcommand = new SlashCommandSubcommand()
            .setName(this.constructor.name.toLowerCase())
            .setDescription(this.options.description)
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        const audio = new Audio(discord, message)
        const perms = new Permission(discord, message)
        if (!audio.checkMusicPermissions()) return
        if (!audio.checkMusicPlaying()) return
        audio.pause()
        const rep = await this.reply("Paused the song!")
        await Functions.timeout(3000)
        rep.delete().catch(() => null)
        if (message instanceof Message) message.delete().catch(() => null)
    }
}
