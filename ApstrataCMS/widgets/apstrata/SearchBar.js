dojo.provide("apstrata.extend.SearchBar")

dojo.require("apstrata.home.SearchBar")

dojo.declare("apstrata.extend.SearchBar",
[apstrata.home.SearchBar], 
{
	
	templatePath: dojo.moduleUrl("apstrata.extend", "templates/SearchBar.html")
		
})