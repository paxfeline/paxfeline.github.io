// http://sfcstech.x10.mx/images/sprites/walker32x32.png

function PXSprite ( w, h, imgUrl, tw, th )
{
	this.innerWidth = w;
	this.innerHeight = h;
	
	if ( tw && !th )
	{
		th = h * (tw / w);
		
		if ( th > tw )
		{
			th = tw;
			tw = w * (tw / h);
		}
	}
	else // !tw
		tw = w;
	
	this.width = tw;
	this.height = th;
	
	this.setTargetFPS( 20 );
	
	this.rawImg = new Image();   // Create new img element
	this.rawImg.addEventListener( 'load', () => { this.length = this.rawImg.width / w; }, false );
	this.rawImg.src = imgUrl; // Set source path

	this.index = 0;
}

PXSprite.prototype.setTargetFPS =
	function ( fps )
	{
		this.targetFrameDelay = 1000 / fps;
	};

PXSprite.prototype.draw =
	function ( ctx, owner )
	{
		if ( owner.flipX )
		{
			ctx.translate( this.width, 0 );
			ctx.scale( -1, 1 );
		}
		
		ctx.drawImage( this.rawImg, this.index * this.innerWidth, 0, this.innerWidth, this.innerHeight, 0, 0, this.width, this.height );
	};

function PXColorSprite ( w, h, c )
{
	this.width = w;
	this.height = h;

	this.color = c;
}

PXColorSprite.prototype.draw =
	function ( ctx )
	{
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect( 0, 0, this.width, this.height );
		
		//console.log( this.subDraw );
		if ( this.subDraw ) this.subDraw( ctx, this );
		
		ctx.restore();
	};