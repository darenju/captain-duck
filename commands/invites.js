const { CHANNEL_NAME, INVITATION_TIMEOUT, PARTICIPATION_EMOJI } = require('../config.json');
const { embed, listen, db } = require('../utils');
const moment = require('moment');

const timeout = 1000 * 60 * INVITATION_TIMEOUT;

function setup(client) {
  listen(client, function (message) {
    const { channel, content, author } = message;
    const { name } = channel;

    if (author.bot) {
      return;
    }

    // If in invite channel…
    if (name === CHANNEL_NAME) {
      if (content.startsWith('steam://joinlobby/312530/')) {
        const { username } = author;

        message.delete().then(function () {
          channel.send(embed({
            title: `${username} vous invite à jouer à Duck Game`,
            description: `${username} a créé une partie de Duck Game et vous invite à la rejoindre. :duck:

Valide ta participation en ajoutant la réaction ${PARTICIPATION_EMOJI} à ce message. Tu recevras ensuite le lien en message privé.
`,
            fields: [
              {
                name: 'Expiration',
                value: moment().add(INVITATION_TIMEOUT, 'minutes').format('HH:mm'),
                inline: false,
              },
            ],
            footer: {
              text: `N’oubliez pas le talc !`,
            },
          })).then(function(invitation) {
            invitation.react(PARTICIPATION_EMOJI);
            invitation.delete({ timeout });

            const database = db();
            const req = database.prepare('INSERT INTO duck_game_sessions (created_by, message_id, link) VALUES (?, ?, ?)');
            req.run(username, invitation.id, content, function(err) {
              req.finalize(function(err) {
                database.close();
              });
            });
          });
        });
      }
    }
  });

  client.on('messageReactionAdd', function(messageReaction, user) {
    if (user.bot || messageReaction.emoji.name !== PARTICIPATION_EMOJI) {
      return;
    }

    const { message } = messageReaction;
    const messageID = message.id;
    const nickname = user.username;

    const database = db();
    const fetch = database.prepare('SELECT rowid, link FROM duck_game_sessions WHERE message_id = ?');
    fetch.get(messageID, function(err, row) {
      if (row) {
        fetch.finalize();

        user.send(`Salut, tu vas rejoindre une partie de Duck Game. Voici le lien : ${row.link}

Bonne chance ! :muscle:`)
          .then(function(messageSent) {
            messageSent.delete({ timeout });
          });

        const addParticipation = database.prepare('INSERT INTO duck_game_sessions_players (session, nickname) VALUES (?, ?)');
        addParticipation.run(row.rowid, nickname, function(err) {
          addParticipation.finalize(function() {
            database.close();
          });
        });
      } else {
        message.channel.send('Impossible de trouver cette session de jeu !');
      }
    });
  });
}

module.exports = {
  setup,
};
