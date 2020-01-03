console.log( "canGraph loading" );

HTMLCanvasElement.prototype.setAxes =
	function ( xmin, xmax, ymin, ymax, xscale, yscale )
	{
		this.axes = arguments;
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;
	};

HTMLCanvasElement.prototype.drawAxes =
	function ()
	{
		var ctx = this.getContext( "2d" );
		
		var xsize = this.xmax - this.xmin;
		var ysize = this.ymax - this.ymin;
		
		var xmid = this.width / 2;
		var ymid = this.height / 2;
		
		console.log( xmid, ymid );
	};

HTMLCanvasElement.prototype.plot =
	function ( x, y )
	{
		
	};
	
console.log( "canGraph loaded" );