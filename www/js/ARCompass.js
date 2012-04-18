ARCompass = {
	_containerId : null,
	_width : null,
	_height : null,
	_canvas : null,
	_ctx : null,
	_currentHeading : null,
	_destinationHeading : null,
	_degreesToShow : 120,
	_intervalId : null,
	_accel : 0,
	
	init : function(options) {
		if( typeof options == undefined ) {
			return;
		}
		
		if( typeof options.containerId != undefined ) 
			this._containerId = options.containerId;
		
		this._canvas = Ext.get(this._containerId).dom;
		
		if( typeof options.width != undefined) 
			this._width = options.width;
		if( typeof options.height != undefined) 
			this._height = options.height;
		
		if( typeof options.degreesToShow != undefined )
			this._degreesToShow = options.degreesToShow;
		
		console.log("Compass.init, width=" + this._width + ", height=" + this._height);
		

		this._ctx = this._canvas.getContext("2d");
		this._canvas.setAttribute("width", this._width);
		this._canvas.setAttribute("height", this._height);
		
		this._currentHeading = 0;
		this._destinationHeading = 0;
		
		//this._startRotating();
	},
	
	draw : function() {
		var startDegrees = this._currentHeading - Math.floor(this._degreesToShow / 2);
		var endDegrees = this._currentHeading + Math.floor(this._degreesToShow / 2);
		var pxPerDegree = this._width / (endDegrees-startDegrees);
		
		//console.log("drawing at " + this._currentHeading + " between (" + startDegrees + ", " + endDegrees + ")");
		
		var offset = Math.floor(pxPerDegree * (Math.ceil(startDegrees) - startDegrees));
		
		var degreeLineHeight = Math.ceil(this._height * .1);
		var everyFifthLineHeight = Math.ceil(this._height * .3 );
		 
		//console.log("start=" + startDegrees + ", end=" + endDegrees + ", pxPer=" + pxPerDegree + ", offset=" + offset);
		this.clear();
	
		this._ctx.save();		
		for( var degree = 0 ; degree <= Math.floor(endDegrees - startDegrees) ; degree++ ) {
			var x = Math.floor(degree * pxPerDegree) + offset;
			var y1 = this._height - 1;
			var y2 = this._height - 1 - (((degree+startDegrees) % 5 == 0) ? everyFifthLineHeight : degreeLineHeight);
			this._ctx.save();
			this._ctx.beginPath();
			this._ctx.moveTo(x,y1);
			this._ctx.lineTo(x, y2);
			this._ctx.strokeStyle = "#ffffff";
			this._ctx.lineWidth = 2;
			this._ctx.closePath();
			this._ctx.stroke();
			this._ctx.restore();

			//console.log("drawing degree line (" + degree + ") from (" + x + "," + y1 + ") to (" + x + "," + y2 + ")");
		}		
		this._ctx.restore();
		
		this._ctx.save();
		this._ctx.beginPath();
		this._ctx.moveTo(0, this._height-1);
		this._ctx.lineTo(this._width, this._height-1);
		this._ctx.closePath();
		this._ctx.strokeStyle = "#ffffff";
		this._ctx.lineWidth = 2;
		this._ctx.stroke();
		this._ctx.restore();
		
		//console.log("norm = " + normalize180(0, startDegrees) + "," + normalize180(0, endDegrees));
		
		if( normalize180(0, startDegrees) > -this._degreesToShow && normalize180(0, endDegrees) < this._degreesToShow ) {
			var x = Math.abs(normalize180(startDegrees, 0)) * pxPerDegree + offset;
			var y = 10;
			//console.log("drawing N at (" + x + ", " + y + ")");
			this._drawTextAt(x, y, "N");
		}
		
		if( startDegrees < 90 && endDegrees > 90 ) {
			var x = (90 - startDegrees) * pxPerDegree + offset;
			var y = 10;
			//console.log("drawing E at (" + x + ", " + y + ")");
			this._drawTextAt(x, y, "E");
		}
	},
	
	_drawTextAt : function(x,y,text, font) {
		if( !font ) {
			font = "10px Arial";	
		}
		this._ctx.save();
		this._ctx.font = font;
		this._ctx.fillStyle = "#ffffff";
		//var tSize = this.ctx.measureText(text);
		//if (!tSize.height) tSize.height = 15; // no height in firefox.. :(
		this._ctx.fillText(text,x ,y );
		this._ctx.restore();
	},
	
	clear : function() {
		this._canvas.setAttribute("width", this._width);
	},
	
	setHeading : function(heading) {
		this._currentHeading = heading;
		this.draw();
	}
};

function normalize180(firstAngle, secondAngle)
{
      var difference = secondAngle - firstAngle;
      while (difference < -180) difference += 360;
      while (difference > 180) difference -= 360;
      return difference;
}