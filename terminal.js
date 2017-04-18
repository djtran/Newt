function parser(consoleIn)
{
	var parseMe = consoleIn.split(' ');
	var command = parseMe[0];

	switch(command)
	{
		case "help":
			printhelp();
			break;
		case "cowsay":
			var cowPre = "&nbsp;&nbsp;&nbsp;&nbsp;______"
			break;
		case "ls":
			break;
		case "exit":
			chrome.tabs.getCurrent(function(tab) {
				chrome.tabs.remove(tab.id, function() { });
			});
			break;
		default:
			break;
	}
}

function printhelp()
{
	$(".history").append("Supported commands:<br>help<br>");
}

$("#prompt").keypress(function(e){
	if(e.which==13)
	{
		var parse = $("#prompt").val();
		$(".history").append($("#promptLabel").text() + parse + "<br>");
		$("#prompt").val("");

		//Parse the command here
		parser(parse);
	}
})