const Discord = require('discord.js');
const { BOT_TOKEN, BOT_INFO_CHANNEL } = require('./bot.json');
const fs = require('fs');
const config = require('./config.json');
const invites = require('./commands/invites');
const stats = require('./commands/stats');
const weapons = require('./commands/weapons');
const cups = require('./commands/cups');
const ducks = require('./commands/ducks');
const sessions = require('./commands/sessions');
const sounds = require('./commands/sounds');
const clean = require('./commands/clean');
const help = require('./commands/help');
const { listen } = require('./utils');

const client = new Discord.Client();
client.setMaxListeners(0);
client.login(BOT_TOKEN);
client.on('ready', function() {
  let message = 0;
  const { BOT_MESSAGES } = config;
  const messages = BOT_MESSAGES.length;

  const infoChannel = client.channels.cache.find(c => c.id === BOT_INFO_CHANNEL);

  fs.readFile('./commit-message', function(err, data) {
    infoChannel.send(`**Nouvelle mise à jour :**

${data.toString().trim()}`);
  });

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
].flat();

invites.setup(client);

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
