function DistanceControl( owner, initVal )
{
	var self = this;
	
	this.value = initVal ? owner.getControlValue( initVal ) : 0.1;
	
	this.owner = owner;
	
	this.htmlEl = $e( "div" );
	
	this.canvas = $e("canvas");
	this.canvas.className = "DistanceControlEl";
	this.canvas.owner = this;
	
	this.htmlEl.appendChild( this.canvas );
	
	this.ctx = this.canvas.getContext( "2d" );
	
	this.ongoingTouches = new Array();
	
	this.canvas.addEventListener( "mousedown", this.mouseDown );
	
	this.canvas.addEventListener( "touchstart", this.touchStart );
	
	window.addEventListener( "resize", this.resize.bind( this, false ) );
	
	this.startCheck();
	//this.timer = setInterval( DistanceControl.checkReady.bind( this ), 10 );
	
	this.state = false;
}
var gCurControl; // for debugging
DistanceControl.prototype.startCheck =
	function ()
	{
		this.timer = setInterval( DistanceControl.checkReady.bind( this ), 10 );
	};
DistanceControl.prototype.touchStart =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var t1 = e.touches[0];
		
		var nv = (t1.pageX - this.owner.leftCoord) / this.offsetWidth;
		this.owner.owner.updateValue( nv, true );
		
		if ( this.owner.value != nv )
		{
			this.owner.value = nv
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		}
		
		this.owner.touchEndBound = this.owner.touchEnd.bind( this );
		this.owner.touchCancelBound = this.owner.touchCanel.bind( this );
		this.owner.touchMoveBound = this.owner.touchMove.bind( this );
		
		gCurControl = this.owner.touchMoveBound;
		//console.log( "touchmoveB1", this.owner.touchMoveBound );
		
		this.addEventListener( "touchend", this.owner.touchEndBound );
		this.addEventListener( "touchcancel", this.owner.touchCancelBound );
		this.addEventListener( "touchmove", this.owner.touchMoveBound );
	};
DistanceControl.prototype.touchEnd =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
			
			var t1 = e.touches[0];
		
			var nv = (t1.pageX - this.owner.leftCoord) / this.offsetWidth;
			this.owner.owner.updateValue( nv, true );
		
			if ( this.owner.value != nv )
			{
				this.owner.value = nv
				this.owner.owner.updateValue( this.owner.value );
				this.owner.draw();
			}
		
			//console.log( "touchmoveB2", this.owner.touchMoveBound, gCurControl, this.owner.touchMoveBound == gCurControl );
			
			this.removeEventListener( "touchend", this.owner.touchEndBound );
			this.removeEventListener( "touchcancel", this.owner.touchCancelBound );
			this.removeEventListener( "touchmove", this.owner.touchMoveBound );
		
			//unsetTouchOrMouseEvent( window, "up", this.owner.mouseUpBound );
			//unsetTouchOrMouseEvent( window, "move", this.owner.mouseMoveBound );
		}
	};
DistanceControl.prototype.touchCanel =
	function (e)
	{
		this.touchEnd( e );
	};
DistanceControl.prototype.touchMove =
	function (e)
	{
		e.preventDefault();
		
		var t1 = e.touches[0];
		
		var nv = (t1.pageX - this.owner.leftCoord) / this.offsetWidth;
		this.owner.owner.updateValue( nv, true );
		
		if ( this.owner.value != nv )
		{
			this.owner.value = nv
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		}
	};
DistanceControl.checkReady =
	function ()
	{
		if ( this.canvas.offsetHeight > 0 )
		{
			clearInterval( this.timer );
			this.resize(false);
			this.owner.updateValue( this.value );
		}
	};
DistanceControl.prototype.mouseDown =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var nv = (e.pageX - this.owner.leftCoord) / this.offsetWidth;
		this.owner.owner.updateValue( nv, true );
		
		if ( this.owner.value != nv )
		{
			this.owner.value = nv;
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		}
		
		this.owner.mouseUpBound = this.owner.mouseUp.bind( this );
		this.owner.mouseMoveBound = this.owner.mouseMove.bind( this );
		
		window.addEventListener( "mouseup", this.owner.mouseUpBound );
		window.addEventListener( "mousemove", this.owner.mouseMoveBound );

		//setTouchOrMouseEvent( window, "up", this.owner.mouseUpBound );
		//setTouchOrMouseEvent( window, "move", this.owner.mouseMoveBound );
		
		//this.addEventListener( "touchend", this.owner.mouseUp );
		//this.addEventListener( "touchmove", this.owner.mouseMove );
	};
