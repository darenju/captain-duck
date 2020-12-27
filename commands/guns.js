const weapons = require('../weapons.json');
const { embed } = require('../utils');

function setup(client) {
  client.on('message', function(message) {
    const { content } = message;

    if (content === '!weapons') {
      const fields = Object.keys(weapons).map(function(category) {
        return {
          name: category,
          value: weapons[category].join(', '),
          inline: false,
        };
      });

      message.reply(embed({
        url: 'https://duckgame.fandom.com/wiki/Guns',
        title: 'Liste des armes Duck Game',
        fields,
        footer: {
          text: 'Pour plus d’infos sur une arme, tapez `!gunstats [nomarme]`.',
        },
      }));
    }
  });
}

module.exports = {
  setup,
};
