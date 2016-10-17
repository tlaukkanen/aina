"use strict";
var RiveScript = require('rivescript');

var BrainJSClassifier = require('natural-brain');
var classifier = new BrainJSClassifier();
var personalityBot = new RiveScript();

function AinaBrain(config) {
    // food
    classifier.addDocument('what is in the lunch menu?', 'food');
    classifier.addDocument('i am hungry.', 'food');
    classifier.addDocument('what do they serve in restaurant downstairs?', 'food');

    // weather
    classifier.addDocument('how is the weather?', 'weather');
    classifier.addDocument('does it rain tomorrow?', 'weather');
    classifier.addDocument('how is the temperature indoors?', 'weather');

    // coding
    classifier.addDocument('how to code loop with javascript?', 'coding');
    classifier.addDocument('how to run ecma script 6 with node.js?', 'coding');
    classifier.addDocument('how to troubleshoot memory leak on java application?', 'coding');
    classifier.addDocument('i think javascript is better than java.', 'coding');

    // linux
    classifier.addDocument('how to check disk space on linux?', 'linux');
    classifier.addDocument('how to list directories with bash?', 'linux');

    // movies
    classifier.addDocument('what is a good movie?', 'movies');
    classifier.addDocument('who is the best actor?', 'movies');
    classifier.addDocument('any good movies to suggest?', 'movies');

    // music
    classifier.addDocument('who plays this song?', 'music');
    classifier.addDocument('what is your favourite band?', 'music');
    classifier.addDocument('what songs are on that album?', 'music');

    // books
    classifier.addDocument('who wrote this book?', 'books');
    classifier.addDocument('what is your favourite author?', 'books');
    classifier.addDocument('what books do you like?', 'books');    

    classifier.train();

    personalityBot.loadDirectory(config.riveScriptsDirectory, personalityLoadingDone, personalityLoadingError)
}

function personalityLoadingDone(files) {
    console.log('Personality loaded');
    personalityBot.sortReplies();
}

function personalityLoadingError(files, error) {
    console.log('Error loading personality: ' + error);
}


AinaBrain.prototype.classify = function(sentence) {
    return classifier.classify( sentence );
}

AinaBrain.prototype.getResponse = function(sentence) {
    return personalityBot.reply("local-user", sentence);
}

module.exports = AinaBrain;