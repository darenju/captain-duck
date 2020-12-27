const Discord = require('discord.js');
const config = require('./config.json');
const invites = require('./commands/invites');
const stats = require('./commands/stats');
const help = require('./commands/help');

const client = new Discord.Client();
client.login(config.BOT_TOKEN);
client.on('ready', function() {
  client.user.setActivity('Invitations Duck Game', { type: 'WATCHING' });
});

invites.setup(client);
stats.setup(client);
help.setup(client);
