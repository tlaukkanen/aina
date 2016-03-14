var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.json');
var request = require('request');
var speak = require('speakeasy-nlp');

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
    var day = "10"; // now.getDate()<10 ? "0" + now.getDate() : "" + now.getDate();
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

bot.onText(/.*/, function(msg, match){
    var chatId = msg.chat.id;
   respond(msg, "ok", chatId); 
});

function respond(original, message, chatId) {
    var classify = speak.classify(original.text);
    var info = JSON.stringify(classify); // "action: " + classify.action + " owner=" + classify.owner + " subject=" + classify.subject;
    var sentiment = speak.sentiment.analyze(original.text);
    info += " sentiment: " + sentiment.score;
    bot.sendMessage(chatId, message + "\n" + info );               
}