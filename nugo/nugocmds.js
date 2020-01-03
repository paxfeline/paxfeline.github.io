function TurtleCommand_Forward( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Forward";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
	r.appendChild( $e("br") );
	this.control = new DistanceControl( this );
	r.appendChild( this.control.htmlEl );
	
	this.btnEl = $e( "input" );
	this.btnEl.className = "DCSetBtn";
	this.btnEl.type = "button";
	this.btnEl.value = "+";
	/* this misses inversion? */
	this.btnEl.addEventListener( "click",
		(function ()
		{
			var d = new MultiCtrlDialog( this, [ DistanceControl, TextControl ] );
			//console.log( "hide CL" );
			Nugo.codeList.hide();
			document.body.appendChild( d.htmlEl );
		}).bind( this ) );
	r.appendChild( this.btnEl );
}

function NugoDrawLine( ctx, x, y, penup )
{
	var sx = this.arena.turtle.x;
	var sy = this.arena.turtle.y;
	
	var dx = x;
	var dy = y;
	
	var x2 = sx + dx;
	var y2 = sy + dy;
	
	var esc = 0;
	while ( !this.arena.inBounds( x2, y2 ) )
	{
		esc++; if ( esc > 9000 ) { console.log("escaped... " + this.value + "\n\n\n"); break; }
		
		var tx = this.arena.turtle.x + dx;
		var ty = this.arena.turtle.y + dy
		
		if ( !this.arena.inBounds( tx, ty ) )
		{
			if ( ctx.penstate )
			{
				ctx.beginPath();
				ctx.moveTo( this.arena.turtle.x, this.arena.turtle.y );
				ctx.lineTo( tx, ty );
				ctx.closePath();
				ctx.stroke();
			}
		
			var xadj = 0;
			var yadj = 0;
		
			if ( (tx < 0 || tx > this.arena.htmlEl.width) &&
					(ty < 0 || ty > this.arena.htmlEl.height) )
			{
				var txf; // test x fixed
				var tyf;
				var tyd; // test y dependent
				var tyd;
			
				if ( tx > this.arena.htmlEl.width )
					txf = this.arena.htmlEl.width - this.arena.turtle.x;
				if ( tx < 0 )
					txf = this.arena.turtle.x;
			
				if ( ty > this.arena.htmlEl.height )
					tyf = this.arena.htmlEl.height - this.arena.turtle.y;
				if ( ty < 0 )
					tyf = this.arena.turtle.y;
		
				tyd = txf * Math.tan( this.arena.turtle.getHeading() );
				txd = Math.abs( ( tyf * txf ) / tyd );
			
				if ( txf > txd )
					yadj = (ty < 0) ? this.arena.htmlEl.height : -this.arena.htmlEl.height;
				else
					xadj = (tx < 0) ? this.arena.htmlEl.width : -this.arena.htmlEl.width;
				
			}
			else
			{
				if ( tx < 0 || tx > this.arena.htmlEl.width )
					xadj = (tx < 0) ? this.arena.htmlEl.width : -this.arena.htmlEl.width;
				if ( ty < 0 || ty > this.arena.htmlEl.height )
					yadj = (ty < 0) ? this.arena.htmlEl.height : -this.arena.htmlEl.height;
			}
			
			this.arena.turtle.x = sx + xadj;
			this.arena.turtle.y = sy + yadj;
			x2 += xadj;
			y2 += yadj;
		
			dx = x2 - this.arena.turtle.x;
			dy = y2 - this.arena.turtle.y;
		
			tx = this.arena.turtle.x;
			ty = this.arena.turtle.y;
		
			i = 0;
		}
		else
		{
			if ( ctx.penstate )
			{
				ctx.beginPath();
				ctx.moveTo( this.arena.turtle.x, this.arena.turtle.y );
				ctx.lineTo( tx, ty );
				ctx.closePath();
				ctx.stroke();
			}
		}
	
		sx = tx;
		sy = ty;
	}
	
	if ( ctx.penstate )
	{
		ctx.beginPath();
		ctx.moveTo( this.arena.turtle.x, this.arena.turtle.y );
		ctx.lineTo( x2, y2 );
		ctx.closePath();
		ctx.stroke();
	}
	
	this.arena.turtle.x = x2;
	this.arena.turtle.y = y2;
}

TurtleCommand_Forward.prototype.draw =
	function ( ctx )
	{
		var chead = this.arena.turtle.getHeading();
		
		var dx = Math.cos(chead) * this.value;
		var dy = -Math.sin(chead) * this.value;
		
		if ( !this.value || chead == undefined ) return;
		
		NugoDrawLine.call( this, ctx, dx, dy );
	};
	
