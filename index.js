const Discord = require('discord.js');
const config = require('./config.json');
const stats = require('./stats');
const database = require('./database');

const statsFields = {
  'Frags': 'kills',
  'Headshots': 'headshotKills',
  'Victoires': 'wins',
  'Défaites': 'losses',
  'Ratio K/D': 'ratio',
  'Plus long frag': 'longestKill',
};

const client = new Discord.Client();
client.login(config.BOT_TOKEN);
client.on('ready', function() {
  client.user.setActivity('Invitations Duck Game', { type: 'WATCHING' });
});

function displayStats(allStats, mode, author, message) {
  const stats = allStats[mode];

  const fields = [];

  Object.keys(statsFields).forEach(function (name) {
    fields.push({
      name,
      value: stats[statsFields[name]],
      inline: true,
    });
  });

  const embed = {
    title: `Statistiques PUBG de ${author.username} (${mode.toUpperCase()})`,
    description: `Voici vos statistiques (${mode.toUpperCase()}) depuis vos débuts sur le jeu.`,
    color: '#27ae60',
    fields,
  };

  message.reply({ embed });
}

client.on('message', function(message) {
  const { channel, content, author } = message;
  const { name } = channel;

  if (author.bot) {
    return;
  }

  // If in invite channel…
  if (name === config.CHANNEL_NAME) {
    if (content.startsWith('steam://openurl/')) {
      const expire = new Date();
      expire.setHours(expire.getHours() + 1);

      const expireHour = expire.getHours();
      const expireMinute = expire.getMinutes();
      const expireTime = `${expireHour > 10 ? expireHour : '0' + expireHour}:${expireMinute > 10 ? expireMinute : '0' + expireMinute}`;

      const embed = {
        title: `${author.username} vous invite à jouer à Duck Game`,
        description: `${author.username} a créé une partie de Duck Game et vous invite à la rejoindre. :duck:

Clique-sur le lien ci-dessous si tu te sens prêt ! :muscle:
`,
        color: '#27ae60',
        fields: [
          {
            name: 'Le lien',
            value: content,
            inline: false,
          },
          {
            name: 'Expiration',
            value: expireTime,
            inline: true,
          },
        ],
        footer: {
          text: 'N’oubliez pas le talc !',
        },
      };

      message.delete().then(function () {
        channel.send({
          embed,
        }).then(function(invitation) {
          invitation.delete({ timeout: 60 * 60 * 1000 });
        });
      });
    }
    else {
      // Delete the message…
      message.delete({
        reason: 'Ceci n’est pas un lien d’invitation Duck Game !',
      });
    }
  } else {
    // Trying to use a command?
    if (content.startsWith('!link ')) {
      const nickname = content.replace('!link ', '').trim();

      stats.getPlayerId(nickname)
        .then(function(playerId) {
          if (playerId) {
            const players = database.read();
            players[author.id] = playerId;
            database.write(players);
            message.reply(':white_check_mark: Ton nom de joueur a bien été associé !');
          } else {
            message.reply(':warning: Oups… Impossible de trouver ce joueur… Erreur de frappe ?');
          }
        });
    } else if (content.startsWith('!stats')) {
      if (!(content === '!statsfpp' || content === '!statstpp')) {
        return;
      }

      const perspective = content === '!statsfpp' ? 'fpp' : 'tpp';
      const players = database.read();
      const playerId = players[author.id];

      if (!playerId) {
        message.reply(':warning: Impossible de te trouver dans la base de données… As-tu bien associé ton nom de joueur avec `!link [nomjoueur]` ?');
      } else {
        stats.getStats(playerId)
          .then(function(stats) {
            displayStats(stats, perspective, author, message);
          });
      }
    }
  }
});
