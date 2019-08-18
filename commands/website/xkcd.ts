exports.run = async (discord: any, message: any, args: string[]) => {

    let xkcd = require('xkcd');
    let xkcdEmbed = discord.createEmbed();
    let monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

    if (args[1]) {
        await xkcd(Number(args[1]), (comic: any) => {
            let cleanText = comic.transcript.replace(/\[\[/g, "**").replace(/\]\]/g, "**").replace(/{{/g, "_").replace(/}}/g, "_");
            let checkedText = discord.checkChar(cleanText);
            xkcdEmbed
            .setAuthor("xkcd", "https://images-na.ssl-images-amazon.com/images/I/51qKVpRPnDL._SY355_.png")
            .setURL(`https://xkcd.com/${comic.num}/`)
            .setTitle(`**xkcd Comic** ${discord.getEmoji("kannaSpook")}`)
            .setDescription(
            `${discord.getEmoji("star")}_Title:_ **${comic.title}**\n` +
            `${discord.getEmoji("star")}_ID:_ **${comic.num}**\n` +
            `${discord.getEmoji("star")}_Date:_ **${monthNames[comic.month]} ${comic.day}, ${comic.year}**\n` +
            `${discord.getEmoji("star")}_Transcript_: ${checkedText ? checkedText : "None"}\n` 
            )
            .setThumbnail(message.author.displayAvatarURL)
            .setImage(comic.img)
            message.channel.send(xkcdEmbed)
        });
    } else {
        await xkcd((comic: any) => {
            let cleanText = comic.transcript.replace(/\[\[/g, "**").replace(/\]\]/g, "**").replace(/{{/g, "_").replace(/}}/g, "_");
            let checkedText = discord.checkChar(cleanText);
            xkcdEmbed
            .setAuthor("xkcd", "https://images-na.ssl-images-amazon.com/images/I/51qKVpRPnDL._SY355_.png")
            .setURL(`https://xkcd.com/${comic.num}/`)
            .setTitle(`**xkcd Comic** ${discord.getEmoji("kannaSpook")}`)
            .setDescription(
            `${discord.getEmoji("star")}_Title:_ **${comic.title}**\n` +
            `${discord.getEmoji("star")}_ID:_ **${comic.num}**\n` +
            `${discord.getEmoji("star")}_Date:_ **${monthNames[comic.month]} ${comic.day}, ${comic.year}**\n` +
            `${discord.getEmoji("star")}_Transcript_: ${checkedText ? checkedText : "None"}\n` 
            )
            .setThumbnail(message.author.displayAvatarURL)
            .setImage(comic.img)
            message.channel.send(xkcdEmbed)
        }); 
    }
}