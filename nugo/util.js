if ( !$ ) var $ = function( x ) { return document.getElementById(x); }; else console.log( "$", $ );
if ( !$e ) var $e = function( x ) { return document.createElement(x); }; else console.log( "$e", $e );
if ( !$t ) var $t = function( x ) { return document.createTextNode(x); }; else console.log( "$t", $t );

function angToRad(x)
{
	return x * (Math.PI / 180);
}

function getBaseLog(base, x)
{
	return Math.log(x) / Math.log(base);
}