TurtleCommand_Forward.prototype.getOutValue =
	function (v)
	{
		return (100 * Math.pow( 2, 8 * v ) - 100).toFixed(1);
	};
TurtleCommand_Forward.prototype.updateValue =
	function ( v )
	{
		this.value = this.getOutValue(v);
		//console.log( "draw", this.value );
		Nugo.draw();
	};
TurtleCommand_Forward.prototype.setTitle =
	function ( v )
	{
		this.titleEl.innerHTML = v;
	};
TurtleCommand_Forward.prototype.getControlValue =
	function ( v )
	{
		return getBaseLog( 2, (v / 100) + 1 ) / 8; //getBaseLog( 2, (v / 100) + 1 ) / 13;
	};
TurtleCommand_Forward.prototype.getDisplayValue =
	function ()
	{
		//console.log( this.value );
		return new Number( this.value ).toFixed(1);
	};
TurtleCommand_Forward.prototype.genCode =
	function ()
	{
		return "FD " + this.value;
	};
TurtleCommand_Forward.prototype.invert =
	function ( newTitle, newGenCode )
	{
		this.updateValue =
			function ( v )
			{
				this.value = -this.getOutValue( v );
				Nugo.draw();
			};
		this.getDisplayValue =
			function ()
			{
				return -this.value.toFixed(1);
			};
		this.setTitle( newTitle );
		this.genCode =
			function ()
			{
				return newGenCode + " " + this.getDisplayValue();
			};
	};
	
function TurtleCommand_Back( ta, block )
{
	var cmd = new TurtleCommand_Forward( ta, block );
	cmd.invert( "Back", "BK" );
	return cmd;
}
	
function TurtleCommand_Right( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Turn Right";
	var cb = $e( "span" );
	cb.className = "cb";
	cb.innerHTML = "X";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
	r.appendChild( $e("br") );
	this.control = new AngleControl( this );
	r.appendChild( this.control.htmlEl );
	this.btnEl = $e( "input" );
	this.btnEl.className = "DCSetBtn";
	this.btnEl.type = "button";
	this.btnEl.value = "+";
	this.btnEl.addEventListener( "click",
		(function ()
		{
			var d = new MultiCtrlDialog( this, [ AngleControl, TextControl ] );
			//console.log( "hide CL" );
			Nugo.codeList.hide();
			document.body.appendChild( d.htmlEl );
		}).bind( this ) );
	r.appendChild( this.btnEl );
}
TurtleCommand_Right.prototype.draw =
	function ( ctx )
	{
		this.arena.turtle.heading -= this.value;
	};
TurtleCommand_Right.prototype.getOutValue =
	function ( v )
	{
		var r = v * 180 / Math.PI;
		//console.log( "gov", v, r.toFixed(1) );
		return r.toFixed(1);
	};
TurtleCommand_Right.prototype.updateValue =
	function ( v )
	{
		this.value = this.getOutValue( v );
		//console.log( "GG", this.value );
		Nugo.draw();
	};
TurtleCommand_Right.prototype.setTitle =
	function ( v )
	{
		this.titleEl.innerHTML = v;
	};
TurtleCommand_Right.prototype.getControlValue =
	function ( v )
	{
		//console.log( "gcv", v, v * Math.PI / 180 );
		return v * Math.PI / 180;
	};
TurtleCommand_Right.prototype.getDisplayValue =
	function ()
	{
		//console.log( this.value );
		return new Number( this.value ).toFixed(1);
	};
TurtleCommand_Right.prototype.genCode =
	function ()
	{
		return "RT " + this.getDisplayValue();
	};
TurtleCommand_Right.prototype.invert =
	function ( newTitle, newGenCode )
	{
		this.updateValue =
			function ( v )
			{
				this.value = -this.getOutValue( v );
				Nugo.draw();
			};
		this.getDisplayValue =
			function ()
			{
				return -this.value.toFixed(1);
			};
		this.setTitle( newTitle );
		this.genCode =
			function ()
			{
				return newGenCode + " " + this.getDisplayValue();
			};
	};
	
function TurtleCommand_Left( ta, block )
{
	var cmd = new TurtleCommand_Right( ta, block );
	cmd.invert( "Turn Left", "LT" );
	return cmd;
}
	
function TurtleCommand_LineWidth( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Pen Size";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
	r.appendChild( $e("br") );
	this.control = new DistanceControl( this );
	r.appendChild( this.control.htmlEl );
}

