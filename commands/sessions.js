const { Message } = require('discord.js');
const { registerCommand, db, embed } = require('../utils');

function register(client) {
  return [
    registerCommand(
      client,
      /^(?:!|\/)endsession$/,
      '!endsession',
      'Termine la session de jeu Duck Game en cours.',
      function(message) {
        const database = db();
        database.get('SELECT rowid, created_by, rounds FROM duck_game_sessions WHERE complete = FALSE', function(err, row) {
          if (!row) {
            message.reply('Pas de session de jeu à terminer.');
            return;
          }

          const terminate = database.prepare('UPDATE duck_game_sessions SET complete = TRUE WHERE rowid = ?');
          terminate.run(row.rowid, function(err) {
            message.reply(embed({
              title: `Session de jeu terminée par ${row.created_by} ! Il y a eu ${row.rounds} rounds.`
            }));

            terminate.finalize(function() {
              database.close();
            });
          });
        });
      }
    ),
  ];
}

module.exports = {
  register,
};
