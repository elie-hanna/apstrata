dojo.provide("apstrata.widgets.graph.State");

dojo.require("dijit._Templated");
dojo.require("dojox.gfx");


dojo.declare("apstrata.widgets.graph.State",
	[dijit._Widget, dijit._Templated],
	{

            // Custom Widget Attributes
            title: "hi",
	    width: 50,
	    height: 50,
            color: "yellow",
            highlightColor: "red",
            surface: null,

            // Dojo template that renders widget
            //templatePath: dojo.moduleUrl("apstrata.widgets", "templates/W101.html"),            
	    templateString: "<div dojoAttachPoint='divState'></div>",
        
	    drawState: function () {
		var node = this.divState;
		this.surface = dojox.gfx.createSurface(node, this.width, this.height);
				
		this._state = this.surface.createEllipse({
		    cx : this.width/2,
		    cy : this.height/2,
		    rx  : this.width/2,
		    ry  : this.height/2
		});
                
                this.drawSpiral();
                this._state.setFill(this.color);
	    }, 

            drawSpiral: function() {
                // origin
                var c = {x:this.width/2, y:this.height/2};

                
                var r=0;
                var turns = 53;
                var step = 190;
                var stepAngle = Math.PI/(360/step);
                var colorR = 0;

                for (a=0; a<((turns*2*Math.PI)); a = a + stepAngle) {
                    x = Math.cos(a)*r + this.width/2;
                    y = Math.sin(a)*r + this.height/2;
                    
                    colorR = colorR + Math.round(255/(turns*2*(360/step)));
                    
                    this.surface.createLine({
                        x1: c.x,
                        y1: c.y,
                        x2: x,
                        y2: y
                    }).setStroke({color:"rgb("+Math.round(colorR/2)+", "+colorR+", "+colorR+")" , width:(r/40), cap:"round"});
                    
                    c.x = x;
                    c.y = y;
                    
                    r= r + (this.width/2)/(turns*2*(360/step));
                }                
            },
	
            postCreate: function(){
                    this.inherited(arguments);

//		    this.drawState();
                    //this.connect(this.myDiv, "onclick","alertMe");
            },
            
            alertMe: function() {
                console.dir (this);
                console.debug(this.title);
            },
            
            startup: function(){
                    this.inherited(arguments);
		    this.drawState();
                    console.debug("svg");
//                    console.dir(this.domNode.firstChild);
                    
		    dojo.connect(this._state.rawNode, "onclick", dojo.hitch(this, "click"));
		    dojo.connect(this._state.rawNode, "onmouseover", dojo.hitch(this, "mouseIn"));
		    dojo.connect(this._state.rawNode, "onmouseout", dojo.hitch(this, "mouseOut"));

            },
            
            mouseIn: function(evt) {
                this._state.setFill(this.highlightColor);
            },
            
            mouseOut: function(evt) {
                this._state.setFill(this.color);
            },
            
            click: function(evt){
                //console.dir(evt);
//                if (evt.target.nodeName == 'ellipse') alert('ouch');
            }
        });
