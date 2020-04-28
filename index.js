const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// import bot services
const {
  BotFrameworkAdapter,
  MemoryStorage,
  ConversationState,
  UserState
} = require('botbuilder');

// Import Dialog Bot class and Dialog class
const { DialogBot } = require('./bots/dialogBot');
const { MainDialog } = require('./dialogs/mainDialog');

// Import environment varaibles.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Create the HTTP server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`homeworkbot is listening on port ${PORT}`);
});

// Create adapter.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

// Define state store for bot.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog.
const dialog = new MainDialog(userState);
const bot = new DialogBot(conversationState, userState, dialog);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity(
    'To continue to run this bot, please fix the bot source code.'
  );

  // Clear out state
  await conversationState.delete(context);
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Listen for incoming requests.
app.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async context => {
    // Route to main dialog.
    await bot.run(context);
  });
});

// Listen for Upgrade requests for Streaming.
app.on('upgrade', (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
  });
  // Set onTurnError for the BotFrameworkAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  streamingAdapter.useWebSocket(req, socket, head, async context => {
    // After connecting via WebSocket, run this logic for every request sent over
    // the WebSocket connection.
    await bot.run(context);
  });
});
