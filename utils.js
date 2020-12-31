const sqlite3 = require('sqlite3');
const path = require('path');

function embed(options) {
  return {
    embed: {
      color: '#27ae60',
      ...options,
    },
  };
}

function getUserFromMention(mention, client) {
  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1);

    if (mention.startsWith('!')) {
      mention = mention.slice(1);
    }

    return client.users.cache.get(mention);
  }
}

function db() {
  return new sqlite3.Database(path.resolve(__dirname, 'database.db'));
}

module.exports = {
  embed,
  getUserFromMention,
  db,
};
