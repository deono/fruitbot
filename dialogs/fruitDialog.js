const {
  ComponentDialog,
  ChoicePrompt,
  ChoiceFactory,
  TextPrompt,
  WaterfallDialog
} = require('botbuilder-dialogs');

const PREFERENCE_PROMPT = 'PREFERENCE_PROMPT';
const STAND_APPART_PROMPT = 'STAND_APPART_PROMPT';
const FAVORITE_PROMPT = 'FAVORITE_PROMPT';
const SPECIAL_PROMPT = 'SPECIAL_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const FRUIT_DIALOG = 'FRUIT_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class FruitDialog extends ComponentDialog {
  constructor(userState) {
    super(FRUIT_DIALOG);

    this.userState = userState;
    console.log(userState);

    // create waterfall steps & prompts
    this.addDialog(new ChoicePrompt(PREFERENCE_PROMPT));
    this.addDialog(new TextPrompt(STAND_APPART_PROMPT));
    this.addDialog(new ChoicePrompt(FAVORITE_PROMPT));
    this.addDialog(new TextPrompt(SPECIAL_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.preferenceStep.bind(this),
        this.standApartStep.bind(this),
        this.favoriteStep.bind(this),
        this.specialStep.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async preferenceStep(step) {
    const {
      USER_PROFILE_PROPERTY: { name }
    } = await this.userState.get(step.context);
    console.log('name', name);

    return await step.prompt(PREFERENCE_PROMPT, {
      prompt: `Ok, ${name}. What do you prefer, apples or pears?`,
      choices: ChoiceFactory.toChoices(['Apples', 'Pears'])
    });
  }

  async standApartStep(step) {
    // retain the users preference
    step.values.preference = step.result;
    console.log('preference', step.values.preference.value);
    return await step.prompt(
      STAND_APPART_PROMPT,
      `Interesting. So what is it that makes ${step.values.preference.value.toLowerCase()} stand appart for you?`
    );
  }

  async favoriteStep(step) {
    const choices =
      step.values.preference.value === 'Apples'
        ? ['Gala', 'Fuji', 'Breaburn']
        : ['Forelle', 'Bosc', 'Bartlett'];
    return await step.prompt(FAVORITE_PROMPT, {
      prompt: `Ok. What type of ${this.singular(
        step.values.preference.value
      )} is your favorite?`,
      choices: ChoiceFactory.toChoices(choices)
    });
  }

  async specialStep(step) {
    step.values.preferenceType = step.result;
    return await step.prompt(
      SPECIAL_PROMPT,
      `Nice! What makes the ${step.values.preferenceType.value} ${this.singular(
        step.values.preference.value
      )} so special?`
    );
  }

  // async finalStep(step) {
  //   await step.context.sendActivity(
  //     `Cool! Well lovely to meet you ${this.userProfileAccessor.name}. Have a great day. FruitBot signing off.`
  //   );

  //   return await step.endDialog();
  // }

  singular(item) {
    return item.slice(0, item.length - 1).toLowerCase();
  }
}

module.exports.FRUIT_DIALOG = FRUIT_DIALOG;
module.exports.FruitDialog = FruitDialog;
