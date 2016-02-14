'use strict';
var Tail = require('tail-forever');
var filelocation = "\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_"
+ "2016-01-31"
+ ".log";
var tail = new Tail(filelocation,{});
console.log("listening to today's messagebroker: " + filelocation);

module.exports = {
    //1
    //start tailing the 2016-01-31 file as a test
    StartTail: function() {
        var filelocation = "\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_"
        + "2016-02-01"
        + ".log";
        var tail = new Tail(filelocation,{});
        return tail;
    },


    //2
    //drop any existing tail and start a new one with the current date
    StartNewDate: function(para_newdate) {
        if (para_newdate !== undefined) {
            var filelocation = "\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_"
            + para_newdate
            + ".log"
            var tail = new Tail(filelocation,{});
            return tail;
        } else {
            console.log("could not watch " + para_newdate + "file");
            return undefined;
        }
    }
};
