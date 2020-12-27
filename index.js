const Discord = require('discord.js');
const config = require('./config.json');
const invites = require('./commands/invites');
const stats = require('./commands/stats');
const weapons = require('./commands/weapons');
const help = require('./commands/help');

const client = new Discord.Client();
client.login(config.BOT_TOKEN);
client.on('ready', function() {
  let message = 0;
  const { BOT_MESSAGES } = config;
  const messages = BOT_MESSAGES.length;

  setInterval(function() {
    message = ++message % messages;
    client.user.setActivity(BOT_MESSAGES[message], { type: 'PLAYING' });
  }, 10000);
});

invites.setup(client);
stats.setup(client);
weapons.setup(client);
help.setup(client);
