const { embed, registerCommand } = require('../utils');
/*
:arrow_right: \`!link [nomdujoueur]\` : Permet d’associer votre nom de joueur PUBG à votre compte Discord.

:arrow_right: \`!statsfpp\` : Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode FPP.

:arrow_right: \`!statstpp\`: Une fois votre nom de joueur lié, récupère et affiche vos statistiques à vie en mode TPP.

:arrow_right: \`!stats\` : Affiche les deux statistiques (FPP et TPP).

:arrow_right: \`!newduck [mention]\` : Ajoute un nouveau joueur au classement Duck Game.

:arrow_right: \`!cups\` : Affiche le classement Duck Game.

:arrow_right: \`!cups [mention] [n]\` : Donne \`n\` coupe·s à l’utilisateur mentionné.

:arrow_right: \`!givecup [mention]\` : Raccourci pour \`!cups [mention] 1\` ; donne une coupe à l’utilisateur mentionné.


`;
 */
function register(client, commands) {
  registerCommand(
    client,
    /^!help$/,
    '!help',
    'Affiche ce manuel d’aide.',
    function (message) {
      let helpText = `Il existe plusieurs commandes sur ce serveur :

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
