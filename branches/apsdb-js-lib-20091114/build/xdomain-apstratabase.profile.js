dependencies = {
    layers:  [ 
        {
	        name: "../apstrata/apstrata-lib.js",
	        dependencies: [
				"apstrata.apstrata",
				"dijit._Templated",
				"dijit._Widget",
				"dijit.layout.LayoutContainer",
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
				"dijit.form.SimpleTextarea",
				"apstrata.util.schema.Schema",
				"apstrata.Connection",
				"apstrata.Client",
				"apstrata.util.logger.BasicLogger",
				"surveyWidget.widgets.SurveyField",
				"surveyWidget.widgets.SurveyCharting",
				"surveyWidget.widgets.Survey",
				"surveyWidget.widgets.SurveyRunner",
				"surveyWidget.widgets.SurveyChartingLoader"
	        ]
        },
		
		{
	        name: "../apstrata/list-apstrata-lib.js",
	        dependencies: [
				"apstrata.apstrata",
				"dijit._Templated",
				"dijit._Widget",
				"dijit.layout.LayoutContainer",
				"dijit.Declaration",
				"apstrata.util.schema.Schema",
				"apstrata.Connection",
				"apstrata.Client",
				"apstrata.util.logger.BasicLogger",
				"surveyWidget.widgets.SurveyListing",
				"surveyWidget.widgets.SurveyListingLoader"
	        ]
        },
		
		{
	        name: "../apstrata/chart-apstrata-lib.js",
	        dependencies: [
				"apstrata.apstrata",
				"dijit._Templated",
				"dijit._Widget",
				"dijit.layout.LayoutContainer",
				"dojox.charting.Chart2D",
				"dojox.charting.themes.PlotKit.red",
				"dojox.charting.Theme",
				"dijit.Declaration",
				"apstrata.util.schema.Schema",
				"apstrata.Connection",
				"apstrata.Client",
				"apstrata.util.logger.BasicLogger",
				"surveyWidget.widgets.SurveyCharting",
				"surveyWidget.widgets.SurveyChartingLoader"
	        ]
        },
		
		{
	        name: "../apstrata/surveyslist-apstrata-lib.js",
	        dependencies: [
				"apstrata.apstrata",
				"dijit._Templated",
				"dijit._Widget",
				"dijit.layout.LayoutContainer",
				"dijit.Declaration",
				"apstrata.util.schema.Schema",
				"apstrata.Connection",
				"apstrata.Client",
				"apstrata.util.logger.BasicLogger",
				"surveyWidget.widgets.SurveysList",
				"surveyWidget.widgets.SurveysListLoader"
	        ]
        }
    ],
    prefixes: [
		[ "surveyWidget", "../../../../demos/survey" ],
		[ "apstrata", "../../../../apstrata" ]
    ]
};
