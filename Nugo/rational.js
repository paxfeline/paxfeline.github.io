// merge into util.js?

function integerNumber( n )
{
	// probably more accurately this would be called wholeNumber
	// or nonNegativeIntegerNumber, i.e. { 0, 1, 2... }
	
	this.factors = [];
	
	// a special boolean property tracks if the number is 0.
	if ( n == 0 )
	{
		this.zero = true;
		return;
	}
	
	// factor the number
	for ( var i = 2; i <= n / 2; i++ )
	{
		while ( n % i == 0 )
		{
			this.factors.push( i );
			n /= i;
		}
	}
	if ( n > 1 )
		this.factors.push( n );
}
integerNumber.prototype.toString =
	function ()
	{
		if ( this.zero ) return "0";
		var r = 1;
		for ( var i = 0; i < this.factors.length; i++ )
			r *= this.factors[i];
		return r;
	};

function rationalNumber( n )
{
	console.log( "make rat", n );
	
	n = new String( n );
	
	this.sign = true; // positive
	
	var a;
	var b;
	
	//alert( "1:" + n );
	
	if ( n.split )
	{
		n = n.split( "(" ).join( "" );
		n = n.split( ")" ).join( "" );
	}
	
	//alert( "2:" + n );
	
	while ( n.indexOf && n.indexOf( "-" ) == 0 )
	{
		this.sign = !this.sign;
		n = n.substr( 1 );
	}
	
	//alert( "3:" + n );

	if ( n.indexOf && n.indexOf( "/" ) >= 0 )
	{
		var arr = n.split( "/" );
		a = arr[0];
		b = arr[1];
	}
	else
	{
		var r = n - Math.floor(n);
		if ( r > 0 )
		{
			// if there's a decimal, round it into a fraction
			var s = n.toFixed(3) * 1000;
			a = s;
			b = 1000;
		}
		else
		{
			a = n;
			b = 1;
		}
	}
	
	//alert( "4:" + n );
	
	this.a = new integerNumber( a );
	this.b = new integerNumber( b );
	this.reduce();
	
	console.log( "make rat 2", this );
}
rationalNumber.prototype.toString =
	function ()
	{
		if ( this.a.zero ) return "0";
		//console.log( "rat toString", this.a );
		if ( this.b.factors.length == 0 )
			return (!this.sign ? "-" : "" ) + this.a.toString();
		else
			return (!this.sign ? "-" : "" ) + "(" + this.a + "/" + this.b + ")";
	};
// return the decimal approximation
rationalNumber.prototype.decimal =
	function ()
	{
		if ( this.a.zero ) return "0";
		//console.log( "rat toString", this.a );
		if ( this.b.factors.length == 0 )
			return (!this.sign ? "-" : "" ) + this.a.toString();
		else
			return (!this.sign ? "-" : "" ) + (this.a / this.b);
	};
// return a new rationalNumber, b / a
rationalNumber.prototype.invert =
	function ()
	{
		var inv = new rationalNumber( this.toString() );
		var temp = inv.a;
		inv.a = inv.b;
		inv.b = temp;
		//console.log( "inv", this, inv );
		return inv;
	};
// return a new rationalNumber, this * m = (this.a * m.a) / (this.b * m.b)
rationalNumber.prototype.multiplyBy =
	function ( m )
	{
		if ( this.a.zero || m.a.zero ) return new rationalNumber( "0" );
			
		var r = new rationalNumber( this.toString() );
		r.a.factors = r.a.factors.concat( m.a.factors );
		r.b.factors = r.b.factors.concat( m.b.factors );
		r.reduce();
		//console.log( "mult", this, m, r );
		r.sign = (this.sign == m.sign);
		return r;
	};
// return a new rationalNumber, this * (1/m) = (this.a * m.b) / (this.b * m.a)
rationalNumber.prototype.divideBy =
	function ( m )
	{
		if ( this.a.zero ) return new rationalNumber( "0" );
		
		return this.multiplyBy( (new rationalNumber( m.toString() )).invert() );
	};
// return a new rationalNumber
// (this + m) is equivalent to (this.a * m.b + m.a * this.b) / (this.b * m.b)
rationalNumber.prototype.add =
	function ( m )
	{
		var l = new integerNumber( this.a.toString() );
		var r = new integerNumber( m.a.toString() );
		
		l.factors = l.factors.concat( m.b.factors );
		r.factors = r.factors.concat( this.b.factors );
		
		var d = new integerNumber( "1" );
		
		d.factors = d.factors.concat( this.b.factors );
		d.factors = d.factors.concat( m.b.factors );
		
		console.log( "sum", l, r, d );
		
		var lv = new Number( l );
		var rv = new Number( r );
		
		if ( ! this.sign ) lv *= -1;
		if ( ! m.sign ) rv *= -1;
		
		console.log( "add ", lv, rv, m );
		var sum = new rationalNumber( "1" );
		sum.a = new integerNumber( Math.abs( lv + rv ) ); // add
		sum.b = d;
		
		sum.reduce();
		
		// account for the sign of the sum
		sum.sign = (lv + rv >= 0);
		
		return sum;
	};
// reduce fraction by removing factors appearing in this.a and this.b
// the value of one (1) is empty factor arrays for both:
// this.a.factors = this.b.factors = Ø
rationalNumber.prototype.reduce =
	function ()
	{
		//console.log( "reduce 1", this );
		for ( var i = this.b.factors.length - 1; i >= 0; i-- )
		{
			for ( var j = this.a.factors.length - 1; j >= 0; j-- )
			{
				if ( this.b.factors[i] == this.a.factors[j] )
				{
					this.b.factors.splice( i, 1 );
					this.a.factors.splice( j, 1 );
				}
			}
		}
		//console.log( "reduce 2", this );
	};


/*var A = new rationalNumber( "28/7" );
var B = new rationalNumber( "-5/7" );
var C = A.add( B );

alert( C );*/