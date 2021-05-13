const path = require('path');
const wol = require('wake_on_lan');
const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const os = require('os'); // ホスト名取得用

require('dotenv').config({ path: path.join(__dirname, '.env') }); // 環境変数に.env使う

const phrases = require("./phrases.js");

// ログイン処理
client.on('ready', () => {
    client.user.setStatus('online') //online, idle, dnd, invisible
        .then(r => console.log('Status set.'))
        .catch(console.error);
    client.user.setActivity(os.hostname()) //ステータスメッセージ
        .then(r => console.log('Activity set.'))
        .catch(console.error);

    console.log('ready...');
});

client.on('guildCreate', guild => { // 入室時の挨拶

    let greetingChannel = "";
    guild.channels.cache.forEach((channel) => {
        if (channel.type == 'text' && greetingChannel == "") {
            if (channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
                greetingChannel = channel;
            }
        }
    })
    greetingChannel.send(phrases.guildCreateGreeting);
});

// メッセージ受け取り時
client.on('message', message => {

    // 自分のだったら無視
    if (message.author.bot) {
        return;
    }

    let author = message.author.username; // 送り主

    // おはよう
    if (message.content.match(/おはよ/)) {

        message.channel.send(phrases.goodMorning) //メッセ送信
            .then(message => console.log(`Message: ${phrases.goodMorning} to ${author}.`)) // コンソールにも出す
            .catch(console.error);
        return;
    }

    // いちゃいちゃ
    if (message.content.match(/好き/)) {

        message.channel.send(phrases.loveCall) //メッセ送信
            .then(message => console.log(`Message: ${phrases.loveCall} to ${author}.`))
            .catch(console.error);
        return;
    }

    // コマンド系
    if (message.content.startsWith("%")) {

        var i = 0;
        for (i = 0; message.content.substr(1).charAt(i) == " "; i++); // % の続きについて空白文字でなくなるまで i を加算
        var commandArray = message.content.substr(i + 1).split(/\s+/); // 空白でない部分からを任意長の空白で区切る

        if (commandArray[0].match(/wol/i)) { // wolコマンド: 指定された端末にWoLを送信

            var mrlog = {
                time: new Date(),
                finished: false,
                channel: message.channel,
                author: author
            };
            fs.writeFileSync("wol.json", JSON.stringify(mrlog, null, 4)); // 手動再起動の完了を記録
            console.log("'wol.json' saved.");

            message.channel.send(phrases.sendWol)
                .then(message => console.log(`WoL message.`))
                .catch(console.error);

            // Send Wake on LAN (to a specified device)
            wol.wake(process.env.MAC_ADDRESS_0, function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Magic packet sent to ${process.env.MAC_ADDRESS_0}.`);
                }
            });

            return;
        }
        return;
    }
});

client.login(process.env.DISCORD_TOKEN) // Login phase
    .then(r => console.log('Login.'))
    .catch(console.error);
