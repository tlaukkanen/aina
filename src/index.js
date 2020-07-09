"use strict";

var TelegramBot = require('node-telegram-bot-api');
var config = require('./../config.json');
var AinaBrain = require('./brain.js');
var brain = new AinaBrain(config);

function getDateStamp() {
  var now = new Date();
  var month = (now.getUTCMonth() + 1) < 10 ? "0" + now.getUTCMonth() + 1 : "" + now.getUTCMonth();
  var day = now.getUTCDate() < 10 ? "0" + now.getUTCDate() : "" + now.getUTCDate();
  var hours = now.getUTCHours() < 10 ? "0" + now.getUTCHours() : "" + now.getUTCHours();
  var minutes = now.getUTCMinutes() < 10 ? "0" + now.getUTCMinutes() : "" + now.getUTCMinutes();
  var stamp = "" + now.getUTCFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes;
  return stamp;
}

var options = {
  polling: true
};

var token = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

var bot = new TelegramBot(token, options);
bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});

bot.onText(/\/echo (.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  var resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/shutdown/, function (msg, match) {
  var chatId = msg.chat.id;
  respond(msg, "Shutting down", chatId);
  setTimeout(function () {
    process.exit();
  }, 1000);
})

bot.onText(/.*/, function (msg, match) {
  var chatId = msg.chat.id;
  brain.getResponse(msg.text)
  .then((response) => {
    respond(msg, response, chatId);
  });
});

function respond(original, message, chatId) {
  bot.sendMessage(chatId, message);
}
