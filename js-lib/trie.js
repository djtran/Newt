//trie.js

const TRIE_JS = true;

function trieNode(bRoot, value, parent = null){
	this.bRoot = bRoot;
	this.value = value;
	this.word = null;
	this.parent = parent;
	this.children = [];

	this.getParent = function(){
		if(!bRoot)
		{
			return this.parentNode;
		}
	}
	this.addChild = function(value){
		var childNode = new trieNode(false, value, this);
		childNode.parentNode = this;
		this.children.push(childNode);
		return childNode;
	}
	this.getChild = function(value)
	{
		for(var i = 0; i < this.children.length; i++)
		{
			if(this.children[i].value === value)
			{
				return this.children[i];
			}
		}
		return null;
	}
	this.addWord = function(string, word){
		var child = this.getChild(string[0]);
		if(child === null)
		{
			child = this.addChild(string[0]);

			if(string.length < 2)
			{
				child.word = word;
				return;
			}
		}
		child.addWord(string.substr(1), word);
	}
	this.findNode = function(string)
	{
		var temp = this;
		for(var i = 0; i < string.length; i++)
		{
			temp = temp.getChild(string[i]);
			if(temp == null)
			{
				return null;
			}
		}
		return temp;
	}
	this.getAll = function()
	{
		var array = [];
		for(var i = 0; i < this.children.length; i++)
		{
			if(this.children[i].word != null)
			{
				array.push(this.children[i].word);
				console.log("GetAll: pushing " + this.children[i].word + " : array.length = " + array.length);
			}
			var array = array.concat(this.children[i].getAll());
		}

		return array;
	}

}