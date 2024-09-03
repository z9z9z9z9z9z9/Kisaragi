import {Message, SlashCommandBuilder, SlashCommandStringOption} from "discord.js"
import {Command} from "../../structures/Command"
import {Audio} from "./../../structures/Audio"
import {Embeds} from "./../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"
import {Permission} from "../../structures/Permission"

export default class Highshelf extends Command {
    constructor(discord: Kisaragi, message: Message<true>) {
        super(discord, message, {
            description: "Applies a highshelf filter to an audio file (boosts treble).",
            help:
            `
            \`highshelf gain? freq? width?\` - Applies a highshelf filter to the audio file with the parameters.
            \`highshelf download/dl gain? freq? width?\` - Applies a highshelf filter to an attachment and uploads it.
            `,
            examples:
            `
            \`=>highshelf 4 3000 100\`
            \`=>highshelf 2 1000 50\`
            `,
            aliases: [],
            guildOnly: true,
            cooldown: 20,
            slashEnabled: true
        })
        const width2Option = new SlashCommandStringOption()
            .setName("width2")
            .setDescription("Width of the filter in the dl subcommand.")

        const widthOption = new SlashCommandStringOption()
            .setName("width")
            .setDescription("Width of the filter or freq in the dl subcommand.")

        const freqOption = new SlashCommandStringOption()
            .setName("freq")
            .setDescription("Freq of the filter or gain in the dl subcommand.")

        const gainOption = new SlashCommandStringOption()
            .setName("gain")
            .setDescription("Gain of the filter or dl to apply to an attachment.")

        this.slash = new SlashCommandBuilder()
            .setName(this.constructor.name.toLowerCase())
            .setDescription(this.options.description)
            .addStringOption(gainOption)
            .addStringOption(freqOption)
            .addStringOption(widthOption)
            .addStringOption(width2Option)
            .toJSON()
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        const audio = new Audio(discord, message)
        const perms = new Permission(discord, message)
        if (!audio.checkMusicPermissions()) return
        if (!audio.checkMusicPlaying()) return
        const queue = audio.getQueue() as any
        let setDownload = false
        if (args[1] === "download" || args[1] === "dl") {
            setDownload = true
            args.shift()
        }
        const gain = Number(args[1])
        const freq = Number(args[2])
        const width = Number(args[3])
        const rep = await message.reply("_Adding a highshelf filter to the file, please wait..._")
        let file = ""
        if (setDownload) {
            const regex = new RegExp(/.(mp3|wav|flac|ogg|aiff)/)
            const attachment = await discord.fetchLastAttachment(message, false, regex)
            if (!attachment) return message.reply(`Only **mp3**, **wav**, **flac**, **ogg**, and **aiff** files are supported.`)
            file = attachment
        } else {
            const queue = audio.getQueue() as any
            file = queue?.[0].file
        }
        try {
            await audio.highshelf(file, gain, freq, width, setDownload)
        } catch {
            return message.reply("Sorry, these parameters will cause clipping distortion on the audio file.")
        }
        if (rep) rep.delete()
        if (!setDownload) {
            const queue = audio.getQueue() as any
            const settings = audio.getSettings() as any
            settings.filters.push("highshelf")
            const embed = await audio.updateNowPlaying()
            queue[0].message.edit(embed)
            const rep = await message.reply("Applied a highshelf filter to the file!")
            await Functions.timeout(3000)
        rep.delete().catch(() => null)
        message.delete().catch(() => null)
        }
        return
    }
}
