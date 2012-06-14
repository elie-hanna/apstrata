dojo.provide("apstrata.home.CatalogData")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")

dojo.declare("apstrata.home.CatalogData",
null, 
{
	scripts: [
		{icon: "savedQuery.png", name: "Database API"},
		{icon: "apple_128px.png", name: "Apple iCloud API"},
		{icon: "google_128px.png", name: "Google docs"},
		{icon: "mail.png", name: "Mail API"},
		{icon: "twitter_128px.png", name: "Twitter login"},
		{icon: "twitter_128px.png", name: "Twitter post"},
		{icon: "search.png", name: "FullText search API"},
		{icon: "behance_128px.png", name: "Behance post"},
		{icon: "lastfm_128px.png", name: "Last FM data"},
		{icon: "vimeo_128px.png", name: "Vimeo post"},
		{icon: "user-boss.png", name: "User management API"},
		{icon: "vimeo_128px.png", name: "Vimeo data"},
		{icon: "delicious_128px.png", name: "Delicious post"},
		{icon: "rss.png", name: "Create feed"},
		{icon: "linkedin_128px.png", name: "Linkedin post"},
		{icon: "digg_128px.png", name: "Digg post"},
		{icon: "youtube_128px.png", name: "Youtube data"},
		{icon: "youtube_128px.png", name: "Youtube post"},
		{icon: "facebook_128px.png", name: "Facebook status"},
		{icon: "facebook_128px.png", name: "Facebook query"},
		{icon: "facebook_128px.png", name: "Facebook photo"},
		{icon: "facebook_128px.png", name: "Facebook login"},
		{icon: "flickr_128px.png", name: "Flickr data"},
		{icon: "flickr_128px.png", name: "Flickr post"}
	],
	
	social: [
		{icon: "twitter_128px.png", name: "Twitter login", wikiDoc: "The+apsdb+object"},
		{icon: "twitter_128px.png", name: "Twitter post"},
	],
	
	apis: [ 
			{ name: "AddCertificate", apiType: "push notification", icon: "Push-AddCertificate" },
			{ name: "CreateChannel", apiType: "push notification", icon: "Push-CreateChannel" },
			{ name: "CreateStore", apiType: "persistence", icon: "Create" }, 

			{ name: "DeleteDocument", apiType: "persistence" }, 
			{ name: "DeleteGroup", apiType: "identity" }, 
			{ name: "DeleteSavedQuery", apiType: "persistence" }, 


			{ name: "DeleteSchema", apiType: "persistence" }, 
			{ name: "DeleteScript", apiType: "orchestration" }, 
			{ name: "DeleteStore", apiType: "persistence" }, 
			{ name: "DeleteToken", apiType: "identity" }, 
			{ name: "DeleteUser", apiType: "identity" }, 
			{ name: "GetChannel", apiType: "push notification" },
			{ name: "GetFile", apiType: "persistence" }, 
			{ name: "GetInvalidTokens", apiType: "push notification" },
			{ name: "GetSavedQuery", apiType: "persistence" }, 
			{ name: "GetSchema", apiType: "persistence" }, 
			{ name: "GetScript", apiType: "orchestration" }, 
			{ name: "GetScriptLogs", apiType: "orchestration" },
			{ name: "GetUser", apiType: "identity" }, 
			{ name: "ListConfiguration", apiType: "configuration" }, 
			{ name: "ListGroups", apiType: "identity" }, 
			{ name: "ListSavedQueries", apiType: "persistence" }, 
			{ name: "ListSchemas", apiType: "persistence" }, 
			{ name: "ListScripts", apiType: "orchestration" }, 
			{ name: "ListStores", apiType: "persistence" }, 
			{ name: "ListUsers", apiType: "identity" }, 
			{ name: "PushNotification", apiType: "push notification" },
			{ name: "Query", apiType: "persistence" }, 
			{ name: "RemoveCertificate", apiType: "push notification" },
			{ name: "RemoveChannel", apiType: "push notification" },
			{ name: "RunScript", apiType: "orchestration" }, 
			{ name: "SaveConfiguration", apiType: "configuration" }, 
			{ name: "SaveDocument", apiType: "persistence" }, 
			{ name: "SaveGroup", apiType: "identity" }, 
			{ name: "SaveQuery", apiType: "persistence" }, 
			{ name: "SaveSchema", apiType: "persistence" }, 
			{ name: "SaveScript", apiType: "orchestration" }, 
			{ name: "SaveUser", apiType: "identity" }, 
			{ name: "SendEmail", apiType: "messaging" }, 
			{ name: "SubscribeTokens", apiType: "push notification" },
			{ name: "TagTokensAsInvalid", apiType: "push notification" },
			{ name: "Transaction", apiType: "persistence" }, 
			{ name: "UnsubscribeTokens", apiType: "push notification" },
			{ name: "UpdateCertificate", apiType: "push notification" },
			{ name: "UpdateChannel", apiType: "push notification" },
			{ name: "VerifyCredentials", apiType: "identity" } 

		],
		
		widgets: [
			{ name: "Login", iconClass: "userManagement" }, 
			{ name: "Registration", iconClass: "userManagement" }, 
			//{ name: "User profile", iconClass: "userManagement" }, 
			//{ name: "Data form", iconClass: "form" }, 
			//{ name: "Data Grid", iconClass: "grid" }
		],
		
		sdks: [
			{ name: "Javascript SDK", iconClass: "userManagement", wikiDoc: "Javascript+SDK" }, 
			{ name: "Android SDK", iconClass: "userManagement", wikiDoc: "Android" }
		],
		
		addTags: function(object, tags) {
			var t
			var tagLabel = "tags"
			if (dojo.isArray(tags)) t = tags; else t=[tags]
			
			if (object[tagLabel]) {
				if (dojo.isArray(object[tagLabel])) object[tagLabel].push(t)
			} else {
				object[tagLabel] = t
			}
		},
		
		getServices: function() {
			var self = this
			var services = []
			
			var iconClasses = {
				userManagement: "user-boss.png",
				form: "survey.png",
				grid: "draft.png",
				persistence: "savedQuery.png",
				orchestration: "configuration.png",
				configuration: "configuration.png",
				identity: "user-boss.png",
				messaging: "mail.png",
				pushNotification: "alert.png"
			}
			
			var i = 0
			
			dojo.forEach(this.apis, function(api) {
/*				
				if (!api.icon) if (iconClasses[api.apiType]) {
					api.icon = iconClasses[api.apiType]
				} else {
					api.icon = "Peristence-CreateStore.png"
				}
*/					
				api.label = api.name
				api.type = "REST API"
				api.wikiDoc = api.name
				api.id = i++

				api.icon = "REST/" + api.name + ".png"			
				self.addTags(api, ["REST API", api.apiType])
				
				services.push(api)
			})			

			dojo.forEach(this.scripts, function(service) {
				service.label = service.name
				service.type = "script"
				service.id = i++
				
				self.addTags(service, "script")
				
				services.push(service)
			})			


			dojo.forEach(this.widgets, function(widget) {

				widget.icon = iconClasses[widget.iconClass]
				widget.label = widget.name
				widget.type = "widget"
				widget.id = i++

				self.addTags(widget, ["widget", "HTML5"])
				
				services.push(widget)
			})	
			
			dojo.forEach(this.sdks, function(sdk) {

				sdk.icon = iconClasses[sdk.iconClass]
				sdk.label = sdk.name
				sdk.type = "sdk"
				sdk.id = i++

				self.addTags(sdk, ["sdk", "mobile"])
				
				services.push(sdk)
			})				
			
			return services
		}
})