function langNode( op, l, r, valence, prepost )
{
	this.op = op;
	this.l = l;
	this.r = r;
	this.val = valence;
	this.prepost = prepost;
	
	//alert( "lN:\n" + enumerate(this) );
}

function langParse( lang )
{
	this.lang = lang;

	this.tokenize = function ( code )
	{
		var tokens = [];
		var lastStart = 0;
		var codePos = 0;
		
		code = lang.preprocess( code );
		
		//alert( code );
		
		/* kinds:
				str - any alphanumeric string
				op - operator
				num - number literal
				lit - string literal */
		
		// tokenize
		
		top:
		do
		{
			// skip whitespace
			
			if ( isWhite( code.substr( codePos, 1 ) ) )	
			{
				//debugOut( 'white0:' + code.substr( codePos, 1 ) + "/" + lastStart + ":" + codePos );

				if ( codePos > lastStart && codePos > 0 )
				{
					//debugOut( 'white:' + code.substring( lastStart, codePos ) );
					
					var strtoadd = code.substring( lastStart, codePos );
					
					var ntype = "str";
					if ( this.lang.opFuncMap[ strtoadd ] ) ntype = "op";
					
					tokens.push( [ ntype, strtoadd ] );
				}
				
				do
				{
					codePos++;
				}
				while ( codePos < code.length &&
							isWhite( code.substr( codePos, 1 ) ) )
				
				lastStart = codePos;
			}
		
			// find string literals
			
			if ( code.substr( codePos, 1 ) == "\"" )
			{
				//alert( "quot" );
				
				var nxQuot = 0;
				
				do
				{
					nxQuot = code.indexOf( "\"", codePos + nxQuot + 1 );
					
					if ( nxQuot < 0 ) alert ( "string lit error" );
				}
				while ( nxQuot > 0 && code.substr( nxQuot - 1, 1 ) == "\\" );
				
				var slit = code.substring( codePos + 1, nxQuot );
				
				//alert( "string lit: (" + slit + ")" );
							
				tokens.push( [ "lit", slit ] );
				
				codePos = nxQuot + 2;
						
				lastStart = codePos;
				
				//alert( code.substring( codePos ) );
				
				continue top;
			}
			
			// check for operator at codePos
			
			var found = false;

			for ( var resPos = 0; resPos < lang.reserved.length; resPos++ )
			{
				var res = lang.reserved[resPos];
				
				if ( res.length <= code.length - codePos )
				{
					var codeSeg = code.substr( codePos, res.length );
					
					if ( codeSeg == res )
					{
						if ( codePos > 0 && codePos - lastStart > 0 )
						{
							/*debugOut( 'codeseg:' + codeSeg + "/" + res +
									"/" + lastStart + ":" + codePos );*/
					
							var strtoadd = code.substring( lastStart, codePos );
							
							var ntype = "str";
							if ( this.lang.opFuncMap[ strtoadd ] ) ntype = "op";
							
							tokens.push( [ ntype, strtoadd ] );
						}
						
						tokens.push( [ 'op', res, resPos ] );
					
						codePos += res.length;
						
						lastStart = codePos;
						
						found = true;
						break;
					}
				}
			}
			
			if ( !found )
				codePos++;
		}
		while ( codePos < code.length );
		
		codePos--;
		if ( codePos > lastStart )
		{
			var strtoadd = code.substring( lastStart );
			
			var ntype = "str";
			if ( this.lang.opFuncMap[ strtoadd ] ) ntype = "op";
			
			tokens.push( [ ntype, strtoadd ] );
		}
		
		tokens = lang.postprocess( tokens );
		
		//alert( ":\n" + enumerate(tokens) );
		
		return tokens;
	};
	
	this.structLineOOP = function ( line )
	{
		var firstop = -1;
		var ls, rs, uo;
		
		var dir;
		var prepost;
		var val;

		//debugOut( "sLOOP start" );
		
		// built in functions
		
		var funcInd = -1;
		
		// could be more efficient?
		do
		{
			for ( var fi = 0; fi < this.lang.builtInFuncs.length; fi++ )
			{
				funcInd = sIndOf( line, this.lang.builtInFuncs[fi][0], -1 );
				if ( funcInd >= 0 )
				{
					//alert( "func found?: " + funcInd + "/" + this.lang.builtInFuncs[fi][0] );
					
					// should do error check
					var rn = new langNode( ["ifunc", line[funcInd][1]], null, line[funcInd + 1] );
					
					line.splice( funcInd, 2, rn );
					
					break;
				}
			}
		}
		while ( funcInd >= 0 );
		
		// user functions:
		
		funcInd = -1;
		
		do
		{
			for ( var fi = 0; fi < this.lang.funcReg.length; fi++ )
			{
				funcInd = sIndOf( line, this.lang.funcReg[fi].name, -1 );
				if ( funcInd >= 0 )
				{
					//debugOut( "func found?: " + funcInd + "/" + this.lang.funcReg[fi].name );
					
					// should do error check
					var rn = new langNode( ["func", line[funcInd][1]], null, line[funcInd + 1] );
					
					line.splice( funcInd, 2, rn );
					
					break;
				}
			}
		}
		while ( funcInd >= 0 );
		
		// operators:
		
		while ( line.length > 1 )
		{
			//debugOut( "sLOOP: " + line );
		
			for ( var i = 0; i < this.lang.operators.length; i++ )
			{
				firstop = -1;
				
				dir = this.lang.direction[i];
				prepost = this.lang.opPrePost[i];
				
				for ( var j = 0; j < this.lang.operators[i].length; j++ )
				{
					ls = null; rs = null; uo = null;
					
					var tind = sIndOf( line, this.lang.operators[i][j], dir );
						
					//debugOut( "found?: " + tind + " dir: " + dir + " fo: " + firstop );
					
					if ( tind >= 0 && (firstop < 0 ||
							( (dir == 1 && (firstop >= 0 && tind > firstop))
								|| (dir == -1 && (firstop >= 0 && tind < firstop)) ) ) )
					{
						val = this.lang.opValence[i][j];
						
						/*alert( "found (" + this.lang.operators[i][j] + ")?: " + tind + " dir: " + dir + " fo: " + firstop +
								"\nval: " + val + " prepost: " + prepost +
								"\n" + enumerate(line) );*/
						
						if ( ( val == 'u' &&
								( ( prepost == 1 && tind + 1 < line.length &&
										((tind - 1 >= 0 && line[tind - 1][0] == "op") ||
											tind - 1 < 0) ) ||
									( prepost == -1 && tind - 1 >= 0 &&
								 		((tind + 1 < line.length && line[tind + 1][0] == "op") ||
											tind + 1 >= line.length) ) ) ) ||
							( val == 'b' && tind - 1 >= 0 && tind + 1 < line.length ) )
						{
							//alert( "found2: " + line[tind][1] + ", " + tind );
							if ( firstop < 0 ||
									(dir == 1 && tind >= 0 && tind < firstop) ||
											(dir == -1 && tind > firstop) )
								firstop = tind;
						}
					}
				}
				if ( firstop >= 0 )
					break;
			}
			
			if ( firstop >= 0 )
			{
				var l = (firstop > 0) ? line[firstop - 1] : null;
				var r = (firstop + 1 < line.length) ? line[firstop + 1] : null;
				
				//alert( "firstop " + line[firstop] + ": " + l + "/" + r + "\n" + enumerate(line) );
				
				var rn = new langNode( line[firstop], l, r, val, prepost );
				
				debugOut( "sloop rn: " + firstop + " v: " + val + " d: " + dir );
				//alert( "sloop r2: " + l + "/" + line[firstop] + "/" + r );
				
				if ( val == 'u' )
				{
					if ( prepost == 1 )
						line.splice( firstop, 2, rn );
					else
						line.splice( firstop - 1, 2, rn );
				}
				else
					line.splice( firstop - 1, 3, rn );
							
				//alert( "sLOOP after: " + line );
			}
			else
			{
				alert( "error: un-parsable line: " + enumerate(line) );
				break; // debugOut( "firstop = -1, break?" );
			}
				
			
		} // while line.length > 1
		
		//alert( "sloop OUT: " + enumerate( line[0] ) );
		
		return line[0];
	};
	
	this.structGetBlock = function ( code, ind, endTok )
	{
		var cblock = [];
		
		//debugOut( "sGB entered: " + enumerate( cblock ) );
		
		outer:
		while ( ind.ind < code.length &&
				((endTok && code[ ind.ind ][1] != endTok) || !endTok ) )
		{
			var line = [];
			
			while ( ind.ind < code.length &&
					code[ ind.ind ][1] != ";" )
			{
				var oppar = this.lang.parens[ code[ ind.ind ][1] ];
				var opstruc = this.lang.flow[ code[ ind.ind ][1] ];
				
				//debugOut( "sGB struct check: " + opstruc );
				
				if ( endTok && code[ ind.ind ][1] == endTok )
				{
					if ( line.length > 0 )
					{
						var sl = this.structLineOOP( line );
						//debugOut( "sGB line: " + sl );
						cblock.push( sl );
						//debugOut( "sGB cblock: " + cblock[ cblock.length - 1 ] );
						line = [];
					}
					
					break outer;
				}
				else if ( oppar )
				{
					//debugOut( "sGB parens: " + oppar + "/" + code[ ind.ind ][1] );
					ind.ind++;
					
					var subcblock = this.structGetBlock( code, ind, oppar );
					
					//debugOut( "sGB cblock after: " + subcblock );
					
					ind.ind++;
					
					var cover = null;
					if ( subcblock.length == 1 )
						cover = subcblock[0];
					else
						cover = { paren: oppar, code: subcblock };
					line.push( cover );
				}
				else if ( opstruc )
				{
					var struc = code[ ind.ind ][1];
					ind.ind++;
					
					debugOut( "sGB flow: " + opstruc + "/" + struc );
					
					var cond = null;
					
					switch ( struc )
					{
					case "if":
					case "while":
					case "for":
						var ec = this.lang.parens[ code[ ind.ind ][1] ];
						ind.ind++;
						debugOut( "ec1: " + ec );
						var constrc = this.structGetBlock( code, ind, ec );
						debugOut( "ec2: " + enumerate(constrc[0]) );
						if ( Array.isArray( constrc ) )
							cond = constrc[0];
						ind.ind++;
						break;
					}
					
					var subcblock = this.structGetBlock( code, ind, opstruc );
					ind.ind++;
					
					if ( struc == "do" )
					{
						var ec = this.lang.flow[ struc ];
						debugOut( "ec: " + this.lang.flow[ struc ] + "/"
										+ struc );
						ind.ind++;
						cond = this.structGetBlock( code, ind, ec );
						ind.ind++;
					}
					
					//debugOut( "sGB cblock after: " + subcblock );
					
					var cover = { struc: struc, code: subcblock, cond: cond };
					line.push( cover );
				}
				else
				{
					//debugOut( "sGB: adding: " + code[ ind.ind ][1] );
					
					line.push( code[ ind.ind ] );
					ind.ind++;
				}
			}
			ind.ind++; // skip ;
			
			if ( line.length > 0 )
			{
				var sl = this.structLineOOP( line );
				//debugOut( "sGB: line: " + sl );
				cblock.push( sl );
				//debugOut( "sGB cblock: " + cblock[ cblock.length - 1 ] );
			}
		}
		debugOut( "sGB end: " + cblock + "/" + enumerate( cblock ) );
		
		return cblock;
	};
	
	this.structureTokens = function ( code )
	{
		var ind = { ind: 0 };
		
		var root = this.structGetBlock( code, ind, null );
		
		return root;
	};
}