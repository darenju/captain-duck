const sqlite3 = require('sqlite3');
const path = require('path');
const { embed, getUserFromMention } = require('../utils');

function setup(client) {
  client.on('message', function(message) {
    const { author, content, mentions } = message;

    if (author.bot || !content.startsWith('!cups')) {
      return;
    }

    const database = new sqlite3.Database(path.resolve(__dirname, '../database.db'));

    if (content === '!cups') {
      const fields = [];

      let index = 0;
      database.each('SELECT * FROM players ORDER BY cups DESC', function(err, row) {
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
      }, function(err) {
        message.reply(embed({
          title: ':trophy: Classement Duck Game :trophy:',
          fields,
        }));
      });
    } else {
      const [_, mention, cupsToAdd] = content.match(/!cups\s(.*)\s(\d)+/) || [];
      const nickname = getUserFromMention(mention, client).username;

      const req = database.prepare('SELECT cups FROM players WHERE nickname = ?');

      const reply = function() {
        message.reply(`${cupsToAdd} coupe·s donnée·s à ${nickname} !`);
      };

      req.get(nickname, function(err, row) {
        if (!row) {
          const add = database.prepare('INSERT INTO players VALUES (?, ?)');
          add.run(nickname, parseInt(cupsToAdd, 10), function(err) {
            if (!err) {
              reply();
            }
            add.finalize();
          });
        } else {
          const update = database.prepare('UPDATE players SET cups = ? WHERE nickname = ?');
          const cups = parseInt(row.cups, 10);

          update.run(cups + parseInt(cupsToAdd, 10), nickname, function(err) {
            if (!err) {
              reply();
            }
            update.finalize();
          });
        }
      });
      req.finalize();
    }

    database.close();
  });
}

module.exports = {
  setup,
};
