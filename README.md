# FruitBot

Chatbot created Microsoft Bot Framework

## Prerequisites

- [Node.js](https://nodejs.org) version 10.14 or higher

  ```bash
  # determine node version
  node -v
  ```

## To test this app

- Clone the repository into a directory

  ```bash
  git clone https://github.com/deono/homeworkbot
  ```

- In a terminal, navigate to the directory

- Install modules

  ```bash
  npm install
  ```

- Start the bot

  ```bash
  npm start
  ```

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.3.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:5000/api/messages`
