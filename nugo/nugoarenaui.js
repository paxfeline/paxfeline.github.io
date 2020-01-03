function Turtle( ta )
{
	this.arena = ta;
	this.reset();
}
Turtle.prototype.getHeading =
	function ()
	{
		return angToRad( this.heading );
	};
Turtle.prototype.reset =
	function ()
	{
		this.x = this.arena.htmlEl.width / 2;
		this.y = this.arena.htmlEl.height / 2;
		this.heading = 90;
		this.arena.ctx.lineWidth = 1;
		this.arena.ctx.strokeStyle = "rgb( 0, 0, 0 )";
		this.arena.ctx.penstate = true;
	};
	
function TurtleArena()
{
	var self = this;
	
	this.cmdLineEl = document.createElement( "pre" );
	this.cmdLineEl.style.width = "100%";
	this.cmdLineEl.style.height = "24pt";
	this.cmdLineEl.style.margin = "0";
			
			this.cmdLine = ace.edit(this.cmdLineEl);
			this.cmdLine.setTheme("ace/theme/twilight");
			this.cmdEdsesh = this.cmdLine.getSession();
			this.cmdEdsesh.setMode("ace/mode/python");
	
	this.cmdLine.renderer.$maxLines = 1;
	
    this.cmdLine.setShowPrintMargin(false);
    this.cmdLine.renderer.setShowGutter(false);
    this.cmdLine.renderer.setHighlightGutterLine(false);
    this.cmdLine.$mouseHandler.$focusWaitTimout = 0;
    
    this.cmdLine.setFontSize( 24 );
    
    this.lastCLHeight = 1;
    
    this.cmdLine.on( "change",
    	function ()
    	{
    		if ( self.lastCLHeight != self.cmdEdsesh.getLength() )
    		{
    			self.lastCLHeight = self.cmdEdsesh.getLength();
					self.cmdLine.renderer.$maxLines = self.lastCLHeight;
				self.cmdLineEl.style.height = (24 * self.cmdEdsesh.getLength()) + "pt";
				self.resize();
				console.log( self.lastCLHeight, self.cmdEdsesh.getLength(), self.cmdLine.renderer.$maxLines, self.cmdLineEl.style.height );
			}
    	} );
    
    	this.cmdLine.commands.bindKeys(
    		{
				"Shift-Return|Ctrl-Return|Alt-Return":
					function(cmdLine)
					{
						cmdLine.insert("\n");
					},
				"Esc|Shift-Esc": function(cmdLine){ cmdLine.focus(); },
				"Return":
					function(cmdLine)
					{
						var a = new Array();
						for ( var i = 0; i < self.cmdEdsesh.getLength(); i++ )
							a.push( self.cmdEdsesh.getTokens(i) );
						interpretCode( Nugo.codeList, a );
						self.cmdLine.setValue("");
					}
			});


	this.baseEl = document.createElement( "div" );
	this.baseEl.id = "turtle_arena_base";

	this.htmlEl = document.createElement( "canvas" );
	this.htmlEl.id = "turtle_arena";
	this.ctx = this.htmlEl.getContext( "2d" );
	this.turtle = new Turtle( this );
	
	this.baseEl.appendChild( this.htmlEl );
	this.baseEl.appendChild( this.cmdLineEl );
	
	//document.body.insertBefore( this.baseEl, document.getElementById( "control_div" ) );
	
	document.body.appendChild( this.baseEl );
	
	this.resize();
	
	window.addEventListener( "resize", this.resize.bind( this ) );
}
TurtleArena.prototype.resize =
	function ()
	{
		this.htmlEl.width = this.htmlEl.offsetWidth;
		this.htmlEl.style.height = "100%";
		var nh = this.htmlEl.offsetHeight - this.cmdLineEl.offsetHeight;
		this.htmlEl.style.height = nh + "px";
		this.htmlEl.height = nh;
		if ( Nugo )
			Nugo.draw();
	};
TurtleArena.prototype.turtleInBounds =
	function ()
	{
		return this.inBounds( this.turtle.x, this.turtle.y );
	};
TurtleArena.prototype.inBounds =
	function ( x, y )
	{
		return ( x >= 0 && x <= this.htmlEl.width &&
					y >= 0 && y <= this.htmlEl.height );
	};