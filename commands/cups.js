const sqlite3 = require('sqlite3');
const path = require('path');
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
  const req = database.prepare('SELECT cups FROM players WHERE nickname = ?');
  const { username } = user;

  const reply = function (cupsBefore) {
    const verb = cupsToAdd > 0 ? 'donnée·s' : 'retirée·s';
    const title = cupsToAdd > 0 ? 'Bravo' : 'Oups';

    message.reply(embed({
      title: `:trophy: ${title}, ${username} ! :trophy:`,
      description: `${Math.abs(cupsToAdd)} coupe·s ${verb} à ${username} ! Il en a maintenant ${cups + cupsToAdd}.`,
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
        update.finalize(function(err) {
          database.close();
        });
      });
    }
  });
  req.finalize();
}

function register(client) {
  return [
    registerCommand(
      client,
      /^!cups$/,
      '!cups',
      'Affiche le classement Duck Game.',
      function(message) {
        const database = db();
        const fields = [];

        let index = 0;
        database.each('SELECT * FROM players WHERE cups IS NOT NULL ORDER BY cups DESC', function (err, row) {
          const cups = parseInt(row.cups, 10);
          let medal = cups === 0 ? ':medal:' : '';

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
            value: cups,
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
      /^!givecup\s(<@!?\d+>)\s?(-{0,1}\d+)?$/,
      '!givecup [mention] [n=1]',
      'Donne \`n\` coupe·s à l’utilisateur mentionné. Si pas de \`n\` précisé, donne une seule coupe.',
      function(message, regex) {
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
