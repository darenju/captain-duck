const { registerCommand } = require('../utils');
const {
  BENNY_HILL_DURATION,
  ALI_BABA_DURATION,
  ALADDIN_DURATION,
  SOUND_EFFECT_VOLUME,
} = require('../config.json');
const path = require('path');

function getFile(name) {
  return path.resolve(__dirname, `../sounds/${name}.mp3`);
}

function playSound(message, file, duration) {
  const { channel } = message.member.voice;

  if (!channel) {
    return;
  }

  channel.join()
    .then(function (connection) {
      message.delete();
      const dispatcher = connection.play(file, { volume: SOUND_EFFECT_VOLUME });
      setTimeout(function () {
        dispatcher.pause();
        channel.leave();
      }, duration * 1000);
    }).catch(function (e) {
      channel.leave();
    });
}

const durations = {
  'alibaba': ALI_BABA_DURATION,
  'aladdin': ALADDIN_DURATION,
  'benny': BENNY_HILL_DURATION,
};

function register(client) {
  return registerCommand(
    client,
    /^!play\s(alibaba|aladdin|benny)$/,
    `!play (${Object.keys(durations).join('|')})`,
    'Joue un son si vous êtes dans un channel vocal.',
    function(message, regex) {
      const [_, sound] = message.content.match(regex);

      const duration = durations[sound];

      if (duration) {
        playSound(message, getFile(sound), duration);
      }
    }
  );
}

module.exports = {
  register,
};
