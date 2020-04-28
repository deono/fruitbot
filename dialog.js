const {
  DialogSet,
  ComponentDialog,
  ChoicePrompt,
  ChoiceFactory,
  TextPrompt,
  WaterfallDialog,
  DialogTurnStatus
} = require('botbuilder-dialogs');
const { UserProfile } = require('./userProfile');

const USER_PROFILE = 'USER_PROFILE';
const NAME_PROMPT = 'NAME_PROMPT';
const PREFERENCE_PROMPT = 'PREFERENCE_PROMPT';
const STAND_APPART_PROMPT = 'STAND_APPART_PROMPT';
const FAVORITE_PROMPT = 'FAVORITE_PROMPT';
const SPECIAL_PROMPT = 'SPECIAL_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class Dialog extends ComponentDialog {
  constructor(userState) {
    super('dialog');

    this.userProfile = userState.createProperty(USER_PROFILE);
    this.userProfileAccessor = {};

    // create waterfall steps & prompts
    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new ChoicePrompt(PREFERENCE_PROMPT));
    this.addDialog(new TextPrompt(STAND_APPART_PROMPT));
    this.addDialog(new ChoicePrompt(FAVORITE_PROMPT));
    this.addDialog(new TextPrompt(SPECIAL_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.nameStep.bind(this),
        this.preferenceStep.bind(this),
        this.standApartStep.bind(this),
        this.favoriteStep.bind(this),
        this.specialStep.bind(this),
        this.finalStep.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  // helper method to create and access the dialog context
  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    // create dialog context to interact with the dialog set
    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  async nameStep(step) {
    return await step.prompt(
      NAME_PROMPT,
      'Let me start by asking your name. So who am I talking to?'
    );
  }

  async preferenceStep(step) {
    // TODO: might not be necesary to set step.values for this usecase
    step.values.name = step.result;
    // Get the current profile object from user state.
    this.userProfileAccessor = await this.userProfile.get(
      step.context,
      new UserProfile()
    );
    // store the name in the user state
    this.userProfileAccessor.name = step.result;
    return await step.prompt(PREFERENCE_PROMPT, {
      prompt: `Ok, ${step.values.name}. What do you prefer, apples or pears?`,
      choices: ChoiceFactory.toChoices(['Apples', 'Pears'])
    });
  }

  async standApartStep(step) {
    // retain the users preference
    step.values.preference = step.result;
    console.log('preference', step.values.preference.value);
    return await step.prompt(
      STAND_APPART_PROMPT,
      `Interesting. So what is it that makes ${step.values.preference.value} stand appart for you?`
    );
  }

  async favoriteStep(step) {
    const choices =
      step.values.preference.value === 'Apples'
        ? ['Gala', 'Fuji', 'Breaburn']
        : ['Forelle', 'Bosc', 'Bartlett'];
    return await step.prompt(FAVORITE_PROMPT, {
      prompt: `Ok. What type of ${step.values.preference.value} is your favorite?`,
      choices: ChoiceFactory.toChoices(choices)
    });
  }

  async specialStep(step) {
    step.values.preferenceType = step.result;
    return await step.prompt(
      SPECIAL_PROMPT,
      `Nice! What makes the ${step.values.preferenceType.value} ${step.values.preference.value} so special?`
    );
  }

  async finalStep(step) {
    await step.context.sendActivity(
      `Cool! Well lovely to meet you ${this.userProfileAccessor.name}. Have a great day. FruitBot signing off.`
    );

    return await step.endDialog();
  }
}

module.exports.Dialog = Dialog;
