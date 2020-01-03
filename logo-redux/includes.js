/* util */

// thanks to Brian Huisman and Mark 'Tarquin' Wilton-Jones for the
// following http://my.opera.com/GreyWyvern/blog/show.dml/1725165:
/*Object.prototype.clone = function()
{
	var newObj = (this instanceof Array) ? [] : {};
	for ( i in this )
	{
		if ( i == 'clone' ) continue;
		if ( this[i] && typeof this[i] == "object" )
			newObj[i] = this[i].clone();
		else
			newObj[i] = this[i];
  }
  return newObj;
};*/

function gClone( wha )
{
	var newObj = (wha instanceof Array) ? [] : {};
	for ( i in wha )
	{
		if ( wha[i] && typeof wha[i] == "object" )
			/*if ( wha[i].clone && typeof wha[i].clone == "function" )
				newObj[i] = wha[i].clone();
			else*/
				newObj[i] = gClone( wha[i] );
		else
			newObj[i] = wha[i];
	}
	return newObj;
}

function sIndOf( searchar, key, dir )
{
	if ( isNaN( searchar.length ) ) return -1;
	var s, e;
	if ( dir == 1 )
	{
		s = 0;
		e = searchar.length;
	}
	else
	{
		s = searchar.length - 1;
		e = -1;
	}
	
	/*debugOut( "sIndOf: s=" + s + ", e=" + e + ", d=" + dir + ", key=" + key +
										"\nin: " + enumerateX(searchar,0) );*/
	
	var i;
	for ( i = s; i != e; i += dir )
	{
		/*debugOut( "sIndOf: key=" + key + "/" +
					((Array.isArray( searchar[i] )) ? searchar[i][1] : "NaA") );*/
					
		if ( Array.isArray( searchar[i] ) &&
				searchar[i][1] == key )
			return i;
	}
	
	return -1;
}

function getToEnd( tok, st, out, lang, start, et )
{
	var pc = 1;
	var opPar = start; //tok[st - 1][1];
	
	//debugOut( 'gte1:' + tok[st - 1][1] );
	
	//var et = lang.parens[ opPar ];
	
	while ( pc > 0 )
	{
		if ( tok[st][1] == opPar ) pc++;
		if ( tok[st][1] == et ) pc--;
		//alert( 'gte: ' + tok[st] + '/' + et + '/' + "=" + pc );
		
		if ( pc > 0 )
			out.push( tok[st] );
		
		st++;
	}
	
	//debugOut( 'gteZ: ' + enumerateX(out,0) );
	
	return st;
}

function enumerateX( o, indent )
{
	var r = ""; // "(" + o + " ) ";
	
	if ( (o+"").indexOf( "HTML" ) >= 0 ) return "GRR";

	if ( !o ) r = "enumerate error: o is NULL";
	if ( indent > 20 ) return "TOOMUCH";
	for (var p in o)
	{
		if ( o.hasOwnProperty(p) )
		{
			for ( var sc = 0; sc < indent; sc++ ) r += "    ";
			
			if ( typeof(o[p]) == 'object' )
			{
				r += p + "=[\n" + enumerateX( o[p], indent + 1 );
				for ( var sc = 0; sc < indent; sc++ ) r += "    ";
				r += "]\n";
			}
			else if ( o[p] )
			{
				r += (p + "=" + o[p] + "\n" );
			}
			else
				r += (p + "=NULLsville\n" );
		}
	}
	return r;
}

function enumerate( o )
{
	//return 42;
	return enumerateX( o, 0 );
}

function isWhite(c)
{
	if ( c.length > 1 ) c = c.substr( 0, 1 );
	return (c == ' ' || c == '\n' || c == '\t');
}

function findKey(a,b)
{
	for ( var i in b )
	{
		//debugOut( "findkey:" + a + "/" + b + "/" + i );
		if ( b[i] == a )
			return i;
	}
	return null;
}

var gdebug = false;

function debugOut(o)
{
	if ( gdebug )
		document.getElementById( "outfield" ).value += o + "\n----\n";
	return;
}


function lineLength( x1, y1, x2, y2 )
{
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.sqrt( (dx * dx) + (dy * dy) );
}

/*function AinB2(a, b)
{
	if ( a == undefined ) return false;
	
	for ( var i in b )
	{
		for ( var ii in i )
		{
			if ( ii == a )
				return true;
		}
	}
	
	return false;
}*/

function makePoint( x, y )
{
	return { "x": x, "y": y };
}

function lineLength( x1, y1, x2, y2 )
{
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.sqrt( (dx * dx) + (dy * dy) );
}