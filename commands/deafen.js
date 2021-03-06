const { AFK_CHANNEL } = require('../bot.json');

function setup(client) {
  client.on('voiceStateUpdate', function(oldChannel, newChannel) {
    if (newChannel !== undefined) {
      const { member: { voice } } = newChannel;

      // User joins AFK channel.
      if (newChannel.channelID === AFK_CHANNEL) {
        if (!voice.serverDeaf || !voice.serverMute) {
          voice.setDeaf(true);
          voice.setMute(true);
        }
      } else {
        // Leaves it.
        if (voice.serverDeaf || voice.serverMute) {
          voice.setDeaf(false)
            .catch((e) => {});
          voice.setMute(false)
            .catch((e) => {});
        }
      }
    }
  });
}

module.exports = {
  setup,
};
