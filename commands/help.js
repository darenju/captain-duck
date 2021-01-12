const { embed, registerCommand } = require('../utils');

function register(client, commands) {
  registerCommand(
    client,
    /^(?:!|\/)help$/,
    '!help',
    'Affiche ce manuel d’aide.',
    function (message) {
      let helpText = `Il existe plusieurs commandes sur ce serveur.

Les préfixes de commande autorisés sont \`!\` et \`/\`.


`;

      commands.forEach(function(command) {
        const name = Object.keys(command)[0];
        const { needsSuperDuck } = command;

        helpText += `:arrow_right: \`${name}\` : ${command[name]}`;

        if (needsSuperDuck) {
          helpText += ` (*requiert le rôle Super Canard*)`;
        }

        helpText += `

        `;
      });

      helpText += `:arrow_right: \`!help\` : Affiche ce manuel d’aide.`;

      message.channel.send(embed({
        title: ':information_source: Manuel d’aide :information_source:',
        description: helpText,
      }));
    }
  )
}

module.exports = {
  register,
};
