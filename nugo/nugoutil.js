function countBrack( t )
{
	var r = 0;
	for ( var i = 0; i < t.length; i++ )
	{
		var n = t.substr( i, 1 );
		if ( n == "[" || n == "]" ) r++;
	}
	return r;
}

console.log( "loading iC" );
function interpretCode( cl, tokAr )
{
	var blockStack = [ cl.cmd[0] ];
	
	//console.log( "--" );
	//console.log( blockStack );
	
	for ( var j in tokAr )
	{
		var tok = tokAr[j];
		var i = 0;
		while ( i < tok.length )
		{
		
			var curt = tok[i];
			var n = countBrack( curt.value );
			if ( curt.type == "text" && n == 0 )
			{
				i++;
				continue;
			}
				
			i += 2;
			var curv = tok[i];
			/*console.log( curt );
			console.log( curv );
			console.log( "--" );*/
			var r;
			if ( curt.value.toLowerCase() == "repeat" )
			{
				console.log( blockStack[0] instanceof CodeList );
				r = new CodeBlock( blockStack[0], "Repeat", null );
				r.control.value = r.getControlValue( curv.value );
				i++;
				blockStack[0].addCommand( r );
				blockStack.unshift( r );
			}
			else if ( curt.value.toLowerCase() == "fd" )
			{
				r = new TurtleCommand_Forward( Nugo.arena, blockStack[0] );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "bk" )
			{
				r = new TurtleCommand_Forward( Nugo.arena, blockStack[0] );
				r.invert( "Back", "BK" );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "rt" )
			{
				r = new TurtleCommand_Right( Nugo.arena, blockStack[0] );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "lt" )
			{
				r = new TurtleCommand_Right( Nugo.arena, blockStack[0] );
				r.invert( "Turn Left", "LT" );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "pensize" )
			{
				r = new TurtleCommand_LineWidth( Nugo.arena, blockStack[0] );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "pencolor" )
			{
				r = new TurtleCommand_PenColor( Nugo.arena, blockStack[0] );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				r.control.setValue( r.getControlValue( curv.value ) );
			}
			else if ( curt.value.toLowerCase() == "home" )
			{
				r = new TurtleCommand_Home( Nugo.arena, blockStack[0] );
				//console.log( "curv: " + r.getControlValue( curv.value ) );
				blockStack[0].addCommand( r );
				i -= 2;
			}
			else if ( curt.value.toLowerCase() == "pu" )
			{
				r = new TurtleCommand_PenUp( Nugo.arena, blockStack[0] );
				blockStack[0].addCommand( r );
				i -= 2;
			}
			else if ( curt.value.toLowerCase() == "pd" )
			{
				r = new TurtleCommand_PenDown( Nugo.arena, blockStack[0] );
				blockStack[0].addCommand( r );
				i -= 2;
			}
			else
			{
				console.log( "brack count:" + countBrack( curt.value ) );
				//console.log( blockStack );
				for ( ; n > 0; n-- )
					blockStack.shift();
				//console.log( blockStack );
			}
			i += 2;
		}
	}
}