const { db, registerCommand, requiresSuperDuck, getUserFromMention, embed } = require('../utils');

function register(client) {
  return registerCommand(
    client,
    /(?:!|\/)newduck\s(<@!?\d+>)/,
    '!newduck [mention]',
    'Ajoute un nouveau joueur au classement Duck Game.',
    function (message) {
      const { author, content } = message;

      if (author.bot) {
        return;
      }

      if (requiresSuperDuck(message)) {
        const matches = content.match(/!newduck\s(<@!?\d+>)/);
        if (!matches) {
          return;
        }

        if (matches[1]) {
          const user = getUserFromMention(matches[1], client);

          if (user) {
            const { username } = user;

            const database = db();
            const exists = database.prepare('SELECT rowid FROM players WHERE nickname = ?');
            exists.get(username, function (err, row) {
              if (!row) {
                const req = database.prepare('INSERT INTO players(nickname, cups, duck_game_rounds) VALUES (?, 0, 0)');
                req.run(username, function (err) {
                  if (!err) {
                    message.reply(embed({
                      title: ':duck: Nouveau canard ! :duck:',
                      description: `${username} fait bien partie des nouveaux canards ! Bienvenue !`,
                    }));
                  }

                  req.finalize();
                });
              } else {
                message.reply(embed({
                  title: `:duck: ${username} fait déjà partie des canards ! :duck:`,
                }));
              }

              exists.finalize(function () {
                database.close();
              });
            });
          }
        }
      }
    },
    true
  );
}

module.exports = {
  register,
};
