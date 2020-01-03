function lBTurtle( conx )
{
	this.conx = conx;
	
	this.curX = 250;
	this.curY = 250;
	
	this.animX = this.curX;
	this.animY = this.curY;
	
	this.curTh = 3.14159 / 2;
	
	this.animTh = this.curTh;
	
	this.curStroke = 0;
	this.animStroke = this.curStroke;
	
	this.animPen = true;
	
	this.strokeWeight = 2;
	
	this.PPF = 5; // pixels per frame
	this.APF = 0.1; // radians per frame
	
	this.showSelf = true;
	
	this.breakUpAngle = function ( a2 )
	{
			var dth = a2 * ( 3.14159 / 180 );
			var sth = dth / this.APF;
			
			for ( var i = 1; i < sth; i++ )
				ret.push( [ "angle", this.curTh - (dir * (dth * (i/sth))) ] );
			ret.push( [ "angle", this.curTh - (dir * dth) ] );
			
			this.curTh -= dir * dth;
	};
	
	this.breakUpLine = function ( x2, y2 )
	{
		var ret = [];
		
		var dx = x2 - this.curX;
		var dy = y2 - this.curY;
		
		var sn = 0;
		
		if ( this.PPF > 0 )
			sn = lineLength( this.curX, this.curY, x2, y2 ) / this.PPF;
		
		//alert( "fd: dx:" + dx + " dy: " + dy + " sn: " + sn );
		
		var lx = this.curX;
		var ly = this.curY;
		
		/*alert( "top: tX: " + this.curX + " / tY: " + this.curY +
				"\ncx: " + cx + " / cy: " + cy +
				"\ntx: " + tx + " / ty: " + ty +
				"\ndx: " + dx + " / dy: " + dy +
				"\nlx: " + lx + " / ly: " + ly +
				"\nx2: " + x2 + " / y2: " + y2 +
				"\nsn: " + sn + " i: " + i );*/
		
		var group = false;
		
		var i = 1;
		while ( i < sn || x2 < 0 || x2 > 500 || y2 < 0 || y2 > 500 )
		{
			var cx;
			var cy;
			
			if ( sn >= 1 )
			{
				cx = dx * (i/sn);
				cy = dy * (i/sn);
			}
			else
			{
				cx = dx;
				cy = dy;
			}
			
			/*alert( "curX: " + this.curX + "\ncurY: " + this.curY +
					"\ndx: " + dx + "\ndy: " + dy +
					"\ncx: " + cx + "\ncy: " + cy +
					"\nsn: " + sn + " / i: " + i );*/
			
			var tx = this.curX + cx;
			var ty = this.curY + cy;
			
			if ( tx < 0 || tx > 500 || ty < 0 || ty > 500 )
			{
				if ( !group )
				{
					group = true;
					ret.push( "group" );
					//alert( "group" );
				}
				
				
				ret.push( [ "line", [ this.curX, this.curY, tx, ty ] ] );
				
				ret.push( "save" );
					
				var xadj = 0;
				var yadj = 0;
				
				if ( (tx < 0 || tx > 500) && (ty < 0 || ty > 500) )
				{
					var txf; // test x fixed
					var tyf;
					var tyd; // test y dependent
					var tyd;
					
					if ( tx > 500 )	txf = 500 - this.curX;
					if ( tx < 0 )	txf = this.curX;
					
					if ( ty > 500 )	tyf = 500 - this.curY;
					if ( ty < 0 )	tyf = this.curY;
				
					tyd = txf * Math.tan( this.curTh );
					
					txd = Math.abs( ( tyf * txf ) / tyd );
					
					/*alert( ((txf > txd) ? "y wins" : "x wins") +
							"\ntxf: " + txf + "\ntyf: " + tyf +
							"\ntyd: " + tyd + "\ntxd: " + txd + 
							"\ncurTh: " + this.curTh + "\ntan: " + Math.tan(this.curTh) );*/
					
					if ( txf > txd )	yadj = (ty < 0) ? 500 : -500;
					else				xadj = (tx < 0) ? 500 : -500;
				}
				else
				{
					if ( tx < 0 || tx > 500 ) xadj = (tx < 0) ? 500 : -500;
					if ( ty < 0 || ty > 500 ) yadj = (ty < 0) ? 500 : -500;
				}
				
				this.curX = lx + xadj;
				this.curY = ly + yadj;
				x2 += xadj;
				y2 += yadj;
				
				if ( sn >= 1 ) sn = lineLength( this.curX, this.curY, x2, y2 ) / this.PPF;
				
				dx = x2 - this.curX;
				dy = y2 - this.curY;
				
				/*alert( "new: tX: " + this.curX + " / tY: " + this.curY +
						"\ncx: " + cx + " / cy: " + cy +
						"\ntx: " + tx + " / ty: " + ty +
						"\ndx: " + dx + " / dy: " + dy +
						"\nlx: " + lx + " / ly: " + ly +
						"\nx2: " + x2 + " / y2: " + y2 +
						"\nsn: " + sn + " i: " + i );*/
				
				tx = this.curX;
				ty = this.curY;
					
				/*tx = this.curX;
				ty = this.curY;*/
			
				//ret.push( [ "line", [ this.curX, this.curY, tx, ty ] ] );
				
				i = 0;
			}
			else
			{
				ret.push( [ "line", [ this.curX, this.curY, tx, ty ] ] );
				
				if ( group )
				{
					group = false;
					ret.push( "endgroup" );
					//alert( "endgroup" );
				}
			}
			
			i++;
			
			lx = tx;
			ly = ty;
		}
		
		var tx,ty;
		tx = x2;
		ty = y2;
				
		ret.push( [ "line", [ this.curX, this.curY, x2, y2 ] ] );
				
		if ( group )
			ret.push( "endgroup" );
			
		this.curX = x2;
		this.curY = y2;
		
		//alert( "out: " + x2 + "/" + y2 );
		
		return ret;
	};
	
	this.animOp = function ( op, arg )
	{
		// return an array of animation frames
		var ret = [];
		
		var dir = 1;
		
		switch ( op )
		{
		case "bk":
			dir = -1;
		case "fd":
			//var np = makePoint( curX, curY );
			//alert( np.x + "," + np.y + "\n" + par + "@" + cura.ang );
			//np.x += Number( Math.cos(curTh) * arg );
			//np.y -= Math.sin(curTh) * arg;
			
			var dx = dir * Number( Math.cos(this.curTh) * arg );
			var dy = dir * -Math.sin(this.curTh) * arg;
			
			/*var sn = lineLength( this.curX, this.curY,
									this.curX + dx, this.curY + dy )
								/ this.PPF;
			
			//alert( "fd: dx:" + dx + " dy: " + dy + " sn: " + sn );
			
			for ( var i = 1; i < sn; i++ )
			{
				var cx = dx * (i/sn);
				var cy = dy * (i/sn);
				ret.push( [ "line",
					[ this.curX, this.curY, this.curX + cx, this.curY + cy ] ] );
			}*/
			
			ret = this.breakUpLine( this.curX + dx, this.curY + dy );
			
			//alert( "ret:" + enumerate(ret) );
			
			break;
		case "lt":
			dir = -1;
		case "rt":
			
			var dth = arg * ( 3.14159 / 180 );
			var sth = dth / this.APF;
			
			for ( var i = 1; i < sth; i++ )
				ret.push( [ "angle", this.curTh - (dir * (dth * (i/sth))) ] );
			ret.push( [ "angle", this.curTh - (dir * dth) ] );
			
			this.curTh -= dir * dth;
		
			break;
		case "setWeight":
			this.strokeWeight = arg;
			ret.push( [ "weight", arg ] );
			break;
		case "pu":
			dir = -1
		case "pd":
			//alert( "pen: " + ( dir == 1 ) );
			
			ret.push( [ "pen", ( dir == 1 ) ] );
			break;
		case "ht":
			dir = -1;
		case "st":
			ret.push( [ "show", ( dir == 1 ) ] );
			break;
		case "home":
			ret = this.breakUpLine( 250, 250 );
			break;
		case "setAngle":
			this.curTh = (90 - arg) * ( 3.14159 / 180 );
			ret.push( [ "angle", this.curTh ] );
			break;
		case "setX":
			ret = this.breakUpLine( arg, this.curY );
			break;
		case "setY":
			ret = this.breakUpLine( this.curX, arg );
			break;
		case "setSpeed":
			ret.push( [ "speed", arg ] );
			break;
		case "setColor":
			ret.push( [ "stroke", arg ] );
			break;
		case "setPPF": // these go here because they determine values that are used
			this.PPF = arg;	// to calculate animations; not used in real time
			break;
		case "setAPF":
			this.APF = arg * ( 3.14159 / 180 );
			break;
		}
		
		return ret;
	};
	
	this.animate = function ( conx, op, arg )
	{
		// draw one frame
		
		switch ( op )
		{
		case "line":
			this.animX = arg[2];
			this.animY = arg[3];
			
			if ( this.animPen )
			{
			
				//alert( conx.lineWidth + "/" + conx.strokeStyle );
				conx.beginPath();
				conx.moveTo( arg[0], arg[1] );
				conx.lineTo( this.animX, this.animY );
				conx.stroke();
				
				//conx.line( arg[0], arg[1], this.animX, this.animY );
				
				var sw = this.strokeWeight / 2;
				if ( arg[0] >= 0 && arg[0] <= 500 && this.animX >= 0 && this.animX <= 500 &&
					arg[1] >= 0 && arg[1] <= 500 && this.animY >= 0 && this.animY <= 500 )
				{
					/*alert( "line: " + arg[0] + ", " + arg[0] + ", " + 
								this.animX + ", " + this.animY );*/
					
					if ( arg[0] + sw > 500 || this.animX + sw > 500 ||
								arg[0] - sw < 0 || this.animX - sw < 0 )
					{
						if ( arg[0] + sw > 500 || this.animX + sw > 500 )
						{
							conx.beginPath();
							conx.moveTo( arg[0] - 500, arg[1] );
							conx.lineTo( this.animX - 500, this.animY );
							conx.stroke();
							//conx.line( arg[0] - 500, arg[1], this.animX - 500, this.animY );
						}
						
						if ( arg[0] - sw < 0 || this.animX - sw < 0 )
						{
							conx.beginPath();
							conx.moveTo( arg[0] + 500, arg[1] );
							conx.lineTo( this.animX + 500, this.animY );
							conx.stroke();
							//conx.line( arg[0] + 500, arg[1], this.animX + 500, this.animY );
						}
					}
					
					if ( arg[1] + sw > 500 || this.animY + sw > 500 ||
								arg[1] - sw < 0 || this.animY - sw < 0 )
					{
						if ( arg[1] + sw > 500 || this.animY + sw > 500 )
						{
							conx.beginPath();
							conx.moveTo( arg[0], arg[1] - 500 );
							conx.lineTo( this.animX, this.animY - 500 );
							conx.stroke();
							//conx.line( arg[0], arg[1] - 500, this.animX, this.animY - 500 );
						}
						
						if ( arg[1] - sw < 0 || this.animY - sw < 0 )
						{
							conx.beginPath();
							conx.moveTo( arg[0], arg[1] + 500 );
							conx.lineTo( this.animX, this.animY + 500 );
							conx.stroke();
							//conx.line( arg[0], arg[1] + 500, this.animX, this.animY + 500 );
						}
					}
				}
			}
			break;
		case "angle":
			this.animTh = arg;
			break;
		case "pen":
			this.animPen = arg;
			//alert( "an:" + this.animPen );
			break;
		case "weight":
			//alert( "weight: " + arg );
			conx.lineWidth = arg;
			//conx.strokeWeight( arg );
			break;
		case "show":
			this.showSelf = arg;
			break;
		case "speed": // temporarily out of commission
			//proc.frameRate( arg ); // 60 fps
			break;
		case "stroke":
			switch ( arg.length )
			{
			case 3:
				conx.strokeStyle = "rgb(" + arg[0][1] + "," + arg[1][1] + ","
											+ arg[2][1] + ")";
				//conx.stroke( arg[0][1], arg[1][1], arg[2][1] );
				break;
			case 4:
				conx.strokeStyle = "rgba(" + arg[0][1] + "," + arg[1][1] + ","
											+ arg[2][1] + "," + arg[3][1] + ")";
				//conx.stroke( arg[0][1], arg[1][1], arg[2][1], arg[3][1] );
				break;
			}
		default:
			debugOut( "unknown animation command: " + op );
		}
	};
	
	this.drawSelf = function ()
	{
		//if ( !this.showSelf ) return;
		
		//debugOut( "frame" + conx );
		
		if ( !this.showSelf ) return;
		
		var conx = this.conx;
		
		var ang = this.animTh;
		var ox = this.animX;
		var oy = this.animY;
		
		var p1x, p1y, p2x, p2y, p3x, p3y;
		var pv;
		
		conx.save();
		
		// 1
		
		conx.lineWidth = 5;
		conx.strokeStyle = "rgb(255,255,255)";
		conx.fillStyle = "rgb(255,255,255)";
		
		pv = Math.cos(ang)*20;
		p1x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang)*20;
		p1y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		pv = Math.cos(ang - 1.6)*10;
		p2x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang - 1.6)*10;
		p2y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		pv = Math.cos(ang - 4.74)*10;
		p3x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang - 4.74)*10;
		p3y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		conx.beginPath();
		conx.moveTo( p1x, p1y );
		conx.lineTo( p2x, p2y );
		conx.lineTo( p3x, p3y );
		conx.closePath();
		conx.stroke();
		conx.fill();
		
		/*conx.line(p1x, p1y, p2x, p2y);
		conx.line(p2x, p2y, p3x, p3y);
		conx.line(p3x, p3y, p1x, p1y);*/
		
		// 2
		
		conx.lineWidth = 2;
		conx.strokeStyle = "rgb(0,0,0)";
		conx.fillStyle = "rgb(0,0,0)";
		
		pv = Math.cos(ang)*20;
		p1x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang)*20;
		p1y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		pv = Math.cos(ang - 1.6)*10;
		p2x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang - 1.6)*10;
		p2y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		pv = Math.cos(ang - 4.74)*10;
		p3x = Number(ox) + Number(pv); //(pv < 30 ? Number(pv) : 30);
		pv =  Math.sin(ang - 4.74)*10;
		p3y = Number(oy) - Number(pv); //(pv < 30 ? Number(pv) : 30);
		
		conx.beginPath();
		conx.moveTo( p1x, p1y );
		conx.lineTo( p2x, p2y );
		conx.lineTo( p3x, p3y );
		conx.closePath();
		conx.stroke();
		conx.fill();
		
		/*conx.line(p1x, p1y, p2x, p2y);
		conx.line(p2x, p2y, p3x, p3y);
		conx.line(p3x, p3y, p1x, p1y);*/
		
		// out
		
		conx.restore();
		
		/*conx.strokeWeight( this.strokeWeight );
		conx.stroke( this.animStroke );*/
	};
};

