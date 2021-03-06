const axios = require('axios');
const { PUBG_API_KEY } = require('../bot.json');
const { embed, db, registerCommand } = require('../utils');

const platform = 'steam';
const url = `https://api.pubg.com/shards/steam/players`;

const modes = {
  fpp: ['solo-fpp', 'duo-fpp', 'squad-fpp'],
  tpp: ['solo', 'duo', 'squad'],
};

function reduce(perspective, key, stats) {
  return modes[perspective].reduce(function (count, mode) {
    return count + stats[mode][key];
  }, 0);
}

axios.defaults.headers.common = {
  'Authorization': `Bearer ${PUBG_API_KEY}`,
  'Accept': 'application/vnd.api+json',
};

async function getPlayerId(nickname) {
  return axios.get(`${url}?filter[playerNames]=${nickname}`)
    .then(function(response) {
      const { data: { data } } = response;

      if (!data.length) {
        return null;
      }

      return data[0].id;
    })
    .catch(function(_) {
      return null;
    });
}

async function getStats(playerId) {
  return axios.get(`${url}/${playerId}/seasons/lifetime`)
    .then(function (response) {
      const {
        data: {
          data: {
            attributes: {
              gameModeStats,
            },
          },
        },
      } = response;

      const stats = {};

      ['fpp', 'tpp'].forEach(function (mode) {
        stats[mode] = {};

        ['kills', 'headshotKills', 'wins', 'losses'].forEach(function (stat) {
          stats[mode][stat] = reduce(mode, stat, gameModeStats);
        });

        stats[mode].longestKill = Math.round(modes[mode].reduce(function (val, mode) {
          const curr = gameModeStats[mode].longestKill;
          return curr > val ? curr : val;
        }, 0));

        stats[mode].ratio = (stats[mode].kills / stats[mode].losses).toFixed(2);
      });

      return stats;
    })
    .catch(function (error) {
      console.log(error);

      const { response: { status } } = error;

      if (status === 429) {
        console.log('Trop de requêtes, veuillez réessayer plus tard.');
      }
    });
}

const statsFields = {
  ':gun: Frags': 'kills',
  ':skull: Headshots': 'headshotKills',
  ':trophy: Victoires': 'wins',
  ':headstone: Défaites': 'losses',
  ':information_source: Ratio K/D': 'ratio',
  ':crossed_swords: Plus long frag': 'longestKill',
};

function displayStats(allStats, mode, username, message) {
  const stats = allStats[mode];

  const fields = [];

  Object.keys(statsFields).forEach(function (name) {
    fields.push({
      name,
      value: stats[statsFields[name]],
      inline: true,
    });
  });

  message.reply(embed({
    title: `Statistiques PUBG de ${username} (${mode.toUpperCase()})`,
    description: `Voici vos statistiques (${mode.toUpperCase()}) depuis vos débuts sur le jeu.`,
    fields,
  }));
}

function register(client) {
  return [
    registerCommand(
      client,
      /^(?:!|\/)link\s(.*)$/,
      '!link [nomdujoueur]',
      'Permet d’associer votre nom de joueur PUBG à votre compte Discord.',
      function(message, regex) {
        const { author: { username } } = message;
        const matches = message.content.match(regex);
        const nickname = matches[1].trim();

        getPlayerId(nickname)
          .then(function (playerId) {
            if (playerId) {
              const database = db();
              const exists = database.prepare('SELECT pubg_id FROM players WHERE nickname = ?');
              exists.get(username, function (err, row) {
                let statement;

                // Player exists, update.
                if (row) {
                  statement = database.prepare('UPDATE players SET pubg_id = ? WHERE nickname = ?');
                } else {
                  statement = database.prepare('INSERT INTO players (pubg_id, nickname, cups) VALUES (?, ?, 0)');
                }

                if (statement.run(playerId, username)) {
                  message.reply(':white_check_mark: Ton nom de joueur a bien été associé !');
                  exists.finalize(function () {
                    statement.finalize(function (err) {
                      database.close();
                    });
                  });
                }
              });
            } else {
              message.reply(':warning: Oups… Impossible de trouver ce joueur… Erreur de frappe ?');
            }
          });
      }
    ),

    registerCommand(
      client,
      /^(?:!|\/)stats(fpp|tpp)?$/,
      '!stats(tpp|fpp)',
      'Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode FPP, TPP, ou les deux.',
      function(message, regex) {
        const { author: { username } } = message;
        const [_, perspective] = message.content.match(regex);
        const perspectives = perspective ? [perspective] : ['fpp', 'tpp'];

        const database = db();
        const fetch = database.prepare('SELECT pubg_id FROM players WHERE nickname = ?');

        fetch.get(username, function (err, row) {
          if (!row || !row.pubg_id) {
            message.reply(':warning: Impossible de te trouver dans la base de données… As-tu bien associé ton nom de joueur avec `!link [nomjoueur]` ?');
          } else {
            getStats(row.pubg_id)
              .then(function (stats) {
                perspectives.forEach(function (perspective) {
                  displayStats(stats, perspective, username, message);
                });
              });
          }

          fetch.finalize(function (err) {
            database.close();
          });
        });
      }
    )
  ];
}

module.exports = {
  register,
};
