dojo.provide("apstrata.cms.ApplicationsGrid");
dojo.require("amc.listing.ApplicationsGrid");

dojo.declare("apstrata.cms.ApplicationsGrid", 
[amc.listing.ApplicationsGrid], 
{
	switchStructureList: [[
			{ name: 'Name', field: 'appName', editable: 'false', width: 'auto' },
			{ name:'Id', field:'appId', editable: 'false', width: 'auto' },
			{ name:'Key', field: 'authKey', editable: 'false', width: 'auto' },
			{ name:'Secret', field: 'secret', editable: 'false', width: 'auto' , formatter: formatKeySecret },
			{ name:'Workbench', field: 'secret', editable: 'false', width: 'auto', formatter: workbenchLink },
//			{ name:'Number of API Calls', field: 'appName', editable: 'false', width: 'auto' },
			{ name:'Total Billed', field: 'totalBilled', editable: 'false', width: 'auto', formatter: formatDecimal },
			{ name:'Total Transactions', field: 'totalTransactions', editable: 'false', width: 'auto' },
			{ name:'Total Users', field: 'totalUsers', editable: 'false', width: 'auto' },
			{ name:'Creation Date', field: 'creationDate', editable: 'false', width: 'auto', formatter: formatDate }
		]],
	          
   	
   	switchFieldTypes: {
   		rootKey: "string",
   		email: "string",
   		login: "string",
   		appName: "string",
   		authKey: "string",
   		creationDate: "string",
   		secret: "string",
   		totalTransactions: "string",
   		totalBilled: "string",
   		totalUsers: "string"
   	},
   	
	switchQueryFields: "rootKey, email, login, appName, authKey, creationDate, secret, appId, totalTransactions, totalBilled, totalUsers",
});