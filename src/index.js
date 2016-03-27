"use strict";

var TelegramBot = require('node-telegram-bot-api');
var config = require('./../config.json');
var request = require('request');
var speak = require('speakeasy-nlp');
if(config.enableTemperature) {
    var sensorLib = require('node-dht-sensor');
}
var AinaBrain = require('./brain.js');
var brain = new AinaBrain();
var latestReadout = 0;
var latestHumidity = 0;
var schedule = require('node-schedule');
var loki = require('lokijs');
var db = new loki('loki.json');
db.addCollection('temperatures', {indices:['date']});

if(config.enableTemperature) {

    var sensor = {
        initialize: function () {
            return sensorLib.initialize(11, 4);
        },
        read: function () {
            var readout = sensorLib.read();
        latestReadout = readout.temperature.toFixed(3);
        latestHumidity = readout.humidity.toFixed(3);
            console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
                'humidity: ' + readout.humidity.toFixed(2) + '%');
            setTimeout(function () {
                sensor.read();
            }, 60000);
        }
    };

    if (sensor.initialize()) {
        sensor.read();
    } else {
        console.warn('Failed to initialize sensor');
    }
}

function getDateStamp() {
    var now = new Date();
    var month = (now.getUTCMonth() + 1)<10 ? "0" + now.getUTCMonth()+1 : "" + now.getUTCMonth();
    var day = now.getUTCDate()<10 ? "0" + now.getUTCDate() : "" + now.getUTCDate();
    var hours = now.getUTCHours()<10 ? "0" + now.getUTCHours() : "" + now.getUTCHours();
    var minutes = now.getUTCMinutes()<10 ? "0" + now.getUTCMinutes() : "" + now.getUTCMinutes();
    var stamp = "" + now.getUTCFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes;
    return stamp;
}

var tempSchedule = schedule.scheduleJob('0 0 * * * *', function(){
    console.log("schedule ping: " + new Date().getUTCHours());
    var now = new Date();
    
    var key = now.getUTCFullYear() + (now.getUTCMonth()+1)
    var row = {
        date: getDateStamp(),
        temperature: latestReadout,
        humidity: latestHumidity
    }
    db.insert(row);
    db.save();
    console.log("to loki: " + JSON.stringify(row));
});

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

bot.onText(/.*what.*lunch.*\?/, function(msg, match) {
    var chatId = msg.chat.id;
    var now = new Date();
    var year = now.getFullYear();
    var month = (now.getMonth()+1)<10 ? "0" + (now.getMonth()+1) : "" + (now.getMonth()+1);
    var day = now.getDate()<10 ? "0" + now.getDate() : "" + now.getDate();
    request.get("http://www.sodexo.fi/ruokalistat/output/daily_json/134/"+year+"/"+month+"/"+day+"/fi",
        function(err, resp, body) {
            console.log("response: " + JSON.stringify(body));
            var list = "";
            var courses = JSON.parse(body).courses;
            for(var i in courses) {
                list += "- " + courses[i].title_fi + "\n";
            }
            respond(msg, "Downstairs menu:\n" + list, chatId);               
        }
    );
});

bot.onText(/\/shutdown/, function(msg, match){
   var chatId = msg.chat.id;
   respond(msg, "Shutting down", chatId);
   setTimeout(function(){
       process.exit();
   }, 1000);     
})

bot.onText(/.*/, function(msg, match){
    var chatId = msg.chat.id;
   respond(msg, "ok", chatId); 
});

function respond(original, message, chatId) {
    var classify = speak.classify(original.text);
    var topic = brain.classify(original.text);
    var info = JSON.stringify(classify); // "action: " + classify.action + " owner=" + classify.owner + " subject=" + classify.subject;
    var sentiment = speak.sentiment.analyze(original.text);
    info += " sentiment: " + sentiment.score;
    info += " topic: " + topic;
    info += "\ntemp: " + latestReadout + "'C humidity: " + latestHumidity + "%";
    bot.sendMessage(chatId, message + "\n" + info );               
}
