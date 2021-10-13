const Discord = require('discord.js');
const { BOT_TOKEN, BOT_INFO_CHANNEL } = require('./bot.json');
const fs = require('fs');
const config = require('./config.json');
const invites = require('./commands/invites');
const deafen = require('./commands/deafen');
const stats = require('./commands/stats');
const weapons = require('./commands/weapons');
const cups = require('./commands/cups');
const ducks = require('./commands/ducks');
const sessions = require('./commands/sessions');
const sounds = require('./commands/sounds');
const clean = require('./commands/clean');
const status = require('./commands/status');
const help = require('./commands/help');
const { listen } = require('./utils');

const client = new Discord.Client();
client.setMaxListeners(0);
client.login(BOT_TOKEN);
client.on('ready', function() {
  let message = 0;
  const { BOT_MESSAGES } = config;
  const messages = BOT_MESSAGES.length;

  // Display message only in prod mode.
  if (process.env.ENV !== 'DEV') {
    const infoChannel = client.channels.cache.find(c => c.id === BOT_INFO_CHANNEL);
    fs.readFile('./commit-message', function(err, data) {
      const message = data.toString().trim();

      if (message.length) {
        infoChannel.send(`**Nouvelle mise à jour :**

  ${message}`);
      }
    });
  }

  setInterval(function() {
    message = ++message % messages;
    client.user.setActivity(BOT_MESSAGES[message], { type: 'PLAYING' });
  }, 10000);
});

const commands = [
  cups.register(client),
  ducks.register(client),
  sessions.register(client),
  weapons.register(client),
  stats.register(client),
  sounds.register(client),
  clean.register(client),
  status.register(client),
].flat();

invites.setup(client);
deafen.setup(client);

listen(client, function(message) {
  const { content } = message;

  // Avoid useless stuff.
  if (!content.match(/^(?:!|\/)/)) {
    return;
  }

  if (content.match(/^(?:!|\/)help/)) {
    help.display(commands, message);
  } else if (content.startsWith('!') || content.startsWith('/')) {
    commands.forEach(function (obj) {
      const command = Object.values(obj)[0];
      const { regex, cb } = command;

      if (content.match(regex)) {
        cb(message, regex);
      }
    });
  }
});
