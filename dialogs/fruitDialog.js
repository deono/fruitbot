/**
 * The FruitDialog asks the user questions about their prefered fruit.
 * Once the dialog is done it returns to MainDialog.
 */

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
const DRINK_PROMPT = 'DRINK_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const FRUIT_DIALOG = 'FRUIT_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class FruitDialog extends ComponentDialog {
  constructor(userState) {
    super(FRUIT_DIALOG);

    if (!userState)
      throw new Error(
        '[FruitDialog]: Missing parameter. userState is required'
      );

    this.userState = userState;

    // create waterfall steps & prompts
    this.addDialog(new ChoicePrompt(PREFERENCE_PROMPT));
    this.addDialog(new TextPrompt(STAND_APPART_PROMPT));
    this.addDialog(new ChoicePrompt(FAVORITE_PROMPT));
    this.addDialog(new TextPrompt(SPECIAL_PROMPT));
    this.addDialog(new ChoicePrompt(DRINK_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.preferenceStep.bind(this),
        this.standApartStep.bind(this),
        this.favoriteStep.bind(this),
        this.specialStep.bind(this),
        this.drinkStep.bind(this),
        this.finalStep.bind(this)
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async preferenceStep(step) {
    // retrieve the user's name from userState
    const {
      USER_PROFILE_PROPERTY: { name }
    } = await this.userState.get(step.context);

    return await step.prompt(PREFERENCE_PROMPT, {
      prompt: `Ok, ${name}. What do you prefer, apples or pears?`,
      choices: ChoiceFactory.toChoices(['Apples', 'Pears'])
    });
  }

  async standApartStep(step) {
    // retain the users preference in step.values
    step.values.preference = step.result;
    return await step.prompt(
      STAND_APPART_PROMPT,
      `Interesting. So what is it that makes ${step.values.preference.value.toLowerCase()} stand apart for you?`
    );
  }

  async favoriteStep(step) {
    step.values.standApart = step.result;
    // present correct choices based on prefered fruit option
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

  async drinkStep(step) {
    step.values.special = step.result;
    const choices =
      step.values.preference.value === 'Apples'
        ? ['Apple Juice', 'Appletini']
        : ['Pear Juice', 'Peartini'];

    return await step.prompt(FAVORITE_PROMPT, {
      prompt: `Ok. Which type of ${this.singular(
        step.values.preference.value
      )} drink do you prefer?`,
      choices: ChoiceFactory.toChoices(choices)
    });
  }

  async finalStep(step) {
    step.values.drink = step.result;
    const {
      preference,
      preferenceType,
      standApart,
      drink,
      special
    } = step.values;

    if (drink.value === 'Appletini' || drink.value === 'Peartini') {
      step.context.sendActivity('Shaken, not Stirred!');
    } else {
      step.context.sendActivity('A healthy option!');
    }

    // show a summary of the choices
    step.context.sendActivity(`Here's a summary of your choices: \n 
      Preferred fruit: ${preference.value} \n 
      Reason ${preference.value.toLowerCase()} stand apart: ${standApart} \n 
      Preferred type of ${this.singular(preference.value)}: ${
      preferenceType.value
    } \n 
      Reason ${preferenceType.value.toLowerCase()} ${preference.value.toLowerCase()} are special: ${special} \n 
      Preferred ${this.singular(preference.value)} drink: ${drink.value}
      `);

    return await step.endDialog();
  }

  // helper method: remove the last character from string
  singular(item) {
    return item.slice(0, item.length - 1).toLowerCase();
  }
}

module.exports.FRUIT_DIALOG = FRUIT_DIALOG;
module.exports.FruitDialog = FruitDialog;