DistanceControl.prototype.mouseMove =
	function (e)
	{
		e.preventDefault();
		
		var nv = (e.pageX - this.owner.leftCoord) / this.offsetWidth;
		this.owner.owner.updateValue( nv, true );
		
		if ( this.owner.value != nv )
		{
			this.owner.value = nv;
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		}
	};
DistanceControl.prototype.mouseUp =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
			
			var nv = (e.pageX - this.owner.leftCoord) / this.offsetWidth;
			this.owner.owner.updateValue( nv, true );
		
			if ( this.owner.value != nv )
			{
				this.owner.value = nv;
				this.owner.owner.updateValue( this.owner.value );
				this.owner.draw();
			}
		
			window.removeEventListener( "mouseup", this.owner.mouseUpBound );
			window.removeEventListener( "mousemove", this.owner.mouseMoveBound );
		}
	};
DistanceControl.prototype.resize =
	function (suppress)
	{
		//this.canvas.style.width = "100%";
		/*var d = this.canvas.offsetWidth - this.btnEl.offsetWidth - 5;
		this.canvas.width = d;
		this.canvas.style.width = d + "px";*/
		
		this.canvas.width = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		
		console.log( "ow res", this.canvas.offsetWidth );
		
		var bodyRect = document.body.getBoundingClientRect();
		this.leftCoord = this.canvas.getBoundingClientRect().left - bodyRect.left;
		
		if (!suppress)
		{
			this.draw();
		}

	};
DistanceControl.prototype.draw =
	function ()
	{
		this.ctx.clearRect( 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight );
		this.ctx.strokeStyle = "#000";
		this.ctx.strokeRect( 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight );
		this.ctx.fillRect( 0, 0, this.value * this.canvas.offsetWidth, this.canvas.offsetHeight );
	};
DistanceControl.prototype.setValue =
	function ( v, updateControl )
	{
		this.value = v;
		this.owner.updateValue( this.value, updateControl );
		this.draw();
	};

function AngleControl( owner, initVal )
{
	this.value =
		initVal ?
			owner.getControlValue( initVal ) /*- Math.PI / 2*/ :
			Math.PI / 2;
	
	this.owner = owner;
	this.htmlEl = $e( "div" );
	
	this.canvas = $e("canvas");
	this.canvas.className = "DistanceControlEl";
	this.canvas.owner = this;
	
	this.htmlEl.appendChild( this.canvas );
	
	this.ctx = this.canvas.getContext( "2d" );
	
	this.ongoingTouches = new Array();
	
	this.canvas.addEventListener( "mousedown", this.mouseDown );
	this.canvas.addEventListener( "touchstart", this.touchStart );
	
	window.addEventListener( "resize", this.resize.bind( this, false ) );
	
	this.timer = setInterval( DistanceControl.checkReady.bind( this ), 10 );
	
	this.state = false;
}
AngleControl.prototype.touchStart =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var t1 = e.touches[0];
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (t1.pageX - cbox.left) - 50;
		var oy = (t1.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
		
		this.owner.touchEndBound = this.owner.touchEnd.bind( this );
		this.owner.touchCancelBound = this.owner.touchCanel.bind( this );
		this.owner.touchMoveBound = this.owner.touchMove.bind( this );
		
		gCurControl = this.owner.touchMoveBound;
		
		this.addEventListener( "touchend", this.owner.touchEndBound );
		this.addEventListener( "touchcancel", this.owner.touchCancelBound );
		this.addEventListener( "touchmove", this.owner.touchMoveBound );
	};
AngleControl.prototype.touchEnd =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
			
			var t1 = e.touches[0];
		
			var cbox = this.owner.canvas.getBoundingClientRect();
			var ox = (t1.pageX - cbox.left) - 50;
			var oy = (t1.pageY - cbox.top) - 50;
		
			this.owner.value = Math.atan( oy / ox );
			if ( ox < 0 ) this.owner.value += Math.PI;
		
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
			
			this.removeEventListener( "touchend", this.owner.touchEndBound );
			this.removeEventListener( "touchcancel", this.owner.touchCancelBound );
			this.removeEventListener( "touchmove", this.owner.touchMoveBound );
		}
	};
AngleControl.prototype.touchCanel =
	function (e)
	{
		this.touchEnd( e );
	};
