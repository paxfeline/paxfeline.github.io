function lBasicLangDef()
{
	this.funReg = {};
	
	this.preprocess = function ( code )
	{
		// strip out comments
		
		while ( code.indexOf( '//' ) >= 0 )
		{
			var comInd = code.indexOf( '//' );
			var endInd = code.indexOf( '\n', comInd );
			
			if ( endInd >= 0 )
				code = code.substring( 0, comInd ) + code.substr( endInd );
			else
				code = code.substring( 0, comInd )
		}
		
		while ( code.indexOf( '/*' ) >= 0 )
		{
			var comInd = code.indexOf( '/*' );
			var endInd = code.indexOf( '*/', comInd );
			
			if ( endInd >= 0 )
				code = code.substring( 0, comInd ) + code.substr( endInd + 2 );
			else
				code = code.substring( 0, comInd )
		}
		
		//alert( code );
		
		// string literals
		
		// tighten newlines
		
		// replace newlines with semicolons
		var re = /\n/gi;
		code = code.replace(re, ";");
		
		while ( code.indexOf( ";;" ) >= 0 ) code = code.replace( ";;", ";" );
		
		//alert( "tight?\n" + code );
		
		return code;
	};
	
	this.postprocess = function ( tokens )
	{
		// find numbers
		
		for ( var i = 0; i < tokens.length; i++ )
		{
			var n = 0;
			var l = 0;
			
			if ( !isNaN( parseInt( tokens[i][1] ) ) /*&& !isNaN( tokens[i][1] )*/ )
			{
				//debugOut( "num? " + tokens[i][1] );
				n = tokens[i][1] - 0;
				
				tokens[i][0] = "num";
				
				if ( i + 1 < tokens.length && tokens[i+1][1] == "." )
				{
					l = 1;
					
					if ( i + 2 < tokens.length && !isNaN( tokens[i+2][1] ) )
					{
						l = 2;
						
						n += ("." + tokens[i+2][1]);
						n -= 0;
						
						//debugOut( "after dec: " + tokens[i+2][1] + "/" + n );
					}
					
					tokens.splice( i + 1, l );
				}
					
				tokens[i][1] = n;
			}
		}
		
		return tokens;
	};
	
	this.getFuncs = function ( tok )
	{
		this.funcReg = [];
		
		var pos = { ind: 0 };
		
		//alert( "1: " +  pos.ind + "\n" + enumerate(tok) );
		
		while ( tok[ pos.ind ][1] == ";" ) pos.ind++;
		
		//alert( "2: " +  pos.ind + "\n" + enumerate(tok) );
		
		while ( pos.ind < tok.length )
			this.getFunc( tok, pos );
		
		//alert( enumerate( this.funcReg ) );
	};
	
	this.getFunc = function ( tok, pos )
	{
		while ( pos.ind < tok.length && tok[ pos.ind ][1] == 'function' )
		{
			pos.ind++;
			
			var ret = { name: '', param: [], code: [] };
			
			if ( pos.ind < tok.length )
				ret.name = tok[pos.ind][1];
			else
				alert( "function name expected" );
			
			pos.ind++;
			
			if ( pos.ind < tok.length && tok[ pos.ind ][1] == '(' )
			{
				pos.ind++; // skip ( char
				
				//alert( "M!" + pos.ind + "\n" + tok );
				pos.ind = getToEnd( tok, pos.ind, ret.param, this, "(", ")" );
				//alert( "O!" + pos.ind + "\n" + enumerate(tok) );
				
				// to do: undo stupid white-space extraction:
				while ( pos.ind < tok.length && tok[ pos.ind ][1] == ';' ) pos.ind++;
			}
			else
				alert( "function expected" );
			
			if ( pos.ind < tok.length )
			{
				pos.ind = getToEnd( tok, pos.ind, ret.code, this, "function", "endfunc" );
				
				//debugOut( 'code:' + enumerateX(ret.code,0) );
				
				//debugOut( 'func out:' + enumerateX(ret,0) );
			
				this.funcReg.push( ret );
			}
			else
				alert( "function expected" );
			
			if ( pos.ind < tok.length && tok[ pos.ind ][1] == ';' ) pos.ind++;
		}
	};
	
	// non-alpha-numeric operators -- for ease

	this.reserved = [ // not including reserved words
		'=>>',
		'<<=',
		
		'->',
		'>=',
		'<=',
		'==',
		'!=',
		'++',
		'--',
		'+=',
		'-=',
		'*=',
		'/=',
		'%=',
		'^=',
		'|=',
		'>>',
		'<<',
		'&&',
		'||',
		'//',
		'/*',
		'*/',
		
		'=',
		'+',
		'-',
		'*',
		'/',
		'%',
		'&',
		'|',
		'?',
		':',
		',',
		'!',
		'#',
		
		'{',
		'}',
		'(',
		')',
		'[',
		']',
		'<',
		'>',
		'~',
		'.',
		';',
		
		// escaped
		'\"',
		'\'',
		'\\'
		
		/* uncertain if needed or appropriate
		'@',
		'`'
		*/
	];
	
	/**********************************************************************************/
	// operators

	this.direction = [
		1,  // 1 		 1 = ltr
		-1, // 2		-1 = rtl
		1,  // 3
		1,  // 4
		1,  // 5
		1,  // 6
		1,  // 7
		1,  // 8
		1,  // 9
		1,  // 10
		1,  // 11
		1,  // 12
		1,  // 13
		-1, // 14
		1, // 14.5
		1,  // 15
		1,  // 16
		1  // 17
	];

	this.operators = [
		[ '++', '--', '.', '->'/*, ')', ']'*/ ],								// 1
		
		[ '++', '--', '+', '-', '!', 'not', '~', /*')',*/ '*', '&', 'sizeof' ],		// 2
		
		[ '*', '/', '%' ],													// 3
		[ '+', '-' ],														// 4
		[ '<<', '>>' ],														// 5
		[ '<', '>', '<=', '>=' ],											// 6
		[ '==', '!=' ],														// 7
		[ '&' ],															// 8
		[ '^' ],															// 9
		[ '|' ],															// 10
		[ '&&', "and" ],														// 11
		[ '||', "or" ],															// 12
		[ ['?',':'] ],															// 13
		
		[ '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '^=', '|=' ],	// 14
		
		[ 'var' ],													// post-14, pre-15
		
		[ ',' ],																// 15
		
		[ 'pu', 'pd', 'fd', 'bk', 'rt', 'lt', 'setWeight', 'ht', 'st', 'home',
			'setAngle', 'setX', 'setY', 'setSpeed', 'setPPF', 'setAPF' ],		// 16
		
		[ 'return' ]															// 17
	];

	this.opValence = [ // v for valence
		[ 'u', 'u', 'b', 'b'/*, 'u', 'u'*/ ],
		[ 'u', 'u', 'u', 'u', 'u', 'u', 'u', /*'u',*/ 'u', 'u', 'u' ],
		[ 'b', 'b', 'b' ],
		[ 'b', 'b' ],
		[ 'b', 'b' ],
		[ 'b', 'b', 'b', 'b' ],
		[ 'b', 'b' ],
		[ 'b' ],
		[ 'b' ],
		[ 'b' ],
		[ 'b', 'b' ],
		[ 'b', 'b' ],
		[ 't' ], // trinary
		
		[ 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b' ],
		
		[ 'u' ],															// 14.5
		
		[ 'b' ],
		
		[ 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u',
				'u', 'u', 'u', 'u', 'u', 'u' ],								// 16
		
		[ 'u' ]
	];

	this.opPrePost = [ // only applies to unary operators
		'-1',
		'1' ,
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
		'', // trinary
		
		'',
		
		'1',															// 14.5
		
		'',
		
		'1',								// 16
		
		'1'
	];

	this.opFuncMap = {
		';' : "TBD",
		
		'=>>' : "TBD",
		'<<=' : "TBD",
		
		'->' : "TBD",
		'=>' : "TBD",
		'<=' : "TBD",
		'*=' : "TBD",
		'/=' : "TBD",
		'+=' : "TBD",
		'-=' : "TBD",
		'&=' : "TBD",
		'%=' : "TBD",
		'|=' : "TBD",
		'^=' : "TBD",
		'&&' : "TBD",
		"and": "TBD",
		'||' : "TBD",
		"or" : "TBD",
		'++' : "TBD",
		'--' : "TBD",
		'<<' : "TBD",
		'>>' : "TBD",
	
		'.' : "TBD",
		
		'+' : "TBD",
		'-' : "TBD",
		'*' : "TBD",
		'/' : "TBD",
		'=' : "TBD",
		',' : "TBD",
		
		'\\': "TBD",
		'#' : "TBD",
		'<' : "TBD",
		'>' : "TBD",
		'!' : "TBD",
		'not': "TBD",
		'&' : "TBD",
		'|' : "TBD",
		'~' : "TBD",
		'^' : "TBD",
		'?' : "TBD",
		':' : "TBD",
		'%' : "TBD",
		
		'var' : "TBD",
		'if': "TBD",
		'then': "TBD",
		'do': "TBD",
		'while': "TBD",
		'wend': "TBD",
		'loop': "TBD",
		'for': "TBD",
		'next': "TBD",
		
		'fd': "TBD",
		'bk': "TBD",
		'rt': "TBD",
		'lt': "TBD",
		'pu': "TBD",
		'pd': "TBD",
		'setWeight': "TBD",
		'ht': "TBD",
		'st': "TBD",
		'home': "TBD",
		'setAngle': "TBD",
		'setX': "TBD",
		'setY': "TBD",
		'setSpeed': "TBD",
		'setPPF': "TBD",
		'setAPF': "TBD",
		
		'sizeof' : "TBD",
		'return' : "TBD"
	};

	this.parens = {
		'{' : '}',
		'(' : ')',
		'[' : ']',
		//'<' : '>' not normally used -- confusing with < and > operators
	};
	
	this.flow = {
		'if': 'end',
		'while': 'wend',
		'for': 'next',
		'do': 'loop',
		'function': 'endfunc',
		'repeat': 'loop'
	};
	
	this.builtInFuncs = [
		["alert", alert],
		["sqrt", Math.sqrt ],
		["input", function ( p ) { return prompt( p, "Please enter value" ); } ],
		
		["setColor", null],
		["sin", function( x ) { return Math.sin( x * ( 3.14159 / 180 ) ); } ],
		["cos", function( x ) { return Math.cos( x * ( 3.14159 / 180 ) ); } ]
	];
	
	this.setBIFunc = function( n, f )
	{
		for ( var i = 0; i < this.builtInFuncs.length; i++ )
		{
			if ( this.builtInFuncs[i][0] == n )
			{
				this.builtInFuncs[i][1] = f;
				return;
			}
		}
		debugOut( "setBIFunc error: " + n );
	};
	
	this.escapeChar = '\\';
	
	this.getEscaped = function( e )
	{
		var p = [
			['n', '\n'],
			['t', '\t'],
			['"', '"'],
			["'", "'"]
		];
		
		for ( var i = 0; i < p.length; i++ )
		{
			if ( e == p[0] )
				return p[1];
		}
		
		// if not found
		return String.fromCharCode( e );
	};
}