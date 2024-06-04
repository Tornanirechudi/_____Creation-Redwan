const fs = require("fs-extra");
const { utils } = global;
const UpolUrl = ["https://i.ibb.co/HPYqLzC/image.gif"];
const UpolImage = UpolUrl[Math.floor(Math.random() * UpolUrl.length)];

module.exports = {
  config: {
    name: "prefix",
    version: "1.3",
    author: "NTKhang | UPoL🐔",
    role: 0,
  },

  langs: {
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change the prefix of the system bot",
      confirmGlobal: "Please react to this message to confirm changing the prefix of the system bot",
      confirmThisThread: "Please react to this message to confirm changing the prefix in your box chat",
      successGlobal: "Changed the prefix of the system bot to: %1",
      successThisThread: "Changed the prefix in your box chat to: %1",
      myPrefix: "⚙ My prefix is: %2"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) {
      return message.SyntaxError();
    }

    if (args[0] === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) {
        return message.reply(getLang("onlyAdmin"));
      }
      formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      if (err) {
        return console.error(err);
      }
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) {
      return;
    }
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const attachment = await utils.getStreamFromURL(UpolImage);
      return message.reply({
        body: getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)),
        attachment: attachment
      });
    }
  }
};
