import axios from "axios"
import {Message, AttachmentBuilder} from "discord.js"
import {SlashCommandSubcommand, SlashCommandOption} from "../../structures/SlashCommandOption"
import config from "../../config.json"
import {Command} from "../../structures/Command"
import {Embeds} from "./../../structures/Embeds"
import {Kisaragi} from "./../../structures/Kisaragi"
import jimp from "jimp"
import {sharpen} from "animedetect"

export default class Sharpen extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
          description: "Sharpens an image.",
          help:
          `
          \`sharpen amount? sigma?\` - Sharpens the last posted image
          \`sharpen amount? sigma? url\` - Sharpens the linked image
          `,
          examples:
          `
          \`=>sharpen 5\`
          `,
          aliases: ["sharp", "sharpness"],
          cooldown: 10,
          defer: true,
          subcommandEnabled: true
        })
        const urlOption = new SlashCommandOption()
            .setType("string")
            .setName("url")
            .setDescription("Url, or use the last posted image.")

        const sigmaOption = new SlashCommandOption()
            .setType("integer")
            .setName("sigma")
            .setDescription("Sigma of the sharpening.")

        const amountOption = new SlashCommandOption()
            .setType("integer")
            .setName("amount")
            .setDescription("Amount of sharpening.")

        this.subcommand = new SlashCommandSubcommand()
            .setName(this.constructor.name.toLowerCase())
            .setDescription(this.options.description)
            .addOption(amountOption)
            .addOption(sigmaOption)
            .addOption(urlOption)
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        let amount = 1
        let sigma = 1
        let url: string | undefined
        if (args[3]) {
            url = args[3]
        } else if (Number(args[2])) {
            sigma = Number(args[2])
        } else if (args[2]) {
            url = args[2]
        } else if (Number(args[1])) {
            amount = Number(args[1])
        } else if (args[1]) {
            url = args[1]
        }
        if (!url) url = await discord.fetchLastAttachment(message)
        if (!url) return this.reply(`Could not find an image ${discord.getEmoji("kannaCurious")}`)
        const sharpened = await sharpen(url, {amount, sigma})
        const buffer = await sharpened.getBufferAsync(jimp.MIME_PNG)
        const attachment = new AttachmentBuilder(buffer)
        return this.reply(`Sharpened the image with an amount of **${amount}** and sigma of **${sigma}**!`, attachment)
    }
}
