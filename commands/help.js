const helpText =
`Il existe plusieurs commandes sur ce serveur :

:arrow_right: \`!link [nomdujoueur]\` : Permet d’associer votre nom de joueur PUBG à votre compte Discord.

:arrow_right: \`!statsfpp\` : Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode FPP.

:arrow_right: \`!statstpp\`: Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode TPP.

:arrow_right: \`!stats\` : Affiche les deux statistiques (FPP et TPP).

:arrow_right: \`!help\` : Affiche ce manuel d’aide.
`;

function setup(client) {
  client.on('message', function(message) {
    const { channel, content } = message;

    if (content === '!help') {
      const embed = {
        title: 'Manuel d’aide',
        description: helpText,
      };

      channel.send({ embed });
    }
  });
}

module.exports = {
  setup,
};
