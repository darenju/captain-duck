const axios = require('axios');
const { parse } = require('node-html-parser');
const { NEW_WORLD_CHANNEL_ID } = require('../bot.json');
const { NEW_WORLD_STATUS_URL } = require('../config.json');
const { embed, registerCommand } = require('../utils');

async function getPlayerId(nickname) {
  return
}

function register(client) {
  return [
    registerCommand(
      client,
      /^(?:!|\/)status$/,
      '!status',
      'Consulte le statut du serveur New World Malva.',
      function(message, regex) {
        const { channel, content } = message;

        if (channel.id !== NEW_WORLD_CHANNEL_ID) {
          return;
        }

        axios.get(NEW_WORLD_STATUS_URL)
          .then(function(response) {
            const html = parse(response.data);
            const status = html.querySelectorAll('.ags-ServerStatus-content-responses-response-server-status-wrapper')[310].innerHTML.match(/title="([\w\s]+)"/)[1];
            message.reply(`Le statut du serveur Malva est : **${status}**`);
          })
          .catch(function(_) {
            return null;
          });
      }
    )
  ];
}

module.exports = {
  register,
};
