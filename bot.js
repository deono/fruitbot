// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

class HomeworkBot extends ActivityHandler {
  constructor(conversationState, userState) {
    super();

    // Create the state property accessors for the conversation data and user profile.
    this.conversationDataAccessor = conversationState.createProperty(
      CONVERSATION_DATA_PROPERTY
    );
    this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

    // The state management objects for the conversation and user state.
    this.conversationState = conversationState;
    this.userState = userState;

    this.onMessage(async (context, next) => {
      // get state properties from turn context
      const userProfile = await this.userProfileAccessor.get(context, {});
      const conversationData = await this.conversationDataAccessor.get(
        context,
        { promptedForUserName: false }
      );

      if (!userProfile.name) {
        // if undefined, propmt user for name
        if (conversationData.promptedForUserName) {
          // set name to provided user input
          userProfile.name = context.activity.text;

          // acknowledge to the user that name was received
          await context.sendActivity(
            `Ok ${userProfile.name}.  What do you prefer? Apples or Pears?`
          );

          // reset the flag to allow bot go through the cycle again
          conversationData.promptedForUserName = false;
        } else {
          //propmt the user for their name
          await context.sendActivity(
            'Let me start by asking your name. So who am I talking to?'
          );

          // set the flag to true, so we dont prompt again
          conversationData.promptedForUserName = true;
        }
      } else {
        // add message details to the conversation data
        conversationData.timestamp = context.activity.timestamp.toLocaleString();
        conversationData.channelId = context.activity.channelId;

        // display the state data
        await context.sendActivity(
          `${userProfile.name} sent ${context.activity.text}`
        );
        await context.sendActivity(
          `Message received at ${conversationData.timestamp}`
        );

        await context.sendActivity(
          `Message received from ${conversationData.channelId}`
        );
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText =
        "Hi! I'm FruitBot. Nice to meet you. Type anything to continue.";
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(welcomeText, welcomeText)
          );
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  async run(context) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}

module.exports.HomeworkBot = HomeworkBot;
