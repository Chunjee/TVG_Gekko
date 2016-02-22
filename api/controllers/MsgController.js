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








function Fn_MessageSeverityGutCheck(para_Input) {
	var Output_Obj = {};
	Output_Obj.RawMessage = para_Input;

	//1 - Fatal; sites are totally down or impacting some percentage of wagers
	if (InStr(para_Input,"may have hung")) {
		Output_Obj.Severity = 1;
		Output_Obj.Message = "DataService needs to be checked";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Fatal"
	}
	if (InStr(para_Input,"Error getting account balance") || InStr(para_Input,"Window NoTote")) {
		Output_Obj.Severity = 1;
		Output_Obj.Message = "Tote windows are down";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RC+-33+error+message+on+DDS+TIP+down+procedures"
	}

	//2 - Severe; errors impact the customer and should be solved as soon as possible
	if (InStr(para_Input,"Could not find server")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "DBA issue";
		Output_Obj.documentation = ""
	}
	if (InStr(para_Input,"RPC server is unavailable")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "Restart the effected server";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/RPC+server+is+unavailable"
	}
	if (InStr(para_Input,"Dialogic")) {
		Output_Obj.Severity = 2;
		Output_Obj.Message = "IVR has missing pool or other Dialogic error";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/IVR+Dialogic+Error"
	}

	//3 - Warnings; require some action be taken at some point, but have little to no impact
	if (InStr(para_Input,"Truncation errors")) {
		Output_Obj.Severity = 3;
		Output_Obj.Message = "please start the log service at your convenience";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/String+Data+Right+Truncation+errors+on+DDS"
	}
	if (InStr(para_Input,"Finisher data contains shared betting interest:")) {
		Output_Obj.Severity = 3;
		Output_Obj.Message = "Coupled Entry just placed in a race";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Warning"
	}

	//4 - Informational; totally normal operational messages
	if (InStr(para_Input,"Payment type not bound")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "everything is good";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Update Race where")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "X track with Y abbreviation for Z day has an invalid time format";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Invalid+Time+Format+Error"
	}
	if (InStr(para_Input,"Error in Automated Bet Reviewer")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "???";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Results  are  final")) { //for some reason they had two spaces
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Race just went official";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"unreconciled bets selected")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "BOP is working on reconciling bets";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Opening new account")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "new account created";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Creating tote account")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Customers account was created at Tote";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"A horse was scratched")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A horse was scratched";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"A horse was livened")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A horse was livened";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"The race has closed")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "A race just closed";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Data has been parsed for Track")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "track is not available via Gatewayl; typically OK"; //might need more research on this one
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"now available via the SGRGateway")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Track just became available over the SGRGateway";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Message Monitor")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Someone has connected to the messagebroker with messagemonitor";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"ThreadStart()")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "a new thread entered from the DataCollector";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"TMS starting up")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "TMS is starting";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"Track Abbreviation not found")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "Track not found in"; //usually fine
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"The callback connection to")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "callback exception has ended";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}
	if (InStr(para_Input,"EINVALIDPIN")) {
		Output_Obj.Severity = 4;
		Output_Obj.Message = "User input wrong PIN";
		Output_Obj.documentation = "http://confluence.tvg.com/display/wog/Index+of+Message+Monitor+Errors#IndexofMessageMonitorErrors-Informational"
	}



	//if this messagetype has never been encountered
	if (Output_Obj.Severity === undefined) {
		Output_Obj.Severity = 3;
		Output_Obj.Message = "unhandled message type:" + Output_Obj.RawMessage;
	}

	//give back the Output_Obj
	return Output_Obj;
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
