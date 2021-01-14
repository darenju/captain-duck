const { embed } = require('../utils');

function display(commands, message) {
  let helpText = `Il existe plusieurs commandes sur ce serveur.

Les préfixes de commande autorisés sont \`!\` et \`/\`.


`;

  commands.forEach(function (command) {
    const name = Object.keys(command)[0];
    const { superDuckRequired, usage } = command[name];

    helpText += `:arrow_right: \`${name}\` : ${usage}`;

    if (superDuckRequired) {
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

module.exports = {
  display,
};
