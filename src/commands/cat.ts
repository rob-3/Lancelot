import { Command } from '@knighthacks/dispatch';
import axios from 'axios';
import { CommandInteraction, InteractionReplyOptions, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import Colors from '../colors';

const url = 'https://api.thecatapi.com/v1/images/search';

type CatResponse = [{ url: string }];

const button = new MessageButton()
  .setCustomId('catButton')
  .setStyle('PRIMARY')
  .setLabel('Another one!');

const row = new MessageActionRow().addComponents(button);

async function getCatImage(): Promise<string | null> {
  return axios.get<CatResponse>(url)
    .then(response => response.data[0].url)
    .catch(() => null);
}

async function getMessage(): Promise<InteractionReplyOptions> {
  // Get the image URL.
  const catImageURL = await getCatImage();

  if (!catImageURL) {
    return { content: 'Error fetching Cat Image' };
  }

  const embed = new MessageEmbed()
    .setTitle('Random Cat')
    .setColor(Colors.embedColor)
    .setImage(catImageURL);

  return { embeds: [embed], components: [row] };
}

const CatCommand: Command = {
  name: 'cat',
  description: 'Gets a random image of a cat',
  async run(interaction: CommandInteraction) {
    // Defer while we fetch the image.
    await interaction.defer();

    const message = await getMessage();
    const repliedMessage = await interaction.followUp({ ...message, fetchReply: true }) as Message;

    const collector = repliedMessage.createMessageComponentCollector({ componentType: 'BUTTON' });
    collector.on('collect', async (i) => {
      await i.deferUpdate();
      await i.update('hello');
    });

  }
};

export default CatCommand;
