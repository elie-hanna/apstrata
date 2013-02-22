dojo.provide("apstrata.touch.extend.SearchBar")

dojo.require("apstrata.home.SearchBar")

dojo.declare("apstrata.touch.extend.SearchBar",
[apstrata.home.SearchBar], 
{
	
	templatePath: dojo.moduleUrl("apstrata.touch.extend", "templates/SearchBar.html")
		
})