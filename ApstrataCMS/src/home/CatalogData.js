dojo.provide("apstrata.home.CatalogData")

dojo.require("dojox.dtl._Templated")
dojo.require("dojo.store.Memory")

dojo.declare("apstrata.home.CatalogData",
null, 
{
	scripts: [
		{icon: "DatabaseAPI.png", name: "Database API"},
		{icon: "AppleICloudAPI.png", name: "Apple iCloud API"},
		{icon: "GoogleDocs.png", name: "Google docs"},
		{icon: "MailAPI.png", name: "Mail API"},
		{icon: "FullTextSearchAPI.png", name: "FullText search API"},
		{icon: "behance_128px.png", name: "Behance post"},
		{icon: "lastfm_128px.png", name: "Last FM data"},
		{icon: "vimeo_128px.png", name: "Vimeo post"},
		{icon: "UserManagementAPI.png", name: "User management API"},
		{icon: "vimeo_128px.png", name: "Vimeo data"},
		{icon: "delicious_128px.png", name: "Delicious post"},
		{icon: "rss.png", name: "Create feed"},
		{icon: "linkedin_128px.png", name: "Linkedin post"},
		{icon: "digg_128px.png", name: "Digg post"},
		{icon: "YoutubeData.png", name: "Youtube data"},
		{icon: "YoutubePost.png", name: "Youtube post"},
		{icon: "FacebookStatus.png", name: "Facebook status"},
		{icon: "FacebookQuery.png", name: "Facebook query"},
		{icon: "FacebookPhoto.png", name: "Facebook photo"},
		{icon: "FacebookLogin.png", name: "Facebook login"},
		{icon: "flickr_128px.png", name: "Flickr data"},
		{icon: "flickr_128px.png", name: "Flickr post"}
	],
	
	social: [
	 	{icon: "TwitterLogin.png", name: "Twitter Login", wikiDoc: "Twitter"},
		{icon: "TwitterTimeline.png", name: "Twitter TimeLine", wikiDoc: "Twitter"},
		{icon: "TwitterPost.png", name: "Twitter Post", wikiDoc: "Twitter"},
		{icon: "FacebookLogin.png", name: "Facebook Login", wikiDoc: "Facebook"},
		{icon: "Facebook.png", name: "Facebook", wikiDoc: "Facebook"},
		{icon: "LinkedinLogin.png", name: "LinkedIn Login", wikiDoc: "LinkedIn"},
		{icon: "Linkedin.png", name: "LinkedIn", wikiDoc: "LinkedIn"},
		{icon: "google_128px.png", name: "Google", wikiDoc: "Google"},
		{icon: "youtube_128px.png", name: "YouTube", wikiDoc: "Google"}
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
			{ icon: "Login.png", name: "Login", iconClass: "userManagement" }, 
			{ icon: "Registration.png", name: "Registration", iconClass: "userManagement" }, 
			//{ name: "User profile", iconClass: "userManagement" }, 
			//{ name: "Data form", iconClass: "form" }, 
			//{ name: "Data Grid", iconClass: "grid" }
		],
		
		sdks: [
			{ name: "Javascript SDK", iconClass: "userManagement", wikiDoc: "Javascript+SDK", tryIt: "false", getSampleCode: "false" }, 
			{ name: "Android SDK", iconClass: "userManagement", wikiDoc: "Android", tryIt: "false", getSampleCode: "false" }
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
				pushNotification: "alert.png",
				social: "social.png"
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
				if (!api.wikiDoc) api.wikiDoc = api.name
				api.id = i++

				api.icon = "REST/" + api.name + ".png"			
				self.addTags(api, ["REST API", api.apiType])
				
				services.push(api)
			})			

			dojo.forEach(this.scripts, function(service) {
				
				if (!service.icon) {
					service.icon = iconClasses[service.iconClass]
				}else {
					service.icon = "/Scripts/" + service.icon;
				}
				service.label = service.name
				service.type = "script"
				if (!service.wikiDoc) service.wikiDoc = service.name
				service.id = i++
				
				self.addTags(service, "script")
				
				services.push(service)
			})			


			dojo.forEach(this.widgets, function(widget) {

				if (!widget.icon) {
					widget.icon = iconClasses[widget.iconClass]
				}else {
					widget.icon = "/Widgets/" + widget.icon;
				}
				widget.label = widget.name
				widget.type = "widget"
				if (!widget.wikiDoc) widget.wikiDoc = widget.name
				widget.id = i++

				self.addTags(widget, ["widget", "HTML5"])
				
				services.push(widget)
			})		
			
			dojo.forEach(this.sdks, function(sdk) {

				sdk.icon = iconClasses[sdk.iconClass]
				sdk.label = sdk.name
				sdk.type = "sdk"
				if (!sdk.wikiDoc) sdk.wikiDoc = sdk.name
				sdk.id = i++

				self.addTags(sdk, ["sdk", "mobile"])
				
				services.push(sdk)
			})	
			
			dojo.forEach(this.social, function(network) {
				var iconClass = network.iconClass;
				if(!network.iconClass){
					iconClass = "social";
				}
				if (!network.icon) {
					network.icon = iconClasses[iconClass];
				}else  {
					network.icon = "/Social/" + network.icon;
				}
				network.label = network.name;
				network.type = "social";
				if (!network.wikiDoc) network.wikiDoc = network.name
				network.id = i++;

				self.addTags(network, ["social", "HTML5"]);
				
				services.push(network);
			})	
			
			return services
		}
})