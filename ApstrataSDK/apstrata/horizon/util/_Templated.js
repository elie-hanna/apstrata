dojo.provide("apstrata.horizon.util._Templated");
dojo.require("dijit._Templated");
dojo.require("dojox.dtl._base");
dojo.require("dojox.dtl._Templated")

dojo.declare("apstrata.horizon.util._Templated", dojox.dtl._Templated, {
	_dijitTemplateCompat: false,
	
	buildRendering: function(){
		var node;

		if(this.domNode && !this._template){
			return;
		}
		if(!this._template){
			var t = this.getCachedTemplate(
/* This is the code changed compared to dojox.dtl._Templated */
				this.contentTemplatePath,
				this.contentTemplateString,
/* This is the code changed compared to dojox.dtl._Templated */
				this._skipNodeCache
			);
			if(t instanceof dojox.dtl.Template) {
				this._template = t;
			}else{
				node = t;
			}
		}
		if(!node){
			var context = new dojox.dtl._Context(this.parentPanel);
			if(!this._created){
				delete context._getter;
			}
			var nodes = dojo._toDom(
				this._template.render(context)
			);
			// TODO: is it really necessary to look for the first node?
			if(nodes.nodeType !== 1 && nodes.nodeType !== 3){
				// nodes.nodeType === 11
				// the node is a document fragment
				for(var i = 0, l = nodes.childNodes.length; i < l; ++i){
					node = nodes.childNodes[i];
					if(node.nodeType == 1){
						break;
					}
				}
			}else{
				// the node is an element or a text
				node = nodes;
			}
		}

		this._attachTemplateNodes(node);

		if(this.widgetsInTemplate){
			//Make sure dojoType is used for parsing widgets in template.
			//The dojo.parser.query could be changed from multiversion support.
			var parser = dojo.parser, qry, attr;
			if(parser._query != "[dojoType]"){
				qry = parser._query;
				attr = parser._attrName;
				parser._query = "[dojoType]";
				parser._attrName = "dojoType";
			}

			//Store widgets that we need to start at a later point in time
			var cw = (this._startupWidgets = dojo.parser.parse(node, {
				noStart: !this._earlyTemplatedStartup,
				inherited: {dir: this.dir, lang: this.lang}
			}));

			//Restore the query.
			if(qry){
				parser._query = qry;
				parser._attrName = attr;
			}

			this._supportingWidgets = dijit.findWidgets(node);

			this._attachTemplateNodes(cw, function(n,p){
				return n[p];
			});
		}

		if(this.domNode){
			dojo.place(node, this.domNode, "before");
			this.destroyDescendants();
			dojo.destroy(this.domNode);
		}
		this.domNode = node;

		this._fillContent(this.srcNodeRef);
	}
});
