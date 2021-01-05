const { embed, listen } = require('../utils');

const helpText =
`Il existe plusieurs commandes sur ce serveur :

:arrow_right: \`!link [nomdujoueur]\` : Permet d’associer votre nom de joueur PUBG à votre compte Discord.

:arrow_right: \`!statsfpp\` : Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode FPP.

:arrow_right: \`!statstpp\`: Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode TPP.

:arrow_right: \`!stats\` : Affiche les deux statistiques (FPP et TPP).

:arrow_right: \`!newduck [mention]\` : Ajoute un nouveau joueur au classement Duck Game.

:arrow_right: \`!cups\` : Affiche le classement Duck Game.

:arrow_right: \`!cups [mention] [n]\` : Donne \`n\` coupe·s à l’utilisateur mentionné.

:arrow_right: \`!givecup [mention]\` : Raccourci pour \`!cups [mention] 1\` ; donne une coupe à l’utilisateur mentionné.

:arrow_right: \`!help\` : Affiche ce manuel d’aide.
`;

function setup(client) {
  listen(client, function(message) {
    const { channel, content } = message;

    if (content === '!help') {
      channel.send(embed({
        title: ':information_source: Manuel d’aide :information_source:',
        description: helpText,
      }));
    }
  });
}

module.exports = {
  setup,
};
