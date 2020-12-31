const config = require('../config.json');
const { embed } = require('../utils');

function setup(client) {
  client.on('message', function (message) {
    const { channel, content, author } = message;
    const { name } = channel;

    if (author.bot) {
      return;
    }

    // If in invite channel…
    if (name === config.CHANNEL_NAME) {
      if (content.startsWith('steam://joinlobby/312530/')) {
        const expire = new Date();
        expire.setHours(expire.getHours() + 1);

        const expireHour = expire.getHours();
        const expireMinute = expire.getMinutes();
        const expireTime = `${expireHour > 10 ? expireHour : '0' + expireHour}:${expireMinute > 10 ? expireMinute : '0' + expireMinute}`;

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
              {
                name: 'Expiration',
                value: expireTime,
                inline: true,
              },
            ],
            footer: {
              text: 'N’oubliez pas le talc !',
            },
          })).then(function (invitation) {
            invitation.delete({ timeout: 60 * 60 * 1000 });
          });
        });
      }
    }
  });
}

module.exports = {
  setup,
};
