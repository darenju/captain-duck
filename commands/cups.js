const sqlite3 = require('sqlite3');
const path = require('path');
const {
  embed,
  getUserFromMention,
  db,
  listen,
  requiresSuperDuck,
} = require('../utils');

function giveCups(message, cupsToAdd, nickname, database) {
  const req = database.prepare('SELECT cups FROM players WHERE nickname = ?');

  const reply = function () {
    const verb = cupsToAdd > 0 ? 'donnée·s' : 'retirée·s';
    const title = cupsToAdd > 0 ? 'Bravo' : 'Oups';

    message.reply(embed({
      title: `:trophy: ${title}, ${nickname} ! :trophy:`,
      description: `${Math.abs(cupsToAdd)} coupe·s ${verb} à ${nickname} !`,
    }));
  };

  req.get(nickname, function (err, row) {
    if (!row) {
      const add = database.prepare('INSERT INTO players (nickname, cups) VALUES (?, ?)');
      add.run(nickname, parseInt(cupsToAdd, 10), function (err) {
        if (!err) {
          reply();
        }
        add.finalize();
      });
    } else {
      const update = database.prepare('UPDATE players SET cups = ? WHERE nickname = ?');
      const cups = parseInt(row.cups, 10);

      update.run(cups + parseInt(cupsToAdd, 10), nickname, function (err) {
        if (!err) {
          reply();
        }
        update.finalize();
      });
    }
  });
  req.finalize();
}

function setup(client) {
  listen(client, function (message) {
    const { author, content, mentions } = message;

    if (author.bot || (!content.startsWith('!cups') && !content.startsWith('!givecup'))) {
      return;
    }

    const database = db();

    if (content === '!cups') {
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
        message.delete()
          .then(function() {
            message.reply(embed({
              title: ':trophy: Classement Duck Game :trophy:',
              description: `${author.username} a demandé le classement.


              `,
              fields,
            }));
          });
      });
    } else if(requiresSuperDuck(message)) {
      let cupsToGive = 0;
      let mentionToUse = null;

      if (content.startsWith('!cups ')) {
        const [_, mention, cupsToAdd] = content.match(/!cups\s(.*)\s(-{0,1}\d)+/) || [];
        cupsToGive = cupsToAdd;
        mentionToUse = mention;
      } else if (content.startsWith('!givecup ')) {
        const [_, mention, cupsToAdd] = content.match(/!givecup\s(.*)+/) || [];
        cupsToGive = 1;
        mentionToUse = mention;
      }

      if (cupsToGive !== 0) {
        const user = getUserFromMention(mentionToUse, client);
        if (!user) {
          message.reply(embed({
            title: 'Commande invalide : joueur introuvable'
          }));
        } else {
          const { username } = user;
          giveCups(message, cupsToGive, username, database);
        }
      }
    }

    database.close();
  });
}

module.exports = {
  setup,
};