AngleControl.prototype.touchMove =
	function (e)
	{
		e.preventDefault();
		
		var t1 = e.touches[0];
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (t1.pageX - cbox.left) - 50;
		var oy = (t1.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
	};
AngleControl.checkReady =
	function ()
	{
		if ( this.canvas.offsetHeight > 0 )
		{
			clearInterval( this.timer );
			this.resize(false);
			this.owner.updateValue( this.value );
		}
	};
AngleControl.prototype.mouseDown =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (e.pageX - cbox.left) - 50;
		var oy = (e.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		//console.log( this.owner.value );
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
		
		this.owner.mouseUpBound = this.owner.mouseUp.bind( this );
		this.owner.mouseMoveBound = this.owner.mouseMove.bind( this );
		
		window.addEventListener( "mouseup", this.owner.mouseUpBound );
		window.addEventListener( "mousemove", this.owner.mouseMoveBound );
	};
AngleControl.prototype.mouseMove =
	function (e)
	{
		e.preventDefault();
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (e.pageX - cbox.left) - 50;
		var oy = (e.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
	};
AngleControl.prototype.mouseUp =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
		
			var cbox = this.owner.canvas.getBoundingClientRect();
			var ox = (e.pageX - cbox.left) - 50;
			var oy = (e.pageY - cbox.top) - 50;
		
			this.owner.value = Math.atan( oy / ox );
			if ( ox < 0 ) this.owner.value += Math.PI;
			//console.log( this.owner.value );
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		
			window.removeEventListener( "mouseup", this.owner.mouseUpBound );
			window.removeEventListener( "mousemove", this.owner.mouseMoveBound );
		}
	};
AngleControl.prototype.resize =
	function (suppress)
	{
		//this.canvas.style.width = "100%";
		var d = 100; //this.canvas.offsetWidth - this.btnEl.offsetWidth - 5;
		this.canvas.width = d;
		this.canvas.style.width = d + "px";
		this.canvas.style.height = d + "px";
		this.canvas.height = this.canvas.offsetHeight;
		if (!suppress)
		{
			this.draw();
		}
	};
AngleControl.prototype.draw =
	function ()
	{
		this.ctx.clearRect( 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight );
		this.ctx.strokeStyle = "#000";
		//this.ctx.lineWidth = Math.PI;
		this.ctx.beginPath();
		this.ctx.moveTo( 50, 50 );
		this.ctx.lineTo( 100, 50 );
		this.ctx.arc( 50, 50, 50, 0, this.value );
		//this.ctx.lineTo( 50 + Math.cos( this.value ) * 50, 50 + Math.sin( this.value ) * 50 );
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
	};
AngleControl.prototype.setValue =
	function ( v, updateControl )
	{
		//console.log( "ac sv", v );
		this.value = v;
		this.owner.updateValue( this.value, updateControl );
		this.draw();
	};

function SlopeInterceptClass( m, b )
{
	this.m = m;
	this.b = b;
}
SlopeInterceptClass.prototype.toString =
	function ()
	{
		return m + " x + " + b;
	};
	
function LineGraphControl( owner )
{
	this.value = Math.PI / 6 - Math.PI / 2; // would be Math.PI / 2, but ... not
	
	this.owner = owner;
	this.htmlEl = $e( "div" );
	
	this.canvas = $e("canvas");
	this.canvas.className = "DistanceControlEl";
	this.canvas.owner = this;
	
	this.htmlEl.appendChild( this.canvas );
	
	this.ctx = this.canvas.getContext( "2d" );
	
	this.ongoingTouches = new Array();
	
	this.canvas.addEventListener( "mousedown", this.mouseDown );
	this.canvas.addEventListener( "touchstart", this.touchStart );
	
	window.addEventListener( "resize", this.resize.bind( this, false ) );
	
	this.timer = setInterval( DistanceControl.checkReady.bind( this ), 10 );
	
	this.state = false;
}
LineGraphControl.prototype.touchStart =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var t1 = e.touches[0];
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (t1.pageX - cbox.left) - 50;
		var oy = (t1.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
		
		this.owner.touchEndBound = this.owner.touchEnd.bind( this );
		this.owner.touchCancelBound = this.owner.touchCanel.bind( this );
		this.owner.touchMoveBound = this.owner.touchMove.bind( this );
		
		gCurControl = this.owner.touchMoveBound;
		
		this.addEventListener( "touchend", this.owner.touchEndBound );
		this.addEventListener( "touchcancel", this.owner.touchCancelBound );
		this.addEventListener( "touchmove", this.owner.touchMoveBound );
	};
