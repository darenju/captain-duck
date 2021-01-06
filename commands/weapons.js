const weapons = require('../weapons.json');
const { embed, registerCommand } = require('../utils');
const { default: axios } = require('axios');
const { parse } = require('node-html-parser');

function register(client) {
  return [
    registerCommand(
      client,
      /^!weapons$/,
      '!weapons',
      'Affiche la liste des armes Duck Game.',
      function(message) {
        const fields = Object.keys(weapons.categories).map(function (category) {
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
    ),

    registerCommand(
      client,
      /^!gunstats\s(.*)$/,
      '!gunstats [nomarme]',
      'Affiche les statistiques disponibles pour une arme.',
      function(message, regex) {
        const [_, weapon] = message.content.match(regex);
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
            message.reply(embed({
              title: `L’arme ${weapon} n’existe pas…`,
              description: 'Impossible de trouver cette arme sur le wiki Duck Game.',
            }));
          });
      }
    ),
  ];
}

module.exports = {
  register,
};
