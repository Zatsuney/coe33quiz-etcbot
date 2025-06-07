require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [
  new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Lance une question de quiz'),
  new SlashCommandBuilder()
    .setName('scoreboard')
    .setDescription('Affiche le classement des joueurs'),
  new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Affiche ton rang et ton score personnel'),
  new SlashCommandBuilder()
    .setName('cmd')
    .setDescription('Affiche la liste des commandes'),
  new SlashCommandBuilder()
    .setName('blindtest')
    .setDescription('Joue un extrait musical et devine le titre')
    .addIntegerOption(option =>
      option.setName('numero')
        .setDescription('Numéro du fichier à jouer (1 = premier, 2 = deuxième, etc.)')
        .setMinValue(1)
    ),
  new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Fait quitter le salon vocal au bot'),
  new SlashCommandBuilder()
    .setName('qnumber')
    .setDescription('Affiche le nombre de questions disponibles dans le quiz'),
  new SlashCommandBuilder()
    .setName('btnumber')
    .setDescription('Affiche le nombre d\'extraits disponibles pour le blindtest'),
  new SlashCommandBuilder()
    .setName('randomise')
    .setDescription('Randomise les persos, pictos et luminas')
    .addIntegerOption(option =>
      option.setName('cout_max')
        .setDescription('Coût maximum total en lumina')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Affiche le classement d\'activité des membres')
    .addSubcommand(sub =>
      sub.setName('classement')
        .setDescription('Affiche le classement d\'activité des membres')
    ),
  new SlashCommandBuilder()
    .setName('pstats')
    .setDescription('Affiche tes statistiques personnelles'),
  new SlashCommandBuilder()
    .setName('resetstats')
    .setDescription('Réinitialise les stats d\'un membre ou de tout le serveur')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Le membre dont les stats seront réinitialisées')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('all')
        .setDescription('Réinitialiser les stats de tout le serveur ?')
        .setRequired(false)
    ),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  // Déploiement global (lent)
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );
  console.log('Slash commands globales enregistrées !');

  // Déploiement guild (rapide)
  if (GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands guild enregistrées !');
  }
})();