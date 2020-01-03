function NugoDrawTurtle( ctx, t )
{
	var k = 25;
	var h = t.getHeading();
	var halfpi = Math.PI / 2;
	var dmx = t.x + Number( Math.cos(h) * k );
	var dmy = t.y - Math.sin(h) * k;
	var dlx = t.x + Number( Math.cos(h - halfpi) * k / 2 );
	var dly = t.y - Math.sin(h - halfpi) * k / 2;
	var drx = t.x + Number( Math.cos(h + halfpi) * k / 2 );
	var dry = t.y - Math.sin(h + halfpi) * k / 2;
	
	/*ctx.save();
	ctx.lineWidth = 1;*/
	
	ctx.save();
	ctx.strokeStyle = "rgb( 0, 0, 0 )";
	ctx.beginPath();
	ctx.moveTo( dmx, dmy );
	ctx.lineTo( dlx, dly );
	ctx.lineTo( drx, dry );
	ctx.lineTo( dmx, dmy );
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
	
	/*ctx.restore();*/
}

function NugoDraw()
{
	this.arena.turtle.reset();
	this.arena.ctx.clearRect( 0, 0, this.arena.htmlEl.width, this.arena.htmlEl.height );
	//console.log( "cleared", this.arena );
				
	for ( var i in this.codeList.cmd )
	{
		var cmd = this.codeList.cmd[i];
		//console.log( cmd );
		cmd.draw( this.arena.ctx );
	}
	NugoDrawTurtle( this.arena.ctx, this.arena.turtle );
}

function NugoCheckReady()
{
	if ( this.arena.htmlEl.offsetHeight > 0 )
	{
		clearInterval( nugoTimer );
		this.arena.resize();
		this.arena.ctx.penstate = true;
		this.draw();
	}
}

var Nugo =
	{
		arena:		new TurtleArena( $( "turtle_arena" ) ),
		codeList:	new CodeList( $( "code_list" ) ),
		draw:		NugoDraw,
		checkReady:	NugoCheckReady
	};
	
nugoTimer = setInterval( Nugo.checkReady.bind( Nugo ), 10 );