TurtleCommand_LineWidth.prototype.draw =
	function ( ctx )
	{
		ctx.lineWidth = this.value;
	};
	
TurtleCommand_LineWidth.prototype.getOutValue =
	function (v)
	{
		return v * 50;
	};
TurtleCommand_LineWidth.prototype.updateValue =
	function ( v )
	{
		this.value = this.getOutValue(v);
		Nugo.draw();
	};
TurtleCommand_LineWidth.prototype.setTitle =
	function ( v )
	{
		this.titleEl.innerHTML = v;
	};
TurtleCommand_LineWidth.prototype.getControlValue =
	function ( v )
	{
		return v / 50;
	};
TurtleCommand_LineWidth.prototype.getDisplayValue =
	function ()
	{
		return this.value.toFixed(1);
	};
TurtleCommand_LineWidth.prototype.genCode =
	function ()
	{
		return "PENSIZE " + this.value;
	};
	
function TurtleCommand_Home( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Home";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
}

TurtleCommand_Home.prototype.draw =
	function ( ctx )
	{
		//console.log( "home draw" );
		var nx = this.arena.htmlEl.width / 2;
		var ny = this.arena.htmlEl.height / 2;
		ctx.beginPath()
		ctx.moveTo( this.arena.turtle.x, this.arena.turtle.y );
		ctx.lineTo( nx, ny );
		ctx.stroke();
		this.arena.turtle.x = nx;
		this.arena.turtle.y = ny;
		
	};
TurtleCommand_Home.prototype.genCode =
	function ()
	{
		return "HOME";
	};
	
function TurtleCommand_PenUp( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Pen Up";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
}

TurtleCommand_PenUp.prototype.draw =
	function ( ctx )
	{
		//console.log( "pu draw" );
		/*if ( !ctx.penstate ) return;
		ctx.save();
		ctx.strokeStyle = "rgba( 255, 0, 0, 0 )";*/
		ctx.penstate = false;
	};
TurtleCommand_PenUp.prototype.genCode =
	function ()
	{
		return "PU";
	};
	
function TurtleCommand_PenDown( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Pen Down";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
}

TurtleCommand_PenDown.prototype.draw =
	function ( ctx )
	{
		//console.log( "pd draw" );
		/*if ( ctx.penstate ) return;
		ctx.restore();*/
		ctx.penstate = true;
	};
TurtleCommand_PenDown.prototype.genCode =
	function ()
	{
		return "PD";
	};
	
function TurtleCommand_PenColor( ta, block )
{
	this.arena = ta;
	this.owner = block;
	
	var r = $e( "div" );
	this.htmlEl = r;
	r.className = "cmdDiv";
	this.titleEl = $e( "span" );
	this.titleEl.innerHTML = "Pen Color";
	var cb = $e( "span" );
	cb.innerHTML = "X";
	cb.className = "cb";
	cb.style.marginLeft = "1em";
	var self = this;
	cb.addEventListener( "click", function () { block.removeCommand(self); } );
	r.appendChild( this.titleEl );
	r.appendChild( cb );
	r.appendChild( $e("br") );
	this.control = new TextControl( this );
	r.appendChild( this.control.htmlEl );
}

TurtleCommand_PenColor.prototype.draw =
	function ( ctx )
	{
		console.log( this.value, this.value == "random" );
		if ( this.value == "random" )
		{
			var rc = Math.floor( Math.random() * 256 );
			var gc = Math.floor( Math.random() * 256 );
			var bc = Math.floor( Math.random() * 256 );
			var oc = "rgb(" + rc + "," + gc + "," + bc + ")";
			console.log( "rand", oc );
			ctx.strokeStyle = oc;
		}
		else
			ctx.strokeStyle = this.value;
	};
	
TurtleCommand_PenColor.prototype.getOutValue =
	function (v)
	{
		return v;
	};
TurtleCommand_PenColor.prototype.updateValue =
	function ( v )
	{
		this.value = this.getOutValue(v);
		Nugo.draw();
	};
TurtleCommand_PenColor.prototype.setTitle =
	function ( v )
	{
		this.titleEl.innerHTML = v;
	};
TurtleCommand_PenColor.prototype.getControlValue =
	function ( v )
	{
		return v;
	};
TurtleCommand_PenColor.prototype.getDisplayValue =
	function ()
	{
		return this.value;
	};
TurtleCommand_PenColor.prototype.genCode =
	function ()
	{
		return "PENCOLOR " + this.value;
	};