require('dotenv').config();
const express = require('express'); // ← AJOUTE CETTE LIGNE
const app = express();
const { Client, GatewayIntentBits } = require('discord.js');
const { addPoint, getLeaderboard, refreshUsernames, removeScore } = require('./scoreboard');
const fs = require('fs');
const path = require('path');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { weapons, skills, pictos, lumina } = require('./randomizer.js');

// Ajoute MessageContent ici :
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates // ← IMPORTANT !
  ]
});

ffmpeg.setFfmpegPath(ffmpegPath);

const quizQuestions = [
  {
    question: "Quel est le nom du protagoniste principal de Clair Obscur: Expédition 33 ?",
    options: ["A) Lucien", "B) Gustave", "C) Armand", "D) Camille"],
    answer: "B"
  },
  {
    question: "Quelle est la particularité du monde dans Clair Obscur: Expédition 33 ?",
    options: [
      "A) Il est plongé dans une nuit éternelle",
      "B) Il change de forme chaque année",
      "C) Il est envahi par des créatures de lumière",
      "D) Chaque années, les gens dont l'age correspond au nombre sur le monolith sont gommés"
    ],
    answer: "D"
  },
  {
  "question": "Quel est le rôle de la Peintresse dans l'univers de Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Elle est une entité mythique sans influence réelle",
    "B) Elle dirige la ville de Lumière",
    "C) Elle est la fondatrice de l'Expédition Zéro",
    "D) Elle peint sur un monolithe un nombre qui provoque la disparition des personnes ayant cet âge"
  ],
  "answer": "D"
},
{
  "question": "Quelle est la particularité de la ville de Lumière dans le jeu ?",
  "options": [
    "A) Elle est située sous terre",
    "B) Elle est en orbite autour de la planète",
    "C) Elle est inspirée du Paris de la Belle Époque avec des éléments steampunk",
    "D) Elle est entièrement automatisée par des machines"
  ],
  "answer": "C"
},
{
  "question": "Quel est le rôle d'Esquie au sein de l'Expédition 33 ?",
  "options": [
    "A) Un compagnon apportant un soutien émotionnel",
    "B) Un érudit maîtrisant la magie élémentaire",
    "C) Un ingénieur spécialisé en mécanique",
    "D) Un soldat vétéran de l'Expédition Zéro"
  ],
  "answer": "A"
},
{
  "question": "Quelle est la particularité du système de combat dans Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Il repose uniquement on des choix narratifs",
    "B) Il utilise un système de combat automatique sans intervention du joueur",
    "C) Il combine des mécaniques de tour par tour avec des éléments en temps réel",
    "D) Il est entièrement basé sur des cartes à collectionner"
  ],
  "answer": "C"
},
{
  "question": "Quel studio a développé Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Sandfall Interactive",
    "B) Dontnod Entertainment",
    "C) Ubisoft",
    "D) Quantic Dream"
  ],
  "answer": "A"
},
{
  "question": "Quelle est l'inspiration artistique principale du jeu ?",
  "options": [
    "A) L'impressionnisme français et la peinture surréaliste",
    "B) Le réalisme soviétique",
    "C) L'art abstrait moderne",
    "D) Le cubisme espagnol"
  ],
  "answer": "A"
},
{
  "question": "Qui a composé la bande-son de Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Hans Zimmer",
    "B) Nobuo Uematsu",
    "C) Yoko Shimomura",
    "D) Lorien Testard"
  ],
  "answer": "D"
},
{
  "question": "Quelle est la particularité de l'Expédition Zéro ?",
  "options": [
    "A) Elle a été menée par la Peintresse elle-même",
    "B) Elle a découvert l'origine du monolithe",
    "C) Elle est la seule expédition dont certains membres ont survécu",
    "D) Elle a réussi à vaincre la Peintresse"
  ],
  "answer": "C"
},
{
  "question": "Comment le cycle du gommage est-il représenté dans le jeu ?",
  "options": [
    "A) Par une cérémonie de lumière dans la ville",
    "B) Par un nombre peint sur un monolithe géant",
    "C) Par une horloge géante au centre de la ville",
    "D) Par une chanson chantée chaque année"
  ],
  "answer": "B"
},
{
  "question": "Quel est l'objectif principal de l'Expédition 33 ?",
  "options": [
    "A) Cartographier le continent perdu d’Obscuria",
    "B) Empêcher la Peintresse de continuer le cycle du gommage",
    "C) Trouver une source d'énergie alternative",
    "D) Rétablir la magie oubliée"
  ],
  "answer": "B"
},
{
  "question": "Que signifie être 'gommé' dans l’univers du jeu ?",
  "options": [
    "A) Être téléporté dans une autre dimension",
    "B) Être effacé de la mémoire collective et de la réalité",
    "C) Être banni de la ville de Lumière",
    "D) Être transformé en statue de cendre"
  ],
  "answer": "B"
},
{
  "question": "Quel genre de jeu est Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Un rogue-like à la première personne",
    "B) Un visual novel en monde ouvert",
    "C) Un JRPG narratif au tour par tour",
    "D) Un point & click avec éléments de survie"
  ],
  "answer": "C"
},
{
  "question": "Quel est le lien entre le monolithe et la Peintresse ?",
  "options": [
    "A) Il contient son âme",
    "B) Elle y peint un âge chaque année, déclenchant le gommage",
    "C) Il est sa prison millénaire",
    "D) Il est un portail vers le monde des esprits"
  ],
  "answer": "B"
},
{
  "question": "Quelle œuvre est citée comme inspiration majeure pour Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Final Fantasy IX",
    "B) Dishonored",
    "C) La poésie de Baudelaire",
    "D) Bioshock Infinite"
  ],
  "answer": "A"
},
{
  "question": "Comment peut-on décrire l’univers de Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Un univers post-apocalyptique désertique",
    "B) Un monde onirique mêlant art et mélancolie",
    "C) Une reconstitution historique fidèle à la Révolution française",
    "D) Un futur cybernétique en guerre constante"
  ],
  "answer": "B"
},
{
  "question": "Quelle est l’une des caractéristiques des compagnons dans l’expédition ?",
  "options": [
    "A) Ils sont choisis aléatoirement à chaque nouvelle partie",
    "B) Ils sont immortels et ne peuvent pas mourir",
    "C) Ils ont chacun une histoire personnelle liée au gommage",
    "D) Ils sont contrôlés exclusivement par l’IA"
  ],
  "answer": "C"
},
{
  "question": "Qu’est-ce qui représente une menace constante dans le monde du jeu ?",
  "options": [
    "A) La pluie de feu venue du ciel",
    "B) Les automates détraqués du passé",
    "C) Le gommage imposé par la Peintresse",
    "D) L’expansion incontrôlable de la brume magique"
  ],
  "answer": "C"
},
{
  "question": "Quel élément donne une identité artistique unique au jeu ?",
  "options": [
    "A) Un style 8-bit revisité",
    "B) Des animations rappelant des coups de pinceau",
    "C) Des effets inspirés du cinéma muet",
    "D) Des modèles 3D minimalistes"
  ],
  "answer": "B"
},
{
  "question": "Quel thème philosophique traverse l’univers du jeu ?",
  "options": [
    "A) L’éveil de la conscience artificielle",
    "B) La confrontation entre destin et libre arbitre",
    "C) La quête de l’immortalité par la science",
    "D) Le rejet de la modernité technologique"
  ],
  "answer": "B"
},
{
  "question": "Pourquoi l’âge est-il un sujet crucial dans le jeu ?",
  "options": [
    "A) Il détermine les pouvoirs magiques",
    "B) Il conditionne la durée de vie des objets",
    "C) Il décide qui sera gommé chaque année",
    "D) Il n’a aucune importance"
  ],
  "answer": "C"
},
{
  "question": "Quelle émotion domine l’ambiance générale du jeu ?",
  "options": [
    "A) L’espoir triomphant",
    "B) La colère et la vengeance",
    "C) L’humour absurde",
    "D) La mélancolie douce et persistante"
  ],
  "answer": "D"
},
{
  "question": "Comment le temps est-il perçu dans l’univers de Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Comme un cycle figé sous le contrôle de la Peintresse",
    "B) Comme un flux libre que l’on peut remonter",
    "C) Comme un concept inexistant pour les habitants",
    "D) Comme un compte à rebours avant la fin du monde"
  ],
  "answer": "A"
},
{
  "question": "Quelle est l'origine supposée du pouvoir de gommage ?",
  "options": [
    "A) Un artefact technologique oublié",
    "B) Un pacte ancien avec une entité céleste",
    "C) Une peinture vivante liée au monolithe",
    "D) Une malédiction lancée par les anciens rois"
  ],
  "answer": "C"
},
{
  "question": "Qu’est-ce qui renforce les liens entre les membres de l’expédition ?",
  "options": [
    "A) Des séquences de mini-jeux coopératifs",
    "B) Un système de romance et d’amitié",
    "C) Des souvenirs partagés et révélés en voyage",
    "D) Des duels réguliers pour la hiérarchie"
  ],
  "answer": "C"
},
{
  "question": "Quel est le ton dominant de l’écriture dans Clair Obscur: Expédition 33 ?",
  "options": [
    "A) Ironique et satirique",
    "B) Lyrico-mélancolique",
    "C) Brutal et réaliste",
    "D) Épique et grandiloquent"
  ],
  "answer": "B"
},
{
  "question": "Quel est le rôle du joueur dans le déroulement de l'histoire ?",
  "options": [
    "A) Choisir qui doit être gommé chaque année",
    "B) Décider du style artistique du monde",
    "C) Influencer le destin de l’expédition par ses choix",
    "D) Créer de nouveaux sorts de peinture"
  ],
  "answer": "C"
},
{
  "question": "Quelle particularité l’interface utilisateur du jeu possède-t-elle ?",
  "options": [
    "A) Elle change dynamiquement en fonction de l’émotion du personnage",
    "B) Elle est inspirée de carnets de croquis et de pinceaux",
    "C) Elle est projetée dans le ciel du jeu",
    "D) Elle n’est visible que lors des combats"
  ],
  "answer": "B"
},
{
  "question": "Comment est perçue la Peintresse par la population ?",
  "options": [
    "A) Comme une déesse salvatrice",
    "B) Comme une ennemie mystérieuse et invincible",
    "C) Comme une légende pour effrayer les enfants",
    "D) Comme une simple artiste marginale"
  ],
  "answer": "B"
},
{
  "question": "Qui est à l'origine de la direction artistique du jeu ?",
  "options": [
    "A) Le même directeur artistique que pour Gris",
    "B) Un ancien peintre numérique devenu concepteur",
    "C) Un duo de plasticiens français",
    "D) Le fondateur du studio Sandfall Interactive"
  ],
  "answer": "D"
},
];

