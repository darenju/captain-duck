const sqlite3 = require('sqlite3');
const path = require('path');
const { SUPER_DUCK_ROLE_NAME } = require('./config.json');

function embed(options) {
  return {
    embed: {
      color: '#27ae60',
      ...options,
    },
  };
}

function getUserFromMention(mention, client) {
  const matches = mention.match(/^<@!?(\d+)>$/);

  if (!matches) return;

  const id = matches[1];

  return client.users.cache.get(id);
}

function db() {
  return new sqlite3.Database(path.resolve(__dirname, 'database.db'));
}

function listen(client, cb) {
  client.on('message', cb);
  client.on('messageUpdate', function(oldMessage, newMessage) {
    cb(newMessage);
  });
}

function isSuperDuck(member) {
  return member.roles.cache.find(r => r.name === SUPER_DUCK_ROLE_NAME) !== undefined;
}

function requiresSuperDuck(message) {
  if (!isSuperDuck(message.member)) {
    message.reply(embed({
      title: 'Erreur de permission !',
      description: 'Tu ne peux pas utiliser cette commande car tu n’as pas le rôle Super Canard.',
    }));
    return false;
  }

  return true;
}

function registerCommand(client, regex, example, usage, cb, superDuckRequired) {
  listen(client, function(message) {
    if (regex.test(message.content) && !message.author.bot) {
      if (superDuckRequired === true && requiresSuperDuck(message)) {
        cb(message, regex);
      } else {
        cb(message, regex);
      }
    }
  });

  return { [example]: usage, needsSuperDuck: superDuckRequired };
}

module.exports = {
  embed,
  getUserFromMention,
  db,
  listen,
  isSuperDuck,
  requiresSuperDuck,
  registerCommand,
};
