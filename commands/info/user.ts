import {Message} from "discord.js"
import {SlashCommandSubcommand, SlashCommandOption} from "../../structures/SlashCommandOption"
import {Command} from "../../structures/Command"
import {Embeds} from "../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"

export default class User extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
            description: "Gets information on a user or on yourself.",
            help:
            `
            \`user @user?\` - Gets info on a user
            `,
            examples:
            `
            \`=>user\`
            `,
            guildOnly: true,
            aliases: ["member", "whois"],
            random: "none",
            cooldown: 5,
            subcommandEnabled: true
        })
        const userOption = new SlashCommandOption()
            .setType("user")
            .setName("user")
            .setDescription("User, or yourself if not specified.")
            
        this.subcommand = new SlashCommandSubcommand()
            .setName(this.constructor.name.toLowerCase())
            .setDescription(this.options.description)
            .addOption(userOption)
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        let user = message.member
        if (message.mentions?.members!.size > 0) {
            user = message.mentions.members!.first()!
        }

        const userEmbed = embeds.createEmbed()
        userEmbed
        .setAuthor({name: "discord.js", iconURL: "https://kisaragi.moe/assets/embed/user.png"})
        .setTitle(`**User Info** ${discord.getEmoji("cirNo")}`)
        .setThumbnail(user?.user.displayAvatarURL({extension: "png"}) ?? "")
        .setDescription(
            `${discord.getEmoji("star")}_User:_ **${user?.user.tag}**\n` +
            `${discord.getEmoji("star")}_User ID:_ ${user?.id}\n` +
            `${discord.getEmoji("star")}_Joined Guild At:_ **${Functions.formatDate(user?.joinedAt!)}**\n` +
            `${discord.getEmoji("star")}_Created Account At:_ **${Functions.formatDate(user?.user.createdAt!)}**\n` +
            `${discord.getEmoji("star")}_Roles:_ ${Functions.checkChar(user?.roles.cache.map((r) => `<@&${r.id}>`).join(" ")!, 1000, " ")}`
        )
        return this.reply(userEmbed)
    }
}
