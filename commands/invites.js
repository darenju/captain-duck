const config = require('../config.json');
const { embed, listen } = require('../utils');

function setup(client) {
  listen(client, function (message) {
    const { channel, content, author } = message;
    const { name } = channel;

    if (author.bot) {
      return;
    }

    // If in invite channel…
    if (name === config.CHANNEL_NAME) {
      if (content.startsWith('steam://joinlobby/312530/')) {
        message.delete().then(function () {
          channel.send(embed({
            title: `${author.username} vous invite à jouer à Duck Game`,
            description: `${author.username} a créé une partie de Duck Game et vous invite à la rejoindre. :duck:

Clique-sur le lien ci-dessous si tu te sens prêt ! :muscle:
`,
            fields: [
              {
                name: 'Le lien',
                value: content,
                inline: false,
              },
            ],
            footer: {
              text: 'N’oubliez pas le talc !',
            },
          }));
        });
      }
    }
  });
}

module.exports = {
  setup,
};
