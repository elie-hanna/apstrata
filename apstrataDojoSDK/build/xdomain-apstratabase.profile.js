dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/apstrata-lib.js",
	        dependencies: [
				"surveyWidget.widgets.Survey",
				"surveyWidget.widgets.SurveyCharting",
				"surveyWidget.widgets.SurveyField",
				"surveyWidget.widgets.SurveyListing",
				"surveyWidget.widgets.SurveyRunner",
				"surveyWidget.widgets.SurveyChartingLoader",
				"surveyWidget.widgets.SurveyListingLoader",
				"apstrata.apsdb.client.Connection",
				"apstrata.apsdb.client.Client",
				"apstrata.util.schema.Schema",
				"dijit._Templated",
				"dijit._Widget",
				"dijit.layout.LayoutContainer",
				"dojo.dnd.Container",
				"dojo.dnd.Manager",
				"dojo.dnd.Source",
				"apstrata.util.logger.BasicLogger",
				"apstrata.ApConfig",
				"dojox.encoding.digests.MD5",
				"dojox.charting.Chart2D",
				"dojox.charting.themes.PlotKit.red",
				"dojox.charting.Theme",
				"dijit.Declaration",
				"dijit.form.Form",
				"dijit.form.ValidationTextBox",
				"dijit.form.FilteringSelect",
				"dijit.form.CheckBox",				
				"dijit.InlineEditBox",
				"dojo.html",
				"dojo.parser"

	        ]
        }
    ],
    prefixes: [
		[ "surveyWidget", "../../../../demos/survey" ],
		[ "apstrata", "../../../../apstrata" ]
    ]
};
