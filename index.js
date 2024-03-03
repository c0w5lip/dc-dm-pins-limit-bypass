const { token } = require('./config.json');

const fs = require('fs');

const { Client } = require('discord.js-selfbot-v13');
const client = new Client();


const STACK_SEPARATOR = '❀⊱┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄⊰❀';


async function createNewStack(channel, stackJSONFile) {
  return new Promise((resolve, reject) => {
    channel.send(STACK_SEPARATOR + '\n' + STACK_SEPARATOR).then(stackMessage => {
      stackJSONFile['id'] = stackMessage.id;
      fs.writeFileSync('stack.json', JSON.stringify(stackJSONFile));

      resolve(stackMessage);
      // stackMessage.pin(); // TODO: check if the limit isn't reached
    }).catch(err => {
      reject(err);
    });
  });
}

function pushOntoStack(stackMessage, messageToPush) {
  // TODO: handle full stack situation
  /*
  if (parseInt(stackMessage.content.length, 10) + parseInt(messageToPush.content.length, 10) > 2000) {
    let newStackMessage = await createNewStack(messageToPush.channel, JSON.parse(fs.readFileSync('stack.json')));
    pushOntoStack(newStackMessage, messageToPush);
  }
  */
  
  let messagePreview = messageToPush.content.substring(0, 16);
  if (parseInt(messageToPush.content.length, 10) > 16 ) {
    messagePreview += '...';
  }

  var date = new Date(messageToPush.createdTimestamp);
  let messageToPushFormatting =
    '✰ ' + messageToPush.url +
    ' ✎ "' + messagePreview + '"' +
    '  ~ 『' + date.getDate().toString().padStart(2, "0") + '/' + (date.getMonth()+1).toString().padStart(2, "0") + '/' + date.getFullYear() + '』';


  let stackLines = stackMessage.content.split('\n');
  stackLines.pop()
  stackLines.push(messageToPushFormatting, STACK_SEPARATOR);
  let newStackMessage = stackLines.join('\n');

  stackMessage.edit(newStackMessage);
}

function popFromStack(stackMessage, messageToPop) {
  let stackLines = stackMessage.content.split('\n');
  stackLines.pop()

  stackLines.forEach(line => {
    if (line.includes(messageToPop.url)) {
      stackLines.splice(stackLines.indexOf(line), 1); 
    }
  });

  stackLines.push(STACK_SEPARATOR);
  let newStackMessage = stackLines.join('\n');

  stackMessage.edit(newStackMessage);
}


client.on('ready', async () => {
  console.log('[+] dc-dm-pins-limit-bypass: ' + client.user.username);
})

client.on('messageCreate', async (message) => {
  if (message.author != client.user.id) {
    return;
  }

  if (message.content == '/help') {
    let helpMessageContent = '__dc-dm-pins-limit-bypass__:\n' +
    '`/pin` (replying to message): pin a message\n' +
    '`/unpin` (replying to message): unpin a message\n' +
    '`/stack`: get a link to your stack\n' + ' \n' +
    'Any issue? A question?:\n' +
    '**https://github.com/c0w5lip/dc-dm-pins-limit-bypass** - @c0w5lip'
    message.reply(helpMessageContent);
  }
  
  if (message.content == '/pin') {
    if (!message.reference) {
      message.edit(':x: `dc-dm-pins-limit-bypass: you must quote a message to pin it`');
      return;
    }
    
    let stackMessage;
    let stackJSONFile = JSON.parse(fs.readFileSync('stack.json'));
    if (!stackJSONFile['id']) {
      stackMessage = await createNewStack(message.channel, stackJSONFile);
    } else {
      stackMessage = await message.channel.messages.fetch(stackJSONFile['id']);
    }
    
    pushOntoStack(stackMessage, await message.channel.messages.fetch(message.reference.messageId));
  }

  if (message.content == '/unpin') {
    if (!message.reference) {
      message.edit(':x: `dc-dm-pins-limit-bypass: you must quote a message to unpin it`');
      return;
    }

    popFromStack(
      await message.channel.messages.fetch(JSON.parse(fs.readFileSync('stack.json'))['id']),
      await message.channel.messages.fetch(message.reference.messageId)
    );
  }

  if (message.content == '/stack') {
    let stackMessage = await message.channel.messages.fetch(JSON.parse(fs.readFileSync('stack.json'))['id']);
    message.reply(":books: `dc-dm-pins-limit-bypass:` " + stackMessage.url)
  }

  if (message.content == '/stacks') {
    // TODO: show stacks
  }
});

client.login(token);
