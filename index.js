const Discord = require('discord.js');
const { BOT_TOKEN } = require('./bot.json');
const config = require('./config.json');
const invites = require('./commands/invites');
const stats = require('./commands/stats');
const weapons = require('./commands/weapons');
const cups = require('./commands/cups');
const ducks = require('./commands/ducks');
const bennyhill = require('./commands/bennyhill');
const help = require('./commands/help');

const client = new Discord.Client();
client.login(BOT_TOKEN);
client.on('ready', function() {
  let message = 0;
  const { BOT_MESSAGES } = config;
  const messages = BOT_MESSAGES.length;

  setInterval(function() {
    message = ++message % messages;
    client.user.setActivity(BOT_MESSAGES[message], { type: 'PLAYING' });
  }, 10000);

  const commands = [
    cups.register(client),
    ducks.register(client),
    weapons.register(client),
    stats.register(client),
    bennyhill.register(client),
  ];

  invites.setup(client);
  help.register(client, commands.flat());
});

