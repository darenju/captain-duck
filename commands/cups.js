const sqlite3 = require('sqlite3');
const path = require('path');
const { CHANNEL_NAME } = require('../config.json');
const {
  embed,
  getUserFromMention,
  db,
  listen,
  requiresSuperDuck,
  registerCommand,
} = require('../utils');

function giveCups(message, cupsToAdd, user) {
  if (!user) {
    message.reply(embed({
      title: 'Commande invalide : joueur introuvable'
    }));

    return;
  }

  const database = db();

  database.get('SELECT rowid FROM duck_game_sessions WHERE complete = FALSE', function(err, session) {
    if (!session) {
      message.reply('Impossible de donner une coupe : pas de session de jeu en cours !');
      return;
    }

    const addRoundToSession = database.prepare('UPDATE duck_game_sessions SET rounds = rounds + 1 WHERE rowid = ?');
    addRoundToSession.run(session.rowid, function (err) {
      addRoundToSession.finalize();
    });

    const getPlayers = database.prepare('SELECT nickname, session FROM duck_game_sessions_players WHERE session = ?');
    getPlayers.each(session.rowid, function (err, row) {
      const addRound = database.prepare('UPDATE players SET duck_game_rounds = duck_game_rounds + 1 WHERE nickname = ?');
      addRound.run(row.nickname, function () {
        addRound.finalize();
      });
    });
    getPlayers.finalize();

    const { username } = user;

    const allowed = database.prepare('SELECT rowid FROM duck_game_sessions_players WHERE nickname = ? AND session = ?');
    allowed.get(username, session.rowid, function(err, isAllowed) {
      allowed.finalize();

      if (!isAllowed) {
        message.reply(embed({
          title: `Impossible de donner une coupe à ${username} car il ne fait pas partie de la session !`,
        }));
        return;
      }

      const req = database.prepare('SELECT cups FROM players WHERE nickname = ?');

      const reply = function (cupsBefore) {
        const verb = cupsToAdd > 0 ? 'donnée·s' : 'retirée·s';
        const title = cupsToAdd > 0 ? 'Bravo' : 'Oups';

        message.reply(embed({
          title: `:trophy: ${title}, ${username} ! :trophy:`,
          description: `${Math.abs(cupsToAdd)} coupe·s ${verb} à ${username} ! Il en a maintenant ${parseInt(cupsBefore, 10) + parseInt(cupsToAdd, 10)}.`,
          footer: {
            text: `${verb} par ${message.author.username}.`,
          },
        }));
      };

      req.get(username, function (err, row) {
        if (!row) {
          const add = database.prepare('INSERT INTO players (nickname, cups) VALUES (?, ?)');
          add.run(username, parseInt(cupsToAdd, 10), function (err) {
            if (!err) {
              reply(0);
            }
            add.finalize();
          });
        } else {
          const update = database.prepare('UPDATE players SET cups = ? WHERE nickname = ?');
          const cups = parseInt(row.cups, 10);

          update.run(cups + parseInt(cupsToAdd, 10), username, function (err) {
            if (!err) {
              reply(cups);
            }
            update.finalize(function (err) {
              database.close();
            });
          });
        }
      });
      req.finalize();
    });
  });
}

function register(client) {
  return [
    registerCommand(
      client,
      /^(?:!|\/)cups$/,
      '!cups',
      'Affiche le classement Duck Game.',
      function(message) {
        if (message.channel.name !== CHANNEL_NAME) {
          return;
        }

        const database = db();
        const fields = [];

        let index = 0;
        database.each('SELECT * FROM players WHERE cups IS NOT NULL ORDER BY cups DESC', function (err, row) {
          const cups = parseInt(row.cups, 10);
          const rounds = row.duck_game_rounds;
          let medal = ':medal:';

          if (index === 0 && cups > 0) {
            medal = ':first_place:';
          }
          if (index === 1 && cups > 0) {
            medal = ':second_place:';
          }
          if (index === 2 && cups > 0) {
            medal = ':third_place:';
          }

          const name = medal + ' ' + row.nickname;

          fields.push({
            name,
            value: `**${cups}** :trophy: \t - (*${rounds} rounds*)`,
            inline: false,
          });

          index++;
        }, function (err) {
          database.close();
          message.delete()
            .then(function () {
              message.reply(embed({
                title: ':trophy: Classement Duck Game :trophy:',
                description: `${message.author.username} a demandé le classement.`,
                fields,
              }));
            });
        });
      }
    ),

    registerCommand(
      client,
      /^(?:!|\/)givecup\s(<@!?\d+>)\s?(-{0,1}\d+)?$/,
      '!givecup [mention] [n=1]',
      'Donne \`n\` coupe·s à l’utilisateur mentionné. Si pas de \`n\` précisé, donne une seule coupe.',
      function(message, regex) {
        if (message.channel.name !== CHANNEL_NAME) {
          return;
        }

        const [_, mention, cups] = message.content.match(regex);
        let cupsToGive = cups || '1';

        giveCups(message, cupsToGive, getUserFromMention(mention, client));
      },
      true
    ),
  ];
}

module.exports = {
  register,
};
