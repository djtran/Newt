var cPink = "#F92672";
var cBlue = "#66D9EF";
var cGreen = "#A6E22E";
var cOrange = "#FD971F";

const commandList = ["cd", "clear", "cowsay", "exit", "hello", "help", "ls", "nav"];
var commandTrie, autocompleteTrie;

var commandBuf = [];
var currIndex = -1;

var currFolder = null;


//////////////////////////////////////
//			Prompt Parsing			//
//////////////////////////////////////
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
		print("Supported commands:<br>" + colorPhrase("cd clear exit hello help ls nav", cGreen) + "<br> In Progress:<br> " + colorPhrase("cowsay ps vi", cPink));
		break;
		case "cowsay":
		print("<pre>" + " 	")
		break;

		case "cd":
		changeDirectory(parseMe);
		break;

		case "ls":
		listDirectory();
		break;

		case "nav":
		navigate(parseMe);
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

function autocomplete(consoleIn)
{
	var parse = consoleIn.split(' ');
	var completeMe = parse[parse.length-1];
	if(completeMe[0] == "-")	//option
	{
		//Check the command
		//Check the options
		//Finish the option or print list of possible completions
	}
	else
	{
		//Check possible commands
		var commandNode = commandTrie.findNode(completeMe);
		if(commandNode != null)
		{
			var cmds = commandNode.getAll();
			if(cmds.length === 1)
			{
				parse[parse.length-1] = cmds[0];
				$(document.getElementById("prompt")).val(parse.join(" "));
				return;
			}
			else
			{
				print(colorPhrase(getPrompt(), cOrange) + $(document.getElementById("prompt")).val());
				for(var i = 0; i < cmds.length; i++)
				{
					print(cmds[i]);
				}
			}
		}

		//Finish command or print list of possible completions.
		var node = autocompleteTrie.findNode(completeMe);
		if(node != null)
		{
			var printOut = node.getAll();
			if(printOut.length === 1)
			{
				parse[parse.length-1] = printOut[0];
				$(document.getElementById("prompt")).val(parse.join(" "));
			}
			else
			{
				print(colorPhrase(getPrompt(), cOrange) + $(document.getElementById("prompt")).val());
				for(var i = 0; i < printOut.length; i++)
				{
					print(printOut[i]); 
				}
			}
		}
	}
}


//////////////////////////////////////////////////////
// 				Print to console helpers			//
//////////////////////////////////////////////////////

function colorPhrase(phrase, colorHex)
{
	var colored = "<span style='color:" + colorHex + "'>" + phrase + "</span>";
	return colored;
}

function print(message)
{
	$(document.getElementById("history")).append(message + "<br>");
}

function getPrompt()
{
	return $(document.getElementById("promptLabel")).text();
}


//////////////////////////////////////////////
// 			Capture HID controls.			//
//////////////////////////////////////////////
$(document).on("mousedown", function(evt){

	$(document).on("mouseup", function(upEvt){
		var dX = (evt.pageX- upEvt.pageX);
		var dY = (evt.pageY - upEvt.pageY);
		if(Math.sqrt(dX*dX + dY*dY) < 5)
		{
			$(document.getElementById("prompt")).focus();
		}
	});
});
$(document.getElementById("prompt")).keydown(function(e){

	var line = document.getElementById("prompt");
	if(e.which==9)					//Tab
	{
		e.preventDefault();	
		if($(line).val().length === 0)
		{
			return;
		}
		autocomplete($(line).val());
	}
	else if(e.which==13)			//Enter
	{
		var parse = $(line).val();
		$(document.getElementById("history")).append(colorPhrase(getPrompt(), cOrange) + parse + "<br>");
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

//////////////////////////////////////
//				Functions			//
//////////////////////////////////////

function changeDirectory(parseMe)
{
	var temp;
	if(parseMe.length < 2)
	{
		return;
	}
	var directory = parseMe[1];
	var sanitized = directory.replace(/_/g, " ");

	if(sanitized === "..")
	{
		if(currFolder.parentId)
		{
			chrome.bookmarks.get(currFolder.parentId, function(result){
				currFolder = result;
				rebuildACTrie();
			});
		}	
	}
	else
	{

		if(!currFolder)
		{
			currFolder = new Object({id:'0'});
		}

		chrome.bookmarks.getSubTree(currFolder.id, function(arrayResult){
			for(var i = 0; i < arrayResult[0].children.length; i++)
			{
				temp = arrayResult[0].children[i];
				if(temp.title === directory || temp.title === sanitized)
				{
					if(temp.url == null)
					{
						currFolder = temp;
						temp = true;
						rebuildACTrie();
					}
					else
					{
						print(directory + ": Not a directory");
					}
					break;			
				}
			}
			if(temp != true)
			{
				print(directory + ": No such file or directory");
			}
		});
	}
}

function listDirectory()
{
	var temp; 
	if(!currFolder)
	{
		currFolder = new Object({id:'0'});
	}
	var buffer = [];
	chrome.bookmarks.getSubTree(currFolder.id, function(arrayResult){
		for(var i = 0; i < arrayResult[0].children.length; i++)
		{
			temp = arrayResult[0].children[i];
			if(temp.url == null)
			{
				print(colorPhrase(temp.title.replace(/\s/g, "_"),cGreen) + " ");
			}
			else
			{
				print(temp.title.replace(/\s/g, "_") + " ")
			}
		}
	});
}

function navigate(parseMe)
{
	if(parseMe.length < 2)
	{
		return;
	}
	var string = parseMe[1];

	if(!currFolder)
	{
		currFolder = new Object({id:'0'});
	}
	if(autocompleteTrie.findNode(string))
	{
		chrome.bookmarks.getSubTree(currFolder.id, function(arrayResult)
		{
			for(var i = 0; i < arrayResult[0].children.length;i++)
			{
				var item = arrayResult[0].children[i];
				if(item.title === string.replace(/_/g, " "))
				{
					if(item.url != null)
					{
						chrome.tabs.update({
							url: item.url
						});
					}
				}
			}
		});
		print(string + ": Not a bookmark");
	}
	else
	{
		if(string.includes("http"))
		{
			chrome.tabs.update({
				url: string
			});
		}
		else
		{
			chrome.tabs.update({
				url:("http://"+string)
			});
		}
	}
	
}

function rebuildACTrie()
{
	autocompleteTrie = new trieNode(true, null);
	if(!currFolder)
	{
		currFolder = new Object({id:'0'});
		
	}
	chrome.bookmarks.getSubTree(currFolder.id, function(arrayResult){
		for(var i = 0; i < arrayResult[0].children.length; i++)
		{
			var title = arrayResult[0].children[i].title.replace(/\s/g, "_");
			autocompleteTrie.addWord(title, title);
		}
	});
}

//build autocomplete tries.
$(document).ready(function(){
	try{
		if((TRIE_JS && LOAD_JS))
		{
			commandTrie = new trieNode(true, null);
			for(var i = 0; i < commandList.length; i++)
			{
				commandTrie.addWord(commandList[i], commandList[i]);
			}

			rebuildACTrie();
		}
	} 
	catch (err)
	{
		print("Your installation of Newt is corrupted. You may continue, but please be aware that not all functionality will be available to you. Please reinstall the extension for the best experience. Thank you for trying " + colorPhrase("Newt!", cGreen));
	}

})