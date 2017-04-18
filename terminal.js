var cPink = "#F92672";
var cBlue = "#66D9EF";
var cGreen = "#A6E22E";
var cOrange = "#FD971F";

var commandBuf = [];
var currIndex = -1;

function parser(consoleIn)
{
	var parseMe = consoleIn.split(' ');
	var command = parseMe[0];

	switch(command)
	{
		case "clear":
			$(document.getElementById("history")).empty();
			break;
		case "hello":
			print("Hello, I'm " + colorPhrase("Newt", cGreen) + "! Thanks for trying me out!");
			break;
		case "help":
			print("Supported commands:<br>" + colorPhrase("hello help", cGreen) + "<br> In Progress:<br> " + colorPhrase("cowsay ls exit", cPink));
			break;
		case "cowsay":
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

function buffer(consoleIn)
{
	if(commandBuf.length > 20)
	{
		//if we have more than 20 saved, delete the first command
		commandBuf.shift();
	}
	//push onto end and save current command index.
	currIndex = commandBuf.push(consoleIn);
}
// Print to console helpers
function colorPhrase(phrase, colorHex)
{
	var colored = "<span style='color:" + colorHex + "'>" + phrase + "</span>";
	return colored;
}

function print(message)
{
	$(document.getElementById("history")).append(message + "<br>");
}

// Capture HID controls.
$(document.body).on("click", function(){
	$(document.getElementById("prompt")).focus();
})
$(document.getElementById("prompt")).keydown(function(e){
	console.log("Debug: " + e.which);
	var line = document.getElementById("prompt");
	if(e.which==13)			//Enter
	{
		var parse = $(line).val();
		$(document.getElementById("history")).append($("#promptLabel").text() + parse + "<br>");
		$(line).val("");

		//Parse the command here
		parser(parse);

		//Save command history
		buffer(parse);
	}
	else if(e.which==38)	// Up arrow
	{
		if(currIndex <= 0)
		{
			currIndex = 0;
			if(commandBuf.length >= 1)
			{
				$(line).val(commandBuf[currIndex]);
			}
		}
		else
		{
			currIndex--;
			$(line).val(commandBuf[currIndex]);
		}
	}
	else if(e.which==40)	//Down Arrow
	{
		if(currIndex >= commandBuf.length-1)
		{
			currIndex = commandBuf.length;
			$(line).val("");
		}
		else
		{
			currIndex++;
			$(line).val(commandBuf[currIndex]);
		}
	}
})