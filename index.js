const fs = require('fs');
const { Client } = require('discord.js-selfbot-v13');

const { token } = require('./config.json');

const client = new Client();

client.on('ready', async () => {
  console.log('alr');
})

client.on('messageCreate', async (message) => {
  
  if (message.content == 'pin') {
    if (!message.reference) {
      console.log('reply to the message you want to pin!');
      return;
    }
    
    const messageToPin = await message.channel.messages.fetch(message.reference.messageId);


    let stacks = JSON.parse(fs.readFileSync('stacks.json'));
    if (!stacks['currentStack']) { // no stack

      newStackMessage = message.channel.send("__new stack__").then(newStackMessageSent => { // create new stack and store its id in stacks.json
        stacks['currentStack'] = newStackMessageSent.id;
        fs.writeFileSync('stacks.json', JSON.stringify(stacks));

        newStackMessageSent.pin()
        
        
        newStackMessageSent.edit(newStackMessageSent.content + '\n' + messageToPin.url); // nice presentation to do
      });

    } else {

      const stackMessage = await message.channel.messages.fetch(stacks['currentStack']);

      stackMessage.edit(stackMessage.content + '\n' + messageToPin.url); // nice presentation to do
    }


    // TODO: handle full stack: parseInt(stackMessage.content.length, 10) + parseInt(messageToPin.content.length, 10) > 2000
  }

  // unpin
  // access pinned / list recently pinned
});

client.login(token);
