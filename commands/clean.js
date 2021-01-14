const { registerCommand, embed } = require('../utils');

function register(client) {
  return registerCommand(
    client,
    /^(?:!|\/)clean/,
    '!clean',
    'Nettoie les messages du bot (en message privé).',
    function(message) {
      const { channel } = message;

      if (channel.type !== 'dm') {
        message.delete()
          .then(function() {
            channel.send(embed({
              title: 'En message privé uniquement.',
              description: 'Tu ne peux utiliser cette commande qu’en message privé à Captain Duck, pour qu’il nettoie ses messages.',
            }));
          });
        return;
      }

      channel.fetch()
        .then(function(fetched) {
          fetched.messages.fetch()
            .then(function (messages) {
              messages.filter(function(m) {
                return m.author.username === 'Captain Duck'
              }).forEach(function(msg) {
                msg.delete();
              });
            });
        });
    }
  )
}

module.exports = {
  register,
};
