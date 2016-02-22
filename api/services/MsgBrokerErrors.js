'use strict';
module.exports = {
    //1
    //start tailing the 2016-01-31 file as a test
    /*
    StartTail: function() {
        var filelocation = "\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_"
        + "2016-02-21"
        + ".log";
        var tail = new Tail(filelocation,{});
        return tail;
    },
    */

    //2
    //drop any existing tail and start a new one with the current date
    UpdateErrors: function(para_ErrorObject) {
      console.log(para_ErrorObject);
      this.Obj = para_ErrorObject;
    },
    CheckSeverity: function(para_WholeMessage) {
      if (this.Obj === undefined) {
        return 4 //return default if object is not initialized yet
      }
      //loop the array
      for (var index = 0; index < this.Obj.length; index += 1) {
        //console.log("looping Error obj");
        if (para_WholeMessage.indexOf(this.Obj[index].instring) !== -1) {
          if (this.Obj[index].severity === 1) {
            console.log("P1 Warning: " + this.Obj[index].short_description);
          }
          return this.Obj[index].severity
        }
      }
      return 10 //return 10 for items not matched anywhere, should help identifying new messages
    }
};