function lBOffscreen( width, height )
{
	this.canvas = document.createElement( "canvas" );
	this.canvas.width = width;
	this.canvas.height = height;
	
	this.context = this.canvas.getContext( "2d" );
	
	this.context.lineCap = "round";
}

function lBasicProcessing( canvasId )
{
	var parent = this; // nice trick
	
	this.background = null;
	this.backTemp = null;
	
	this.turtle = null;
	
	this.queue = [];
		
	this.background = null;
	this.backTemp = null;
	
	this.init = function ()
	{
		this.turtle = new lBTurtle( this.context );
		
		this.background = new lBOffscreen( 500, 500 );
		this.backTemp = new lBOffscreen( 500, 500 );
		
		this.background.context.strokeStyle = "rgb(0,0,0)";
		this.backTemp.context.strokeStyle = "rgb(0,0,0)";
		
		this.background.context.lineWidth = 3;
		this.backTemp.context.lineWidth = 3;
		
		this.background.context.fillStyle = "rgb(255,255,255)";
		this.backTemp.context.fillStyle = "rgb(255,255,255)";
		
		this.background.context.fillRect( 0, 0, 500, 500 );
		this.backTemp.context.fillRect( 0, 0, 500, 500 );
		
		this.context.strokeStyle = "rgb(0,0,0)";
		this.context.lineWidth = 3;
		this.context.lineCap = "round";
		
		/*this.addMove( "setPPF", 0 );
		this.addMove( "setX", 400 );
		this.addMove( "setY", 400 );
		this.addMove( "rt", 127 );
		this.addMove( "fd", 350 );*/
			
		setInterval( this.draw, 0 );
	};
	
	this.addMove = function ( op, arg )
	{
		var ta = this.turtle.animOp( op, arg );
		//alert( "mA1:\n" + enumerate(ta) );
		this.queue = this.queue.concat( ta, "save" );
	};
	
	this.animate = function ()
	{
		var group = false;
		
		do
		{
			if ( parent.queue.length == 0 || !parent.background ) return;
		
			var t = parent.queue.shift();
			
			//debugOut( "an:\n" + t );
			
			if ( t === "group" )
			{
				group = true;
				continue;
			}
			
			if ( t === "endgroup" ) return;
			
			if ( t === "save" )
				parent.backTemp.context.drawImage( parent.background.canvas, 0, 0 );
			/*{
				this.backTemp.beginDraw();
				this.backTemp.image( this.background, 0, 0 );
				this.backTemp.endDraw();
			}*/
			else
			{
				//debugOut( "animate: " + enumerate(this.background) );
				
				//alert( parent.background + "/" + this.background );
				
				parent.background.context.drawImage( parent.backTemp.canvas, 0, 0 );
				parent.turtle.animate( parent.background.context, t[0], t[1] );

				
				/*this.background.beginDraw();
				
				this.background.image( this.backTemp, 0, 0 );
				this.turtle.animate( this.background, t[0], t[1] );
				
				this.background.endDraw();*/
			}
		}
		while ( group );
	};
	
	//this.background = processing.createGraphics( 500, 500, processing.JAVA2D );
	//this.backTemp = processing.createGraphics( 500, 500, processing.JAVA2D );
	
	this.draw = function()
	{
		if ( parent.background && parent.queue.length > 0 )
			parent.animate();
		
		parent.context.drawImage( parent.background.canvas, 0, 0 );
		
		parent.turtle.drawSelf();
	};
	
	this.canvas = document.getElementById( canvasId );
	this.context = this.canvas.getContext( "2d" );
	
	this.canvas.width = 500;
	this.canvas.height = 500;
}