const blindtestAnswers = [
  { fichier: "extrait1",  reponse: "lumiere" },
  { fichier: "extrait2",  reponse: "une vie a t'aimer" },
  { fichier: "extrait3",  reponse: "alicia" },
  { fichier: "extrait4",  reponse: "gustave" },
  { fichier: "extrait5",  reponse: "lune" },
  { fichier: "extrait6",  reponse: "paintress" },
  { fichier: "extrait7",  reponse: "sciel" },
  { fichier: "extrait8",  reponse: "poeme d'amour" },
  { fichier: "extrait9",  reponse: "robe de jour" },
  { fichier: "extrait10", reponse: "un 33 decembre a paris" },
  { fichier: "extrait11", reponse: "une vie a peindre" },
  { fichier: "extrait12", reponse: "verso" },
  { fichier: "extrait13", reponse: "we lost" },
  { fichier: "extrait14", reponse: "dechire la toile" }
];

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getRandom(arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// Fonction pour tirer plusieurs luminas dont la somme des coûts approche coutMax (glouton)
function pickLuminasForChar(availableLuminas, coutMax) {
  let choisis = [];
  let total = 0;
  // On trie du plus cher au moins cher
  const tries = availableLuminas.slice().sort((a, b) => b.cout - a.cout);
  for (const l of tries) {
    if (total + l.cout <= coutMax) {
      choisis.push(l);
      total += l.cout;
    }
  }
  return choisis;
}

// Ajoute cette fonction utilitaire quelque part avant le client.on('interactionCreate', ...)
function randomLuminasWithMaxCost(luminaList, coutMax) {
  const shuffled = luminaList.slice().sort(() => Math.random() - 0.5);
  let total = 0;
  const result = [];
  for (const l of shuffled) {
    if (total + l.cout <= coutMax) {
      result.push(l);
      total += l.cout;
    }
  }
  return result;
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'quiz') {
    const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    const embed = {
      color: 0x0099ff,
      title: '🎲 Quiz Clair Obscur: Expédition 33',
      description: `**${q.question}**\n\n${q.options.join('\n')}\n\n*Réponds en envoyant A, B, C ou D dans le chat*`
    };
    await interaction.reply({ embeds: [embed] });

    // Collecteur de réponses textuelles (optionnel, à adapter selon ton besoin)
    const filter = response =>
      !response.author.bot &&
      ['A', 'B', 'C', 'D'].includes(response.content.trim().toUpperCase());

    const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });

    collector.on('collect', (reply) => {
      const userAnswer = reply.content.trim().toUpperCase();
      if (userAnswer === q.answer) {
        addPoint(interaction.guild.id, reply.author.id, reply.member ? reply.member.displayName : reply.author.username.split('#')[0]);
        interaction.followUp(`✅ Bravo ${reply.author.username} ! Bonne réponse !`);
        collector.stop('answered');
      } else {
        interaction.followUp(`❌ Mauvaise réponse, ${reply.author.username}. Essaie encore !`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'answered') {
        interaction.followUp('⏰ Temps écoulé ! Personne n\'a trouvé la bonne réponse.');
      }
    });
  }

  if (interaction.commandName === 'scoreboard') {
    await refreshUsernames(interaction.guild);
    const leaderboard = getLeaderboard(interaction.guild.id);
    if (leaderboard.length === 0) {
      await interaction.reply("Aucun score enregistré pour le moment.");
    } else {
      const board = leaderboard
        .map((entry, i) => `**${i + 1}.** ${entry.username} : \`${entry.points}\` point(s)`)
        .join('\n');
      const embed = {
        color: 0xf1c40f,
        title: '🏆 Classement Quiz Clair Obscur',
        description: board
      };
      await interaction.reply({ embeds: [embed] });
    }
  }

  if (interaction.commandName === 'rank') {
    await refreshUsernames(interaction.guild);
    const leaderboard = getLeaderboard(interaction.guild.id);
    const userId = interaction.user.id;
    const userScore = leaderboard.find(entry => entry.userId === userId);

    if (userScore) {
      const userIndex = leaderboard.findIndex(entry => entry.userId === userId);
      const embed = {
        color: 0x3498db,
        title: '📊 Ton rang au Quiz Clair Obscur',
        description: `**${userScore.username}**\nRang : **${userIndex + 1}**\nPoints : \`${userScore.points}\``
      };
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply("Tu n'as pas encore de points enregistrés !");
    }
  }

  if (interaction.commandName === 'cmd') {
    const embed = {
      color: 0x8e44ad,
      title: '📖 Commandes du bot Quiz Clair Obscur',
      description: [
        '**/quiz** — Lance une question de quiz',
        '**/scoreboard** — Affiche le classement des joueurs',
        '**/rank** — Affiche ton rang et ton score personnel',
        '**/cmd** — Affiche cette liste de commandes'
      ].join('\n')
    };
    await interaction.reply({ embeds: [embed] });
  }

  // Ajoute cette commande dans ton interactionCreate :
  if (interaction.commandName === 'blindtest') {
    const musiqueDir = path.join(__dirname, 'musique');
    const fichiers = fs.readdirSync(musiqueDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));
    if (fichiers.length === 0) {
      await interaction.reply('Aucun extrait musical trouvé dans le dossier musique.');
      return;
    }

    const numero = interaction.options.getInteger('numero');
    let fichierChoisi;
    if (numero) {
      // Cherche un fichier qui commence par "extrait" + numero
      fichierChoisi = fichiers.find(f => f.toLowerCase().startsWith(`extrait${numero}`));
      if (!fichierChoisi) {
        await interaction.reply(`Aucun fichier nommé extrait${numero} trouvé.`);
        return;
      }
    } else {
      // Aléatoire si pas de numéro
      fichierChoisi = fichiers[Math.floor(Math.random() * fichiers.length)];
    }
    const cheminFichier = path.join(musiqueDir, fichierChoisi);
    const baseName = path.parse(fichierChoisi).name.toLowerCase();
    const answerObj = blindtestAnswers.find(e => e.fichier === baseName);
    const titreAttendu = answerObj ? answerObj.reponse.toLowerCase() : "";

    // Envoie le fichier audio dans le salon textuel
    const fileMessage = await interaction.channel.send({ files: [cheminFichier] });
    const fileUrl = fileMessage.attachments.first().url;

    // Embed d'annonce
    const embed = {
      color: 0x1abc9c,
      title: '🎵 Blindtest !',
      description: 'Écoute l\'extrait ci-dessous (et dans le vocal si tu y es) et devine le titre !',
      url: fileUrl
    };
    await interaction.reply({ embeds: [embed] });

    // --- Partie salon vocal ---
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const voiceChannel = member.voice.channel;
    if (voiceChannel) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator, // ← comme dans le test
        selfDeaf: true
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(cheminFichier); // ← chemin absolu
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log('Lecture démarrée !');
      });
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Lecture terminée, déconnexion.');
        connection.destroy();
      });
      player.on('error', error => {
        console.error('Erreur audio player:', error);
      });
    } else {
      interaction.followUp('🔊 Pour entendre l\'extrait dans le vocal, rejoins un salon vocal avant de lancer la commande !');
    }

    // --- Collecteur de réponses textuelles ---
    const filter = response => !response.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', (reply) => {
      const userAnswer = removeDiacritics(reply.content.toLowerCase());
      if (userAnswer.includes(titreAttendu)) {
        addPoint(
          interaction.guild.id,
          reply.author.id,
          reply.member ? reply.member.displayName : reply.author.username.split('#')[0]
        );
        interaction.followUp(`✅ Bravo ${reply.author.username} ! Bonne réponse !`);
        collector.stop('answered');
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'answered') {
        interaction.followUp('⏰ Temps écoulé ! Personne n\'a trouvé la bonne réponse.');
      }
    });
  }

  // Nouvelle commande pour quitter le salon vocal
  if (interaction.commandName === 'leave') {
    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
      connection.destroy();
      await interaction.reply('👋 Je quitte le salon vocal !');
    } else {
      // Déconnexion "forcée" si le bot est encore dans un vocal
      const botMember = interaction.guild.members.me;
      if (botMember && botMember.voice.channel) {
        await botMember.voice.disconnect();
        await interaction.reply('👋 Je quitte le salon vocal (déconnexion forcée) !');
      } else {
        await interaction.reply('Je ne suis dans aucun salon vocal.');
      }
    }
  }

  if (interaction.commandName === 'qnumber') {
    await interaction.reply(`Il y a actuellement **${quizQuestions.length}** questions disponibles dans le quiz !`);
  }

  if (interaction.commandName === 'btnumber') {
    const musiqueDir = path.join(__dirname, 'musique');
    const fichiers = fs.readdirSync(musiqueDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));
    await interaction.reply(`Il y a actuellement **${fichiers.length}** extraits disponibles pour le blindtest !`);
  }

  if (interaction.commandName === 'randomise') {
    const characters = Object.keys(weapons);
    const selectedChars = getRandom(characters, 3);

    const coutMax = interaction.options.getInteger('cout_max') ?? 400;

    // Luminas : pas de doublon, coût max par perso (somme)
    let availableLuminas = [...lumina];
    let luminasByChar = [];
    for (let i = 0; i < selectedChars.length; i++) {
      const choisis = pickLuminasForChar(availableLuminas, coutMax);
      luminasByChar.push(choisis);
      // On retire les luminas choisis pour ce perso
      availableLuminas = availableLuminas.filter(l => !choisis.includes(l));
    }

    // Pictos : pas de doublon entre persos
    let availablePictos = [...pictos];
    let pictosByChar = [];
    for (let i = 0; i < selectedChars.length; i++) {
      const charPictos = getRandom(availablePictos, 3);
      pictosByChar.push(charPictos);
      availablePictos = availablePictos.filter(p => !charPictos.includes(p));
    }

    let message = '';
    for (let i = 0; i < selectedChars.length; i++) {
      const char = selectedChars[i];
      const weapon = getRandom(weapons[char], 1)[0];
      const charSkills = getRandom(skills[char], 6);

      message += `**${char.charAt(0).toUpperCase() + char.slice(1)}**\n`;
      message += `Arme : ${weapon}\n`;
      message += `Skills : ${charSkills.join(', ')}\n`;
      message += `Pictos : ${pictosByChar[i].join(', ')}\n`;
      if (luminasByChar[i] && luminasByChar[i].length > 0) {
        const total = luminasByChar[i].reduce((sum, l) => sum + l.cout, 0);
        message += `Luminas (${total}/${coutMax}) : ${luminasByChar[i].map(l => `${l.nom} (${l.cout})`).join(', ')}\n`;
      } else {
        message += `Luminas : Aucun disponible pour ce coût max\n`;
      }
      message += `\n`;
    }

    await interaction.reply({
      embeds: [{
        color: 0x3498db,
        title: '🎲 Résultat du randomiseur',
        description: message
      }]
    });
  }
});

client.on('guildMemberRemove', member => {
  removeScore(member.id);
});

client.login(process.env.DISCORD_TOKEN);

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(process.env.PORT || 3000);