LineGraphControl.prototype.touchEnd =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
			
			var t1 = e.touches[0];
		
			var cbox = this.owner.canvas.getBoundingClientRect();
			var ox = (t1.pageX - cbox.left) - 50;
			var oy = (t1.pageY - cbox.top) - 50;
		
			this.owner.value = Math.atan( oy / ox );
			if ( ox < 0 ) this.owner.value += Math.PI;
		
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
			
			this.removeEventListener( "touchend", this.owner.touchEndBound );
			this.removeEventListener( "touchcancel", this.owner.touchCancelBound );
			this.removeEventListener( "touchmove", this.owner.touchMoveBound );
		}
	};
LineGraphControl.prototype.touchCanel =
	function (e)
	{
		this.touchEnd( e );
	};
LineGraphControl.prototype.touchMove =
	function (e)
	{
		e.preventDefault();
		
		var t1 = e.touches[0];
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (t1.pageX - cbox.left) - 50;
		var oy = (t1.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
	};
LineGraphControl.checkReady =
	function ()
	{
		if ( this.canvas.offsetHeight > 0 )
		{
			clearInterval( this.timer );
			this.resize(false);
			this.owner.updateValue( this.value );
		}
	};
LineGraphControl.prototype.mouseDown =
	function (e)
	{
		e.preventDefault();
		
		if ( this.owner.state ) return;
		
		this.owner.state = true;
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (e.pageX - cbox.left) - 50;
		var oy = (e.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		//console.log( this.owner.value );
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
		
		this.owner.mouseUpBound = this.owner.mouseUp.bind( this );
		this.owner.mouseMoveBound = this.owner.mouseMove.bind( this );
		
		window.addEventListener( "mouseup", this.owner.mouseUpBound );
		window.addEventListener( "mousemove", this.owner.mouseMoveBound );
	};
LineGraphControl.prototype.mouseMove =
	function (e)
	{
		e.preventDefault();
		
		var cbox = this.owner.canvas.getBoundingClientRect();
		var ox = (e.pageX - cbox.left) - 50;
		var oy = (e.pageY - cbox.top) - 50;
		
		this.owner.value = Math.atan( oy / ox );
		if ( ox < 0 ) this.owner.value += Math.PI;
		this.owner.owner.updateValue( this.owner.value );
		this.owner.draw();
	};
LineGraphControl.prototype.mouseUp =
	function (e)
	{
		if ( this.owner.state )
		{
			this.owner.state = false;
		
			var cbox = this.owner.canvas.getBoundingClientRect();
			var ox = (e.pageX - cbox.left) - 50;
			var oy = (e.pageY - cbox.top) - 50;
		
			this.owner.value = Math.atan( oy / ox );
			if ( ox < 0 ) this.owner.value += Math.PI;
			//console.log( this.owner.value );
			this.owner.owner.updateValue( this.owner.value );
			this.owner.draw();
		
			window.removeEventListener( "mouseup", this.owner.mouseUpBound );
			window.removeEventListener( "mousemove", this.owner.mouseMoveBound );
		}
	};
LineGraphControl.prototype.resize =
	function (suppress)
	{
		//this.canvas.style.width = "100%";
		var d = 100; //this.canvas.offsetWidth - this.btnEl.offsetWidth - 5;
		this.canvas.width = d;
		this.canvas.style.width = d + "px";
		this.canvas.style.height = d + "px";
		this.canvas.height = this.canvas.offsetHeight;
		if (!suppress)
		{
			this.draw();
		}
	};
LineGraphControl.prototype.draw =
	function ()
	{
		this.ctx.clearRect( 0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight );
		this.ctx.strokeStyle = "#000";
		//this.ctx.lineWidth = Math.PI;
		this.ctx.beginPath();
		this.ctx.moveTo( 50, 50 );
		this.ctx.lineTo( 50, 0 );
		this.ctx.arc( 50, 50, 50, -Math.PI/2, this.value );
		//this.ctx.lineTo( 50 + Math.cos( this.value ) * 50, 50 + Math.sin( this.value ) * 50 );
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
	};
LineGraphControl.prototype.setValue =
	function ( v, updateControl )
	{
		this.value = v /*- Math.PI / 2*/;
		this.owner.updateValue( this.value, updateControl );
		this.draw();
	};

// UNFINISHED
function TextControl( owner, initVal )
{
	this.value = initVal ? initVal : "empty";
	
	this.owner = owner;
	this.htmlEl = $e( "div" );
	
	this.input = $e("input");
	this.input.className = "TextControlEl";
	this.input.owner = this;
	this.input.value = this.value;
	
	this.htmlEl.appendChild( this.input );
	
	this.input.addEventListener( "change", function (e) { this.owner.setValue( this.owner.owner.getControlValue( e.target.value ), true ); } );
}
TextControl.prototype.draw =
	function ()
	{
		console.log( "pointless draw" );
	};
TextControl.prototype.setValue =
	function ( v )
	{
		//console.log( "tc sv", v );
		this.value = v;
		this.input.value = this.owner.getOutValue( v );
		this.owner.updateValue( v );
	};

/**************************/

function BorderlessTab( owner, contents, initVal )
{
	this.htmlEl = $e( "div" );
	
	this.tabs = [];
	
	//console.log( "iv", initVal );
	
	for ( i in contents )
	{
		var c = contents[i];
		var n = new c( owner, initVal );
		/*var osv = c.setValue;
		var uf = function ( nv ) { osv( nv ); this.updateAll( nv ) };
		c.setValue = uf;*/
		
		this.tabs.push( n );
		n.htmlEl.style.display = "none";
		this.htmlEl.appendChild( n.htmlEl );
	}
	
	Object.defineProperty( this, "tabIndex",
		{
			get: function () { return this.tabIndexValue; },
			set:
				function (v)
				{
					//console.log( "set", this.tabIndexValue, v, this.tabIndexValue != undefined, this );
					if ( this.tabIndexValue != undefined )
						this.tabs[ this.tabIndexValue ].htmlEl.style.display = "none";
					this.tabs[ v ].htmlEl.style.display = "block";
					this.tabIndexValue = v;
				}
		} );
	
	this.tabIndex = 0;
}

function DialogResponse( ok, val )
{
	this.ok = ok;
	this.val = val;
}

function MultiCtrlDialog( owner, ctrls )
{
	this.cacheVal = owner.getControlValue( owner.getDisplayValue() );
	
	this.htmlEl = $e( "div" );
	this.htmlEl.style.position = "absolute";
	this.htmlEl.style.width = "100%";
	this.htmlEl.style.height = "100%";
	this.htmlEl.style.zIndex = "10";
	this.htmlEl.style.backgroundColor = "rgba( 255, 255, 255, 0.5 )";
	
	this.holder = $e( "div" );
	this.holder.style.width = "80%";
	this.holder.style.margin = "3em auto";
	
	this.selectEl = $e( "select" );
	this.selectEl.owner = this;
	
	this.selectEl.addEventListener( "change",
		function (e)
		{
			this.owner.tab.tabIndex = this.selectedIndex;
			//console.log( "owner", owner );
			//console.log( "cTab", this.owner.tab.tabs[this.owner.tab.tabIndex] );
			this.owner.tab.tabs[this.owner.tab.tabIndex].setValue( owner.getControlValue( owner.getDisplayValue() ) );
		} );
	
	for ( var i in ctrls )
	{
		var c = ctrls[i];
		var n = $e( "option" );
		n.innerHTML = c.name;
		this.selectEl.appendChild( n );
	}
	
	this.holder.appendChild( this.selectEl );
	
	this.tab = new BorderlessTab( owner, ctrls, owner.getDisplayValue() );
	
	this.holder.appendChild( this.tab.htmlEl );
	
	this.okBtn = $e( "input" );
	this.okBtn.type = "button";
	this.okBtn.value = "OK";
	this.okBtn.owner = this;
	//console.log( "thing", this.tab.tabs[ this.selectEl.selectedIndex ] );
	this.okBtn.addEventListener( "click",
		function (e)
		{
			var nc = this.owner.tab.tabs[ this.owner.selectEl.selectedIndex ];
			owner.htmlEl.replaceChild( nc.htmlEl, owner.control.htmlEl );
			owner.control = nc;
			if ( nc.startCheck )
				nc.startCheck();
			this.owner.close();
		} );
	
	this.cancelBtn = $e( "input" );
	this.cancelBtn.type = "button";
	this.cancelBtn.value = "Cancel";
	this.cancelBtn.owner = this;
	this.cancelBtn.addEventListener( "click", function (e) { console.log( "???", owner, this.owner ); owner.updateValue( this.owner.cacheVal, true ); this.owner.close(); } );
	
	this.holder.appendChild( this.okBtn );
	this.holder.appendChild( this.cancelBtn );
	
	this.htmlEl.appendChild( this.holder );
}
MultiCtrlDialog.prototype.close =
	function ()
	{
		Nugo.codeList.show();
		document.body.removeChild( this.htmlEl );
	};