/**
 * The MainDialog gets the users name and stores it in userState.
 * It then hands off to the FruitDialog.
 */

const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  TextPrompt
} = require('botbuilder-dialogs');
const { FruitDialog, FRUIT_DIALOG } = require('./fruitDialog');
const { UserProfile } = require('../userProfile');

const MAIN_DIALOG = 'MAIN_DIALOG';
const NAME_PROMPT = 'NAME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class MainDialog extends ComponentDialog {
  constructor(userState) {
    super(MAIN_DIALOG);

    if (!userState)
      throw new Error('[MainDialog]: Missing parameter. userState is required');

    this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
    this.userProfileAccessor = {};

    // create waterfall steps & prompts
    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new FruitDialog(userState));
    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.initialStep.bind(this),
        this.handOverStep.bind(this),
        this.finalStep.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */
  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async initialStep(step) {
    return await step.prompt(
      NAME_PROMPT,
      'Let me start by asking your name. So who am I talking to?'
    );
  }

  async handOverStep(step) {
    step.values.name = step.result;
    // Get the current profile object from user state.
    this.userProfileAccessor = await this.userProfile.get(
      step.context,
      new UserProfile()
    );
    // store the name in the user state
    this.userProfileAccessor.name = step.result;
    return await step.beginDialog(FRUIT_DIALOG, this.userProfileAccessor.name);
  }

  async finalStep(step) {
    await step.context.sendActivity(
      `Cool! Well lovely to meet you ${this.userProfileAccessor.name}. Have a great day. FruitBot signing off.`
    );

    await step.context.sendActivity('Type anything to start again.');

    return await step.endDialog();
  }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
