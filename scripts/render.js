const { exec } = require('child_process');
const { WebClient } = require('@slack/web-api');
const fs = require("fs");
const token = process.env.HUBOT_SLACK_TOKEN;
const web = new WebClient(token);

module.exports = robot => {
  const queue = {}

  robot.hear(/oe!help/i, msg => {
    msg.send("このBotはチャットに書き込まれたものを逆転裁判パロディにするBotです\n`oe!render start`で開始\n`oe!render end`で終了、動画を生成します");
  });

  robot.hear(/oe!render start/i, msg => {
    if (queue[msg.message.rawMessage.channel]) {
      msg.send("このチャンネルは既に描写対象です\n`oe!render end`で終了、動画を生成しますします");
      return;
    }

    queue[msg.message.rawMessage.channel] = []

    msg.send("描写を開始します...");
  });

  robot.hear(/oe!render end/i, msg => {
    if (!queue[msg.message.rawMessage.channel]) {
      msg.send("このチャンネルは描写対象になっていません\n`oe!render start`で開始します");
      return;
    }

    msg.send("チャンネルの描写を終了しました、動画を生成しています");
    const channel = msg.message.rawMessage.channel;
    const time = Date.now();

    fs.writeFileSync(`${time}.json`, JSON.stringify(queue[msg.message.rawMessage.channel]));
    exec(`python main.py ${time}`, function (error, stdout, stderr) {
      if (error) return console.error(error);

      web.files.upload({
      channels: channel,
      file: fs.createReadStream( `${time}-output.mp4`),
      filename: `${time}-output.mp4`
    }).then(() => {
      fs.unlinkSync(`${time}-output.mp4`)
        fs.unlinkSync(`${time}.json`)
      });
    });

    delete queue[msg.message.rawMessage.channel];
  });

  robot.hear("", msg => {
    if (msg.message.text === "oe!render start" || msg.message.text === "oe!render end") return;

    if (queue[msg.message.rawMessage.channel]) {
      queue[msg.message.rawMessage.channel].push({ user: msg.message.user.real_name, text: msg.message.text })
    }
  });
};
