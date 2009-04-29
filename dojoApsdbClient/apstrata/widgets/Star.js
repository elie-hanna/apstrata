dojo.provide("apstrata.widgets.Star");

dojo.require("dojox.gfx");
dojo.require("dojo.behavior");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("apstrata.widgets.Star", [dijit._Widget, dijit._Templated], {
    
    jags: 5,
    templateString: '<div dojoAttachPoint="dijitStar"></div>',
    color: '#FFFF00',
    borderColor: '',
    borderWidth: 0,
    hoverColor: '',
    hoverBorderColor: '',
    hoverBorderWidth: null,
    radiuses: [20, 7], // degrees
    startRadius: 54, // degree
    specialColor: {},
    specialHoverColor: {},
    _width: 0,
    _height: 0,
    _tx: 0,
    _ty: 0,
    _star: null,
    
    constructor: function(params) {
        this._params = params;
    },
    
    postCreate: function() {
        var sortedRadiuses = dojo.clone(this.radiuses);
        var maxRadius = parseInt(sortedRadiuses.shift());
        this._width = this._height = maxRadius*2;
        this._tx = this._ty = maxRadius;
        // stupid ie6!! if we use the star within another widget it must be appended to the domtree
        //if(this.domNode.parentNode === null) {
        if(this.domNode.parentNode && this.domNode.parentNode.nodeType == 11) {
            dojo.body().appendChild(this.dijitStar);
        }
        // we need to set the width and the height for safari
        this._surface = dojox.gfx.createSurface(this.dijitStar, this._width, this._height);
        this.paint();
        dojo.style(this.domNode, "width", this._width + "px");
        dojo.style(this.domNode, "height", this._height + "px");
    },
    
    paint: function() {
        var radiusAdd = 360/(this.jags*this.radiuses.length);
        var points = [];
        var actualR = 0;
        var x, y;
        var counterRadius = 0;
        var currentRadius;
        for(var s=0; s<=this.jags*this.radiuses.length; s++) {
            if(counterRadius > this.radiuses.length-1) {
                counterRadius = 0;
            }
            currentRadius = this.radiuses[counterRadius];
            counterRadius++;
            actualR = s*radiusAdd + this.startRadius;
            // using inner
            a = actualR * Math.PI / 180;
            x = currentRadius * Math.cos(a) + this._tx;
            y = currentRadius * Math.sin(a) + this._ty;
            points[s] = {'x': x, 'y': y};
        }
        // initial creation of the star
        this._star = this._surface.createPolyline(points);
        this._star.setFill(this._getColor());
        if (this.borderWidth > 0) {
            this._star.setStroke({
                color: this.borderColor,
                width: this.borderWidth
            });
        }
        else {
            this._star.setStroke();
        }
        // now connecting mouseover and mouseout-events
        dojo.connect(this._star.rawNode, "onmouseover", dojo.hitch(this, "onMouseOver"));
        dojo.connect(this._star.rawNode, "onmouseout", dojo.hitch(this, "onMouseOut"));
    },
    
    onMouseOver: function() {
        this._onMouseOver();
    },
    
    _onMouseOver: function() {
        this._star.setFill(this._getHoverColor());
        var hoverBorderWidth = this._getHoverBorderWidth();
        if (hoverBorderWidth > 0) {
            this._star.setStroke({
                color: this._getHoverBorderColor(),
                width: hoverBorderWidth
            });
        }
        else {
            this._star.setStroke();
        }
        dojo.toggleClass(this.dijitStar, "rsStarHover");
        
    },
    
    onMouseOut: function() {
        this._onMouseOut();
    },
    
    _onMouseOut: function() {
        this._star.setFill(this._getColor());
        if (this.borderWidth > 0) {
            this._star.setStroke({
                color: this.borderColor,
                width: this.borderWidth
            });
        }
        else {
            this._star.setStroke();
        }
        dojo.toggleClass(this.dijitStar, "rsStarHover");
    },
    
    _getColor: function() {
        var usedColor = this.color;
        if(this.specialColor.type) {
            usedColor = this.specialColor;
        }
        return usedColor;
    },
    
    _getHoverColor: function() {
        var usedColor = this.color;
        if(this.specialHoverColor.type) {
            usedColor = this.specialHoverColor;
        }
        else if(this.hoverColor) {
            usedColor = this.hoverColor;
        }
        else if(this.specialColor.type) {
            usedColor = this.specialColor;
        }
        return usedColor;
    },
    
    _getHoverBorderColor: function() {
        var usedColor = this.borderColor;
        if(this.hoverBorderColor) {
            usedColor = this.hoverBorderColor;
        }
        return usedColor;
    },
    
    _getHoverBorderWidth: function() {
        var usedWidth = this.borderWidth;
        if(this.hoverBorderWidth !== null) {
            usedWidth = this.hoverBorderWidth;
        }
        return usedWidth;
    }
});
// FOR DOING STARPOLYGONS
 /*paint: function() {
        var points = [];
        var r = 20;
        var counter = 0;
        var point = {};
        var _savedPoint = {};
        for (var s=0; s<=this.n; s++) {
            var a = 360 * s * this.m / this.n;
            points[counter++] = this.getPoint(s, a, r);
        }
        console.log(points);
        my_surface = this.surface.createPolyline(points)
		.setFill("#889")
        .setStroke({color: "black", width: 1})
		;
        //.setStroke({color: "black", width: 2})
    },
    
    getPoint: function(s, a, r) {
        a = a * Math.PI / 180;
        x = r * Math.cos(a);
        y = r * Math.sin(a);
        self._cx = x;
        self._cy = y;
        return {'x': x+this._tx, 'y': y+this._ty};
    }*/