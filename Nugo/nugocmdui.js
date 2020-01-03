console.log( "noguui.js" );

function CommandListSelector( owner )
{
	//alert( owner.htmlEl );
	
	var self = this;
	
	this.htmlEl = $e( "div" );

	this.fdEl = $e( "img" );
	this.fdEl.src = "images/fd.png";
	this.fdEl.addEventListener( "click",
		function () { owner.addCommand( new TurtleCommand_Forward( Nugo.arena, owner ) ); } );
	this.htmlEl.appendChild( this.fdEl );

	this.bkEl = $e( "img" );
	this.bkEl.src = "images/bk.png";
	this.bkEl.addEventListener( "click",
		function ()
		{
			var cmd = new TurtleCommand_Back( Nugo.arena, owner );
			owner.addCommand( cmd );
		} );
	this.htmlEl.appendChild( this.bkEl );

	this.rtEl = $e( "img" );
	this.rtEl.src = "images/rt.png";
	this.rtEl.addEventListener( "click",
		function () { owner.addCommand( new TurtleCommand_Right( Nugo.arena, owner ) ); } );
	this.htmlEl.appendChild( this.rtEl );

	this.ltEl = $e( "img" );
	this.ltEl.src = "images/lt.png";
	this.ltEl.addEventListener( "click",
		function ()
		{
			var cmd = new TurtleCommand_Left( Nugo.arena, owner );
			owner.addCommand( cmd );
		} );
	this.htmlEl.appendChild( this.ltEl );

	this.homeEl = $e( "img" );
	this.homeEl.src = "images/home.png";
	this.homeEl.addEventListener( "click",
		function ()
		{
			var cmd = new TurtleCommand_Home( Nugo.arena, owner );
			owner.addCommand( cmd );
			Nugo.draw();
		} );
	this.htmlEl.appendChild( this.homeEl );

	this.puEl = $e( "img" );
	this.puEl.src = "images/pu.png";
	this.puEl.addEventListener( "click",
		function ()
		{
			var cmd = new TurtleCommand_PenUp( Nugo.arena, owner );
			owner.addCommand( cmd );
			Nugo.draw();
		} );
	this.htmlEl.appendChild( this.puEl );

	this.pdEl = $e( "img" );
	this.pdEl.src = "images/pd.png";
	this.pdEl.addEventListener( "click",
		function ()
		{
			var cmd = new TurtleCommand_PenDown( Nugo.arena, owner );
			owner.addCommand( cmd );
			Nugo.draw();
		} );
	this.htmlEl.appendChild( this.pdEl );
	
	this.lineWidthEl = $e( "img" );
	this.lineWidthEl.src = "images/pensize.png";
	this.lineWidthEl.addEventListener( "click",
		function () { owner.addCommand( new TurtleCommand_LineWidth( Nugo.arena, owner ) ); } );
	this.htmlEl.appendChild( this.lineWidthEl );
	
	this.penColorEl = $e( "img" );
	this.penColorEl.src = "images/pencolor.png";
	this.penColorEl.addEventListener( "click",
		function () { owner.addCommand( new TurtleCommand_PenColor( Nugo.arena, owner ) ); } );
	this.htmlEl.appendChild( this.penColorEl );

	this.loopEl = $e( "img" );
	this.loopEl.src = "images/repeat.png";
	this.loopEl.addEventListener( "click",
		function () { owner.addCommand( new CodeBlock( owner, "Repeat", null ) ); } );
	this.htmlEl.appendChild( this.loopEl );
	
	owner.htmlEl.appendChild( this.htmlEl );
}

// type can be "to" or "repeat"
function CodeBlock( owner, type, v )
{
	this.cmd = new Array();
	this.owner = owner;
	this.type = type;
	this.htmlEl = $e( "div" );
	this.htmlEl.className = "codeBlock";
	if ( !(owner instanceof CodeList) )
	{
		var cb = $e( "span" );
		cb.innerHTML = "X";
		cb.className = "cb";
		cb.style.marginLeft = "1em";
		var self = this;
		cb.addEventListener( "click", function () { owner.removeCommand(self); } );
		this.htmlEl.appendChild( cb );
	}
	if ( type == "Repeat" )
	{
		this.titleEl = $e( "span" );
		this.titleEl.innerHTML = type + (v ? " " + v : "");
		this.htmlEl.appendChild( this.titleEl );
		
		this.control = new DistanceControl( this );
		this.htmlEl.appendChild( this.control.htmlEl );
		this.repeatOutEl = $e( "input" );
		this.htmlEl.appendChild( this.repeatOutEl );
		var self = this;
		this.repeatOutEl.addEventListener( "change", function () { self.control.setValue( this.value / 40 ); } );
	}
	this.commands = new CommandListSelector( this );
	owner.htmlEl.appendChild( this.htmlEl );
}
CodeBlock.prototype.addCommand =
	function ( cmd )
	{
		this.cmd.push( cmd );
		this.htmlEl.insertBefore( cmd.htmlEl, this.commands.htmlEl );
	};
CodeBlock.prototype.draw =
	function ( cmd )
	{
		// silly way to handle procedures
		if ( !this.value ) this.value = 1;
		
		for ( var n = 0; n < this.value; n++ )
		{
			for ( var i in this.cmd )
			{
				var cmd = this.cmd[i];
				cmd.draw( Nugo.arena.ctx );
			}
		}
	};
