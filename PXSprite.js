// http://sfcstech.x10.mx/images/sprites/walker32x32.png

function PAXSprite ( w, h, imgUrl, tw, th )
{
	this.width = w;
	this.height = h;

	this.targetWidth = tw ? tw : w;
	this.targetHeight = th ? th : h;
	
	this.rawImg = new Image();   // Create new img element
	this.rawImg.addEventListener( 'load', () => { this.length = this.rawImg.width / w; }, false );
	this.rawImg.src = imgUrl; // Set source path

	this.index = 0;
}

PAXSprite.prototype.draw =
	function ( ctx )
	{
		ctx.drawImage( this.rawImg, this.index * this.width, 0, this.width, this.height, 0, 0, this.targetWidth, this.targetWidth );
		this.inc();
	};

PAXSprite.prototype.inc =
	function ()
	{
		this.index = ++this.index % (this.length || 1);
	};

function PAXColorSprite ( w, h, c )
{
	this.width = w;
	this.height = h;

	this.targetWidth = w;
	this.targetHeight = h;

	this.color = c;
}

PAXColorSprite.prototype.draw =
	function ( ctx )
	{
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect( 0, 0, this.width, this.height );
		
		//console.log( this.subDraw );
		if ( this.subDraw ) this.subDraw( ctx, this );
		
		ctx.restore();
	};