/**
 * MsgController
 *
 * @description :: Server-side logic for managing msgs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//setInterval(Fn_ApplyNewDate, 1000*60*5); //re-check the date every 5 mins (1000*60*5)

var fs = require("fs");

var CSV_File = fs.readFileSync("./assets/MsgBroker_Error_Index.csv");
CSV_File += ""; //convert to string
//fs.writeFile("./assets/alf.txt", "wrote to file");

var CSV = require('machinepack-csv');
CSV.parseCsv({
	csvData: CSV_File,
	schema: "*",
	hasHeaderRow: true,
}).exec({
	// An unexpected error occurred.
	error: function (err){
		console.log(err);
},
	// OK.
	success: function (data){
 		console.log("csv settings parsed sucessfully");
		MsgBrokerErrors.UpdateErrors(data); //send parsed CSV to MsgBrokerErrors service
},
});

var mytail = TailMsgBroker.CheckTail();
if (mytail !== undefined) {
	mytail.on("line", function(line) {
		//var Message_Obj = Fn_MessageSeverityGutCheck(line); //DEPRECIATED
		var Message_Obj ={};
		Message_Obj.RawMessage = line;
		Message_Obj.Severity = MsgBrokerErrors.CheckSeverity(Message_Obj.RawMessage);

		//only display messages to the user if they are FATAL or SEVERE
		if (Message_Obj.Severity === 1 || Message_Obj.Severity === 2) {
			console.log(Message_Obj.RawMessage);
			//SlackPost(Message_Obj.Message + ": " + Message_Obj.RawMessage);
		}
		if (Message_Obj.Severity === 3) {
			console.log(Message_Obj.Severity + ": " + Message_Obj.RawMessage);
		}
	});
	mytail.on("error", function(error) {
		console.log('ERROR with MessageBroker file: ', error);
		mytail.unwatch();
	});
}





function Fn_ReWatch() {
	var mytail = TailMsgBroker.CheckTail();
}

//Not used at the moment
function Fn_CheckDate() {
	var Datetime = require('machinepack-datetime');

	// Convert a JS timestamp and timezone into a human readable date/time.
	Datetime.format({
	timezone: 'America/los_angeles',
	formatString: 'YYYY-MM-DD', //2016-01-25
	}).exec({
	// An unexpected error occurred.
	error: function (err){
	},
	// Unrecognized timezone.
	unknownTimezone: function (){
	},
	// Could not build a date/time/zone from the provided timestamp.
	invalidDatetime: function (){
	},
	// OK.
	success: function (result){
		The_Date = result;
		Fn_ApplyNewDate();
	},
	});
}


function InStr(para_String, para_needle) {
	var Output = para_String.indexOf(para_needle);
	if (Output === -1) {
		return 0
	} else {
		return 1
	}
}





module.exports = {

};
