'use strict';
var FileTail = require('tail-forever');

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
    CheckTail: function() {
      if (Fn_SimpleTime("h") < 3 || Fn_SimpleTime("h") > 23) { // After 3:00 and before 23:00
        console.log("sleep while business does maint")
        return
        } else {
          var filelocation = "\\\\Tvgvprdds02\\tvg\\LogFiles\\MessageBroker_"
          + Fn_SimpleDate()
          + ".log"
          var tail = new FileTail(filelocation,{});
          return tail;
        }
    }
};


function Fn_SimpleDate() {
  var date_Obj;
  date_Obj = new Date();
    date_Obj.year = date_Obj.getFullYear();
    date_Obj.month = date_Obj.getMonth();
    date_Obj.month ++ //add one because January is 0
    if (date_Obj.month < 10) { //append "0" to the front if less than 10
        date_Obj.month = "0" + date_Obj.month
    }
    date_Obj.day = date_Obj.getDate();
    if (date_Obj.day < 10) { //append "0" to the front if less than 10
        date_Obj.day = "0" + date_Obj.day
    }
    //console.log("year: " + date_Obj.year);
    //console.log("month: " + date_Obj.month);
    //console.log("day: " + date_Obj.day);
    date_Obj.FullDate = date_Obj.year + "-"
        + date_Obj.month + "-"
        + date_Obj.day;

  return date_Obj.FullDate
}


function Fn_SimpleTime(para_option) {
    var date_Obj;
    date_Obj = new Date();
    if (para_option === "m") {
     return date_Obj.getMinutes();
    }
    if (para_option === "h") {

     return date_Obj.getHours();
    }
    return null;
}

function Fn_CheckValidDate(para_date) {
  if ("-" === Fn_QuickRegEx(para_date, "\d{4}-\d{2}(-)\d{2}")) {
    console.log("the date is valid")
    return true
  } else {
    return false
  }
}


function Fn_QuickRegEx(para_haystack, para_needle, para_number) {
    //define default 1
    //note: 1 value are in (). 0 is entire match
    para_number = typeof para_number !== 'undefined' ? para_number : 1;
    switch (typeof para_haystack) {
    case 'object':
      return null;
    case 'function':
      return null;
    default:
      para_haystack += "";
  }

    //pretty sure we have a string now. Create RegEx object and perform search
    var REG = new RegExp(para_needle);
    var REG_array = para_haystack.match(REG)
        //return null if no match found (no array was created)
        if (REG_array === null) {
            return null;
        }
    //grab the result we are interested in out of the array
    var REG_return = REG_array[para_number];

    //check if undefined or null and return accordingly
    if (REG_return === null || REG_return === undefined) {
        var REG_return = REG_array[para_number];
        return null;
    } else {
        return REG_return
    }
}
