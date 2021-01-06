const { registerCommand } = require('../utils');
const { BENNY_HILL_DURATION, BENNY_HILL_VOLUME } = require('../config.json');
const path = require('path');

const file = path.resolve(__dirname, '../bennyhill.mp3');

function register(client) {
  return registerCommand(
    client,
    /^!benny$/,
    '!benny',
    'Joue la musique de Benny Hill si vous êtes dans un channel vocal.',
    function(message) {
      const { channel } = message.member.voice;

      if (!channel) {
        return;
      }

      channel.join()
        .then(function(connection) {
          message.delete();
          const dispatcher = connection.play(file, { volume: BENNY_HILL_VOLUME });
          setTimeout(function() {
            dispatcher.pause();
            channel.leave();
          }, BENNY_HILL_DURATION * 1000);
        }).catch(function(e) {
          channel.leave();
        });
    }
  );
}

module.exports = {
  register,
};
