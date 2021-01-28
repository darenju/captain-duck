const { Message } = require('discord.js');
const { DUCK_GAME_VOICE_CHANNEL } = require('../bot.json');
const { CHANNEL_NAME } = require('../config.json');
const { registerCommand, db, embed } = require('../utils');
const moment = require('moment');

function register(client) {
  client.on('voiceStateUpdate', function (oldState, newState) {
    if (oldState.channel && oldState.channel.id === DUCK_GAME_VOICE_CHANNEL) {
      if (!newState.member.voice.channel) {
        // Update to remove presence of User of user in session.
        const database = db();
        const update = database.prepare('UPDATE duck_game_sessions_players SET present = FALSE where nickname = ?');
        update.run(newState.member.user.username, function(err) {
          update.finalize(function() {
            database.close();
          });
        });
      }
    }
  });

  return [
    registerCommand(
      client,
      /^(?:!|\/)endsession$/,
      '!endsession',
      'Termine la session de jeu Duck Game en cours.',
      function(message) {
        if (message.channel.name !== CHANNEL_NAME) {
          return;
        }

        const database = db();
        database.get('SELECT rowid, created_by, rounds FROM duck_game_sessions WHERE complete = FALSE', function(err, session) {
          if (!session) {
            message.reply('Pas de session de jeu à terminer.');
            return;
          }

          const terminate = database.prepare('UPDATE duck_game_sessions SET complete = TRUE, finished_at = (datetime(\'now\', \'localtime\')) WHERE rowid = ?');
          terminate.run(session.rowid, function(err) {
            const players = database.prepare('SELECT nickname, cups FROM duck_game_sessions_players WHERE session = ? ORDER BY cups DESC');

            const fields = [];

            players.each(session.rowid, function(err, player) {
              fields.push({
                name: player.nickname,
                value: `**${player.cups}** :trophy:`,
                inline: false,
              });
            }, function() {
              players.finalize();

              message.delete()
                .then(function() {
                  message.channel.send(embed({
                    title: `Session de jeu de ${session.created_by} terminée !`,
                    description: `
    Il y a eu ${session.rounds} rounds.
    Voici le récapitulatif des coupes gagnées par les joueurs participants :

    `,
                    fields,
                    footer: {
                      text: `Session terminée par ${message.author.username}.`,
                    },
                  }));
                });

              terminate.finalize(function () {
                database.close();
              });
            });
          });
        });
      }
    ),

    registerCommand(
      client,
      /^(?:!|\/)sessions$/,
      '!sessions',
      'Affiche le résumé des sessions de jeu.',
      function(message) {
        if (message.channel.name !== CHANNEL_NAME) {
          return;
        }

        const database = db();
        const fields = [];
        database.each('SELECT session.rowid, COUNT(players.rowid) AS players, session.* FROM duck_game_sessions session, duck_game_sessions_players players WHERE players.session = session.rowid AND session.complete = TRUE', function(err, row) {
          if (!row.created_by) {
            return;
          }

          fields.push({
            name: `:video_game: Session de ${row.created_by}`,
            value: `
:date: **Créée à** : ${moment(row.created_at).format('DD/MM à HH:mm')}
:white_check_mark: **Finie à** : ${moment(row.finished_at).format('DD/MM à HH:mm')}
:trophy: **Rounds** : ${row.rounds}
:duck: **Joueurs** : ${row.players}`,
            inline: false,
          });
        }, function(err, count) {
          message.delete()
            .then(function() {
              message.channel.send(embed({
                title: 'Sessions de Duck Game',
                description: `${message.author.username} a demandé les sessions.`,
                fields,
                footer: {
                  text: `Affichage de ${count} sessions terminé.`
                },
              }));
            })
          database.close();
        });
      }
    )
  ];
}

module.exports = {
  register,
};