CodeBlock.prototype.removeCommand =
	function ( cmd )
	{
		//alert( cmd.htmlEl.parentNode );
		cmd.htmlEl.parentNode.removeChild( cmd.htmlEl );
		for ( var i in this.cmd )
		{
			if ( this.cmd[i] == cmd )
			{
				this.cmd.splice( i, 1 );
				Nugo.draw();
				return;
			}
		}
	};
CodeBlock.prototype.updateValue =
	function ( v )
	{
		this.value = Math.round( 40 * v );
		this.repeatOutEl.value = this.value;
		Nugo.draw();
	};
CodeBlock.prototype.getControlValue =
	function ( v )
	{
		return v / 40;
	};
CodeBlock.prototype.getDisplayValue =
	function ()
	{
		return this.value;
	};
CodeBlock.prototype.genCode =
	function ()
	{
		var r = "";
		
		if ( this.type == "Repeat" )
			r = "\nREPEAT " + this.value + " [";
		
		for ( var i in this.cmd )
			r += "\n" + this.cmd[i].genCode();
		
		if ( this.type == "Repeat" )
			r += "\n]";
		
		return r;
	};

function CodeList( el )
{
	this.htmlEl = el;
	
	this.IOdiv = $e( "div" );
	this.copyBtn = $e( "input" );
	this.copyBtn.type = "button";
	this.copyBtn.value = "Display Code";
	this.copyBtn.style.margin = "0.5em";
	this.copyBtn.addEventListener( "click",
		function ()
		{
			var ed = new CodeEditor( Nugo.codeList );
		} );
	
	this.IOdiv.appendChild( this.copyBtn );
	
	this.cmd = new Array();
	this.addCommand( new CodeBlock( this, "to", "main" ) );
	
	this.htmlEl.appendChild( this.IOdiv );
}
// should change to setRoot (there is only 1)
CodeList.prototype.addCommand =
	function ( cmd )
	{
		this.cmd.push( cmd );
		this.htmlEl.appendChild( cmd.htmlEl );
	};
CodeList.prototype.removeCommand =
	function ( cmd )
	{
		//alert( cmd.htmlEl.parentNode );
		cmd.htmlEl.parentNode.removeChild( cmd.htmlEl );
		for ( var i in this.cmd )
		{
			if ( this.cmd[i] == cmd )
			{
				this.cmd.splice( i, 1 );
				Nugo.draw();
				return;
			}
		}
	};
CodeList.prototype.hide =
	function ()
	{
		this.htmlEl.style.display = "none";
	};
CodeList.prototype.show =
	function ()
	{
		this.htmlEl.style.display = "block";
	};
	
function CodeEditor( cl )
{
	var self = this;
	
	this.htmlEl = $e( "div" );
	this.htmlEl.className = "codeEdBack";
	
	this.editorEl = $e( "pre" );
	this.editorEl.className = "codeEd";
	this.editor = ace.edit(this.editorEl);
	this.editor.setTheme("ace/theme/twilight");
	this.edsesh = this.editor.getSession();
	this.edsesh.setMode("ace/mode/lisp");
	
	this.okBtn = $e( "input" );
	this.okBtn.value = "save";
	this.okBtn.type = "button";
	this.okBtn.addEventListener( "click",
		function ()
		{
			while ( cl.cmd[0].cmd.length > 0 )
			{
				//console.log( "remove" );
				//console.log( cl.cmd[0].cmd[0] );
				cl.cmd[0].removeCommand( cl.cmd[0].cmd[0] );
			}
			//cl.cmd = [ new CodeBlock( cl, "to", "main" ) ];
			var a = new Array();
			for ( var i = 0; i < self.edsesh.getLength(); i++ )
				a.push( self.edsesh.getTokens(i) );
			interpretCode( cl, a );
			//alert( self.editor.getValue() );
			self.close();
		} );
	
	this.cancelBtn = $e( "input" );
	this.cancelBtn.value = "cancel";
	this.cancelBtn.type = "button";
	this.cancelBtn.addEventListener( "click",
		function ()
		{
			self.close();
		} );
	
	this.htmlEl.appendChild( this.editorEl );
	this.htmlEl.appendChild( this.okBtn );
	this.htmlEl.appendChild( this.cancelBtn );
	
	this.editor.setValue( cl.cmd[0].genCode() );
	
	document.getElementsByTagName( "body" )[0].appendChild( this.htmlEl );
	
	window.addEventListener( "resize", this.resize.bind( this ) );
	
	this.timer = setInterval( CodeEditor.checkReady.bind( this ), 10 );
}
CodeEditor.prototype.resize =
	function ()
	{
		this.editorEl.style.height = "100%";
		//console.log( (this.editorEl.offsetHeight - this.okBtn.offsetHeight - 10) + "px" );
		this.editorEl.style.height = (this.editorEl.offsetHeight - this.okBtn.offsetHeight - 10) + "px";
	};
CodeEditor.prototype.close =
	function ()
	{
		this.htmlEl.parentNode.removeChild( this.htmlEl );
	};
CodeEditor.checkReady =
	function ()
	{
		//console.log( this.editorEl.offsetHeight );
		if ( this.editorEl.offsetHeight > 0 && this.okBtn.offsetHeight > 0 )
		{
			//alert( this.editorEl.offsetHeight + "/" + this.okBtn.offsetHeight );
			clearInterval( this.timer );
			this.resize();
		}
	};