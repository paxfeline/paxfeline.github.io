function langVis( outOutDiv, runButDiv )
{
	this.outOutDiv = outOutDiv;
	this.runtime = null;
	
	this.stepFunc = null;
	
	this.setRuntime = function ( rt ) { runtime = rt; };
	
	this.divIdCounter = 0;
	
	this.createDiv = function ( html, border )
	{
		var nl = document.createElement( 'div' );
		
		nl.id = this.divIdCounter;
		this.divIdCounter++;
		
		if ( border )
		{
			nl.style.borderWidth = '1px';
			nl.style.borderStyle = 'solid';
			nl.style.borderColor = 'black';
		}
		
		nl.innerHTML = html;
		
		debugOut( "createDiv id: " + nl.id + "\n" + html );
		
		return nl;
	};
	
	this.createIlDiv = function ( html, border )
	{
		var nl = this.createDiv( html, border );
		
		nl.style.display = "inline-block";
		
		return nl;
	};
	
	this.createTextDiv = function ( html )
	{
		var nl = this.createDiv( html, false );
		
		nl.style.display = "inline-block";
		nl.style.marginLeft = "0.16em";
		nl.style.marginRight = "0.16em";
		
		return nl;
	};
	
	this.createA = function ( html, link )
	{
		var a = document.createElement( 'a' );
		a.id = this.divIdCounter;
		this.divIdCounter++;
		a.href = link;
		a.innerHTML = html;
		return a;
	};
	
	this.swapDivs = function ( id, nv )
	{
		var n = document.getElementById( id );
		var cssd = n.style.display;
		n.parentNode.replaceChild( nv, n );
		nv.style.display = cssd;
	};
	
	this.showBlockMake = function ( tok )
	{
		debugOut( "sBM: " + enumerate(tok) );
		
		if ( !tok ) return null;
		
		var ta = null;
		
		/*if ( tok.paren ) // disabled because parens are discarded
		{
			var op = this.showBlockRecursive( tok.code );
			tok.id = op.id;
			return op;
		}
		else*/
		if ( tok.struc )
		{
			var op = this.showFlowBlockRecursive( tok );
			tok.id = op.id;
			return op;
		}
		else if ( tok.op )
		{
			var op = this.createIlDiv( '', true ); // false
			
			tok.id = op.id; // tok should be a langNode
			
			//alert( "tokop:\n" + enumerate( tok ) );
			
			if ( tok.l )
				op.appendChild( this.showBlockMake( tok.l ) );
				
			op.appendChild( this.createTextDiv( tok.op[1] ) );
			
			//alert( enumerate(tok.r) );
			
			/*if ( tok.r && ( tok.r.paren == ")" && tok.r.code == "" ) )
				op.appendChild( this.showBlockMake( [ "str", "()" ] ) );
			else*/
			if ( tok.r && ( !( tok.r.paren == ")" && tok.r.code == "" ) ) )
				op.appendChild( this.showBlockMake( tok.r ) );
			
			return op;
		}
		else
		{
			var op = this.createTextDiv( tok[1] );
			tok.id = op.id; // tok should be a langNode
			return op;
		}
	};
	
	this.showBlockRecursive = function ( code )
	{
		debugOut( "sBR: " + enumerate(code) );
		
		var bl = this.createDiv( '', true );
		bl.style.borderWidth = "5px";
		bl.style.paddingLeft = "3em";
		
		code.id = bl.id;
		
		for ( var i = 0; i < code.length; i++ )
		{
			var n = this.showBlockMake( code[i] );
			//code[i].id = n.id;
			n.style.display = "block";
			bl.appendChild( n );
		}
		
		return bl;
	};
	
	this.showFlowBlockRecursive = function ( tok )
	{
		debugOut( "sFBR: " + enumerate(tok) );
		
		var bl = this.showBlockRecursive( tok.code );
		
		var cond = this.showBlockMake( tok.cond );
		tok.cond.id = cond.id;
		
		var head = this.createDiv( "&nbsp;" + tok.struc + ": ", true );
		
		head.style.position = "relative";
		head.style.left = "-3em";
		
		head.appendChild( cond );
		
		bl.insertBefore( head, bl.children[0] );
		
		return bl;
	};
	
	this.showFunc = function ( name, param, func )
	{
		// visualizer setup
		
		// background-color: blue; padding: 0.5em;
		
		var nob = this.createDiv( '', true );
		nob.style.borderColor = "blue";
		this.outOutDiv.appendChild( nob );
		
		this.outDiv = nob;
		
		stepFunc = func;
		
		var nl = this.createDiv( '', true );
		nl.style.textAlign = 'right';
		
		/*var ex = this.createA( 'X', '#' );
		ex.onclick = function () { outOutDiv.style.display = 'none'; };
		
		nl.appendChild( ex );*/
		
		this.outDiv.appendChild( nl );
				
		nl = this.createDiv( 'name: ' + name, true );
		nl.style.textAlign = 'center';
		nl.style.backgroundColor = 'rgb( 250, 250, 200 )';
		
		this.outDiv.appendChild( nl );
		
		// params
		
		nl = this.createDiv( "params: ", true );
		nl.style.textAlign = 'center';
		nl.style.backgroundColor = 'rgb( 250, 250, 200 )';
		
		for ( var i in param )
			nl.appendChild( this.createTextDiv( param[i][1] ) );
		
		this.outDiv.appendChild( nl );
		
		nl = this.showBlockRecursive( func );
		
		debugOut( "SH: " + nl.innerHTML );
		
		this.outDiv.appendChild( nl );
		
		return nob.id;
	};
	
	var runButtonDiv = this.createDiv( '', true );
	
	this.rBDiv = runButtonDiv;
		
		runButtonDiv.style.position = "absolute";
		runButtonDiv.style.backgroundColor = "#fff";
		runButtonDiv.style.top = "0px";
		
		var l_b = this.createA( 'step', '#' );
		l_b.onclick = function () { runtime.runStep(); };
		
		runButtonDiv.appendChild( l_b );
		
		runButtonDiv.appendChild( this.createTextDiv( " | (" ) );
		
		var l_go = this.createA( 'run', '#' );
		l_go.onclick = function () { createTimer(); };
		
		runButtonDiv.appendChild( l_go );
		
		runButtonDiv.appendChild( this.createTextDiv( " | " ) );
		
		var l_stop = this.createA( 'pause', '#' );
		l_stop.onclick = function () { killStep(); };
		
		runButtonDiv.appendChild( l_stop );
		
		runButtonDiv.appendChild( this.createTextDiv( ")" ) );
		
		runButDiv.appendChild( runButtonDiv ); /// testing - outDiv
	
	this.hideButtons = function()
	{
		
		this.rBDiv.parentNode.removeChild( this.rBDiv );
	};
}