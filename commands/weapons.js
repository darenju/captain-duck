const weapons = require('../weapons.json');
const { embed, listen } = require('../utils');
const { default: axios } = require('axios');
const { parse } = require('node-html-parser');

function setup(client) {
  listen(client, function(message) {
    const { content } = message;

    if (content === '!weapons') {
      const fields = Object.keys(weapons.categories).map(function(category) {
        return {
          name: category,
          value: weapons.categories[category].join(', '),
          inline: false,
        };
      });

      message.reply(embed({
        url: 'https://duckgame.fandom.com/wiki/Guns',
        title: ':gun: Liste des armes Duck Game :gun:',
        fields,
        footer: {
          text: 'Pour plus d’infos sur une arme, tapez `!gunstats [nomarme]`.',
        },
      }));
    }
  });

  listen(client, function(message) {
    const { content } = message;

    if (content.startsWith('!gunstats ')) {
      const weapon = content.replace('!gunstats ', '').trim();
      const encodedWeapon = weapon.replace(/\s/g, '_');
      const url = `https://duckgame.fandom.com/wiki/${encodedWeapon}`;

      axios.get(url)
        .then(function (response) {
          const parsed = parse(response.data);
          const image = parsed.querySelector('.pi-image-thumbnail').getAttribute('src');
          const description = parsed.querySelectorAll('#mw-content-text p')[1].text;
          const fields = parsed.querySelectorAll('.pi-data.pi-item')
            .map(function (item) {
              return {
                name: item.querySelector('.pi-data-label').text,
                value: item.querySelector('.pi-data-value').text,
                inline: true,
              };
            });

            message.reply(embed({
              title: weapon,
              description,
              thumbnail: {
                url: image,
              },
              url,
              fields,
            }));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
}

module.exports = {
  setup,
};
