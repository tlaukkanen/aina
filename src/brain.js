"use strict";

var BrainJSClassifier = require('natural-brain');
var classifier = new BrainJSClassifier();

function AinaBrain() {
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

    classifier.train();
}

AinaBrain.prototype.classify = function(sentence) {
    return classifier.classify( sentence );
}

module.exports = AinaBrain;