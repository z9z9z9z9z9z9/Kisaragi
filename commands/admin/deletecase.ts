import {Message, TextChannel} from "discord.js"
import {Command} from "../../structures/Command"
import {Permission} from "../../structures/Permission"
import {Embeds} from "./../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"
import {SQLQuery} from "./../../structures/SQLQuery"

export default class DeleteCase extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
            description: "Deletes a moderation case, or all cases.",
            help:
            `
            \`deletecase case\` - Deletes a case.
            \`deletecase all\` - Deletes all cases (no undo).
            `,
            examples:
            `
            \`=>deletecase 5\`
            \`=>deletecase all\`
            `,
            aliases: ["delcase"],
            guildOnly: true,
            cooldown: 10
        })
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const perms = new Permission(discord, message)
        const embeds = new Embeds(discord, message)
        const sql = new SQLQuery(message)
        if (!await perms.checkAdmin()) return

        if (!args[1]) return message.reply(`What case do you want to delete ${discord.getEmoji("kannaFacepalm")}`)

        if (args[1] === "all") {
            await sql.updateColumn("warns", "cases", null)
            return message.reply(`Deleted all cases! ${discord.getEmoji("kaosWTF")}`)
        }

        let cases = await sql.fetchColumn("warns", "cases")
        if (!cases) return message.reply(`There are no cases ${discord.getEmoji("kannaFacepalm")}`)
        cases = cases.map((c: any) => JSON.parse(c))

        const index = cases.findIndex((c: any) => Number(c.case) === Number(args[1]))
        if (index === -1) return message.reply(`Invalid case ${discord.getEmoji("kannaFacepalm")}`)
        cases[index] = ""
        cases = cases.filter(Boolean)
        cases.forEach((c: any) => {
            if (Number(c.case) > index) c.case = Number(c.case) - 1
        })
        await sql.updateColumn("warns", "cases", cases)

        if (cases[index].type === "warn") {
            const warns = await sql.fetchColumn("warns", "warn log")
            loop:
            for (let i = 0; i < warns.length; i++) {
                warns[i] = JSON.parse(warns[i])
                for (let j = 0; j < warns[i].warns.length; j++) {
                    if (cases[index].hash === warns[i].warns[j].hash) {
                        warns[i].warns[j] = ""
                        warns[i].warns = warns[i].warns.filter(Boolean)
                        break loop
                    }
                }
            }
            await sql.updateColumn("warns", "warn log", warns)
        }
        return message.reply(`Deleted case **#${Number(args[1])}**!`)
    }
}
