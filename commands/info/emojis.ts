import {Emoji, Message, MessageEmbed} from "discord.js"
import {Command} from "../../structures/Command"
import {Embeds} from "./../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"

export default class Emojis extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
            description: "Info on all emojis.",
            help:
            `
            _Note: To display all emojis with no info, use \`emoji list\` instead._
            \`emojis\` - Posts all of the emojis
            `,
            examples:
            `
            \`=>emojis\`
            `,
            guildOnly: true,
            aliases: [],
            random: "none",
            cooldown: 3
        })
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        const emojis = message.guild!.emojis
        const emojiArray = emojis.cache.map((e: Emoji) => discord.emojis.cache.find((emoji: Emoji) => e.id === emoji.id))
        const nameArray = emojis.cache.map((e: Emoji) => e.name)
        const idArray = emojis.cache.map((e: Emoji) => e.id)
        const createdArray = emojis.cache.map((e: Emoji) => e.createdAt ?? new Date())
        const step = 5.0
        const increment = Math.ceil(emojis.cache.size / step)
        const userEmbedArray: MessageEmbed[] = []
        for (let i = 0; i < increment; i++) {
            const userEmbed = embeds.createEmbed()
            let description = ""
            for (let j = 0; j < step; j++) {
                const value = (i*step)+j
                if (!emojiArray[value]) break
                description += `${discord.getEmoji("star")}_Emoji:_ **${emojiArray[value]}**\n` +
                `${discord.getEmoji("star")}_Emoji Name:_ ${nameArray[value]}\n` +
                `${discord.getEmoji("star")}_Emoji ID:_ \`${idArray[value]}\`\n` +
                `${discord.getEmoji("star")}_Creation Date:_ ${Functions.formatDate(createdArray[value])}\n`
            }
            userEmbed
            .setAuthor("discord.js", "https://discord.js.org/static/logo-square.png")
            .setTitle(`**${message.guild?.name}'s Emojis** ${discord.getEmoji("vigneDead")}`)
            .setThumbnail(message.guild?.iconURL({format: "png", dynamic: true}) as string)
            .setDescription(`${discord.getEmoji("star")}_Emoji Count:_ **${emojiArray.length}**\n` + description)
            userEmbedArray.push(userEmbed)
        }
        embeds.createReactionEmbed(userEmbedArray)
        return
    }
}
