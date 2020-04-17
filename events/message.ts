import {Collection, Message, MessageAttachment, TextChannel} from "discord.js"
import path from "path"
import * as responses from "../assets/json/responses.json"
import SQL from "../commands/bot developer/sql"
import * as config from "../config.json"
import {CommandFunctions} from "../structures/CommandFunctions"
import {Cooldown} from "../structures/Cooldown.js"
import {Kisaragi} from "../structures/Kisaragi.js"
import {Block} from "./../structures/Block"
import {Detector} from "./../structures/Detector"
import {Embeds} from "./../structures/Embeds"
import {Generate} from "./../structures/Generate"
import {Haiku} from "./../structures/Haiku"
import {Letters} from "./../structures/Letters"
import {Link} from "./../structures/Link"
import {Permission} from "./../structures/Permission"
import {Points} from "./../structures/Points"
import {SQLQuery} from "./../structures/SQLQuery"

const responseTextCool = new Set()
const responseImageCool = new Set()
const haikuCool = new Set()
const firstMessage = new Set()
const globalChatCool = new Set()

export default class MessageEvent {
    private readonly cooldowns: Collection<string, Collection<string, number>> = new Collection()
    constructor(private readonly discord: Kisaragi) {}

    public run = async (message: Message) => {
      const letters = new Letters(this.discord)
      const points = new Points(this.discord, message)
      const haiku = new Haiku(this.discord, message)
      const detect = new Detector(this.discord, message)
      const cmdFunctions = new CommandFunctions(this.discord, message)
      const links = new Link(this.discord, message)
      const generate = new Generate(this.discord, message)
      const embeds = new Embeds(this.discord, message)
      const perms = new Permission(this.discord, message)

      if (message.partial) {
        try {
          message = await message.fetch()
        } catch {
          return
        }
      }

      /*if (config.testing === "on") {
        if (message.guild?.id === config.tenpiLand) return
      }*/
      const prefix = await SQLQuery.fetchPrefix(message)

      if (message.author.bot) return
      if (await this.discord.blacklistStop(message)) return

      // const cmdstr = generate.generateCommands()
      // console.log(cmdstr)

      if (!this.discord.checkMuted(message)) {
        if (message.guild) {
          const sql = new SQLQuery(message)
          const globalChat = await sql.fetchColumn("special channels", "global chat")
          if (globalChat && !message.content.startsWith(prefix) && !message.author.bot) {
            const globalChannel = message.guild.channels.cache.find((c) => c.id === globalChat)
            if (message.channel.id === globalChannel?.id) {
              if (message.content.length > 100) return message.reply(`There is a limit of 100 characters on the global chat ${this.discord.getEmoji("sagiriBleh")}`)
              if (message.content.includes("@")) return message.reply(`The **@** character is banned ${this.discord.getEmoji("kannaFU")}`)
              if (globalChatCool.has(message.author.id)) return message.reply(`**global chat** is under a 3 second cooldown! ${this.discord.getEmoji("kannaHungry")}`)
              let globalChannels = await SQLQuery.selectColumn("special channels", "global chat")
              globalChannels = globalChannels.filter(Boolean)
              for (let i = 0; i < globalChannels.length; i++) {
                if (globalChannels[i] === message.channel.id) continue
                const sourceChan = message.channel as TextChannel
                const cleaned = message.content.replace(/@/g, `@\u200b`)
                const chan = this.discord.channels.cache.find((c) => c.id === globalChannels[i]) as TextChannel
                chan.send(`\`#${sourceChan.name}\` ${message.author.tag} -> ${cleaned}`)
                globalChatCool.add(message.author.id)
                setTimeout(() => {
                  globalChatCool.delete(message.author.id)
                }, 3000)
              }
            }
          }
          Block.blockWord(message)
          detect.detectAnime()
          detect.swapRoles()
          const haikuEmbed = haiku.haiku()
          if (haikuEmbed) {
            if (haikuCool.has(message.author.id) || haikuCool.has(message.guild?.id)) {
              const reply = await message.channel.send(`<@${message.author.id}>, **haiku** is under a 3 second cooldown! ${this.discord.getEmoji("kannaHungry")}`)
              reply.delete({timeout: 3000})
              return
            }
            const id = message.guild?.id ?? message.author.id
            haikuCool.add(id)
            setTimeout(() => haikuCool.delete(id), 3000)
            return message.channel.send(haikuEmbed)
          }
          /*const pointTimeout = await sql.fetchColumn("points", "point timeout")
          setTimeout(() => {
          points.calcScore()
          }, pointTimeout ? Number(pointTimeout) : 60000)*/
          if (!firstMessage.has(message.guild.id)) {
            await embeds.updateColor()
            perms.continueTempBans()
            cmdFunctions.autoCommand()
            firstMessage.add(message.guild.id)
          }
        }
        if (responses.text[message.content.trim().toLowerCase()]) {
          const response = message.content.trim().toLowerCase()
          if (!message.author!.bot) {
            if (responseTextCool.has(message.author.id) || responseTextCool.has(message.guild?.id)) {
              const reply = await message.channel.send(`<@${message.author.id}>, **${response}** is under a 3 second cooldown! ${this.discord.getEmoji("kannaHungry")}`)
              reply.delete({timeout: 3000}).then(() => message.delete().catch(() => null))
              return
            }
            const id = message.guild?.id ?? message.author.id
            responseTextCool.add(id)
            setTimeout(() => responseTextCool.delete(id), 3000)
            let text = responses.text[response]
            if (text === "f") {
              text = this.discord.getEmoji("FU")
            } else if (text === "rip") {
              text = this.discord.getEmoji("rip")
            } else if (Array.isArray(text)) {
              text = text.join("")
            }
            return message.channel.send(text)
          }
        }
        if (responses.image[message.content.trim().toLowerCase()]) {
          const response = message.content.trim().toLowerCase()
          if (!message.author!.bot) {
            if (responseImageCool.has(message.author.id) || responseImageCool.has(message.guild?.id)) {
              const reply = await message.channel.send(`<@${message.author.id}>, **${response}** is under a 10 second cooldown!`)
              reply.delete({timeout: 3000}).then(() => message.delete().catch(() => null))
              return
            }
            const id = message.guild?.id ?? message.author.id
            responseImageCool.add(id)
            setTimeout(() => responseImageCool.delete(id), 10000)
            return message.channel.send(new MessageAttachment(responses.image[response]))
          }
       }
        if (message.content.trim().toLowerCase() === "i love you") {
          if (message.author.id === process.env.OWNER_ID) {
            message.channel.send(`I love you more, <@${message.author.id}>!`)
          } else {
            message.channel.send(`Sorry <@${message.author.id}>, but I don't share the same feelings.`)
          }
        }
        if (this.discord.checkBotMention(message)) {
          const args = message.content.slice(`<@!${this.discord.user?.id}>`.length).trim().split(/ +/g)
          if (args[0]) {
            cmdFunctions.runCommand(message, args)
          } else {
            message.reply(`My prefix is set to "${prefix}"!\n`)
          }
        }
        if (message.content.match(/https?:\/\//)) {
          await links.postLink()
          return
        }
      }

      if (!message.content.trim().startsWith(prefix)) return
      if (message.content.trim() === prefix) return
      const args = message.content.trim().slice(prefix.length).trim().split(/ +/g)
      if (args[0] === undefined) return
      const cmd = args[0].toLowerCase()
      const pathFind = await cmdFunctions.findCommand(cmd)
      if (!pathFind) return cmdFunctions.noCommand(cmd)
      const cmdPath = new (require(pathFind).default)(this.discord, message)

      if (cmdPath.options.guildOnly) {
        if (message.channel.type === "dm") return message.channel.send(`<@${message.author.id}>, sorry but you can only use this command in guilds ${this.discord.getEmoji("smugFace")}`)
      }

      const cooldown = new Cooldown(this.discord, message)
      const onCooldown = cooldown.cmdCooldown(path.basename(pathFind).slice(0, -3), cmdPath.options.cooldown, this.cooldowns)
      if (onCooldown && (message.author?.id !== process.env.OWNER_ID)) return message.reply({embed: onCooldown})

      const msg = await message.channel.send(`**Loading** ${this.discord.getEmoji("gabCircle")}`) as Message

      cmdPath.run(args).then(() => {
          const msgCheck = message.channel.messages
          if (msgCheck.cache.has(msg.id)) msg.delete({timeout: 1000})
        }).catch((err: Error) => {
        message.channel.send(this.discord.cmdError(message, err))
      })
    }
  }
