"use strict";
var RiveScript = require('rivescript');
var personalityBot = new RiveScript();

function AinaBrain(config) {
    personalityBot.loadDirectory(config.riveScriptsDirectory)
    .then(() => {
        console.log('Personality loaded');
        personalityBot.sortReplies();
    }).catch(function(err, filename, lineno) {
        console.log('Error loading personality: ' + err);
    });
}

AinaBrain.prototype.getResponse = function(sentence) {
    return new Promise(function(resolve, reject) {
        personalityBot.reply("local-user", sentence)
        .then((reply) => {
            resolve(reply);
        });
    })
}

module.exports = AinaBrain;