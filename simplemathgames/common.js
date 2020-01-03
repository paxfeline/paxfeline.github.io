function getById( v )
{
	return document.getElementById( v );
}

function print( v )
{
    getById( "body" ).innerHTML += v + "<br>";
}

function randomInt( min, max )
{
    return Math.floor( Math.random() * (max - min + 1)) + min;
}

function toNum( s )
{
	return s - 0;
}

/* math functions */

function Polynomial()
{
	this.degree = 0;
	this.term = new Array();
}
Polynomial.prototype.toString =
	function ()
	{
		var r = "";
		for ( var i of this.term )
			r += (i + " + ");
		return r;
	};

function Term( xpower, coefficient )
{
	this.xpower = toNum( xpower );
	this.coefficient = toNum( coefficient );
}
Term.prototype.toString = function () { return this.coefficient + "x^" + this.xpower; };

function BasicNumber( magnitude, positive )
{
	this._magnitude = magnitude;
	this._positive = positive;
}
BasicNumber.prototype.setMagnitude =
	function ( m )
	{
		if ( m >= 0 )
			this._magnitude = m;
		else
			alert( "SplitNumber error... I'm confused!" );
	};
BasicNumber.prototype.getMagnitude =
	function ()
	{
		return this._magnitude;
	};
BasicNumber.prototype.flipSign =
	function ()
	{
		this._positive = !this._positive;
	};
BasicNumber.prototype.toString =
	function ()
	{
		return (this.positive ? "+" : "-") + this.magnitude;
	};

/* repeat function */

paxTimer = {};

function repeat( v, t, n )
{
	var delta = (t ? t : 1000);
	
	var timer;
	var f;
	
	if ( n )
	{
		f =
			function ()
			{
				paxTimer[ timer ].paxRepeatFunction.call( window );
				paxTimer[ timer ].paxRepeat--;
				if ( paxTimer[ timer ].paxRepeat <= 0 )
					clearInterval( timer );
			};
	}
	else
		f = v;
	
	timer = setInterval( f, delta );
	
	if ( n )
	{
		paxTimer[ timer ] = {
			paxRepeatFunction: v,
			paxRepeat: n
		};
	}
	
	return timer;
}