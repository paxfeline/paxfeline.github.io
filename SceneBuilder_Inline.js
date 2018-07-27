function* colorGen() {
	while ( true )
	{
		yield "blue";
		yield "red";
	}
}

var cGen = colorGen();

eng.colBlocks = [];

var curColBlock;

for ( var blocki = 0; blocki < level.length; blocki++ )
{
    var lblock = level[ blocki ];
    
    curColBlock = [];
    eng.colBlocks.push( curColBlock );
    
    for ( var line = 0; line < lblock.length; line++ )
    {
        var blockline = lblock[ line ];
        
        for ( var c = 0; c < blockline.length; c++ )
        {
            var char = blockline[ c ];
            
            var x = (levelblocksize * blocki + c) * BOXSIZE;
            var y = line * BOXSIZE;
            
            switch ( char )
            {
                case 'X':
                    
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "green" );
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case '0':
                    var r = 0;
                    
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "black" );
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    plat.restitution = r;
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case '9':
                    var r = .9;
                    
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "lightgrey" );
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    plat.restitution = r;
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case 'S':
                    
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "darkgrey" );
                	s.subDraw = breakBoxDraw;
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    plat.yHit = function (d) { /*console.log( "hitS", this );*/ if ( d < 0 ) return true; };
                    plat.restitution = 0; // no bounce
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case 'Z':
                    
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "darkgrey" );
                	s.subDraw = specialBoxDraw;
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    plat.yHit = function (d) { /*console.log( "hitZ", this );*/ if ( d < 0 ) this.sprite.color = cGen.next().value; };
                    plat.restitution = 0; // no bounce
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case '*':
                    
                    var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "gold" );
                    var plat = new PhysicsEntity( PhysicsEntity.ESLASTIC, PhysicsEntity.KINEMATIC, x, y, s );
                    plat.anyHit = function () { /*console.log( "hit", this );*/ eng.toRemove.push( this ); };
                    eng.entities.push( plat );
                    curColBlock.push( plat );
                    
                    break;
                case '#':
                    
                    break;
                case 'P':
                
                	var s = new PAXColorSprite( BOXSIZE, BOXSIZE, "purple" ); //PAXSprite( 32, 32, 'http://sfcstech.x10.mx/images/sprites/walker32x32.png', BOXSIZE, BOXSIZE );
                    eng.player = new PhysicsEntity( PhysicsEntity.DISPLACE, PhysicsEntity.DYNAMIC, x, y, s );
                    eng.entities.push( eng.player );
                    
                    break;
            }
        }
    }
}

function specialBoxDraw( ctx, sprite )
{
	ctx.strokeStyle = "darkblue";
	ctx.strokeRect( 0, 0, sprite.width, sprite.height );
	ctx.font = "36pt sans-serif";
	ctx.fillStyle = "black";
	ctx.fillText( "?", 10, BOXSIZE - 5 );
}

function breakBoxDraw( ctx, sprite )
{
	ctx.strokeStyle = "darkgreen";
	ctx.strokeRect( 0, 0, sprite.width, sprite.height );
}