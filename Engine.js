function Engine ( collider, solverHit, solver1, solver2 )
{
	this.collider = { detectCollisions: collider };
	this.solver = { resolveHit: solverHit, resolveY: solver1, resolveX: solver2 };
	this.entities = [];
	this.collidables = [];
}

Engine.prototype = {
	remove:
		function ( el, collisions )
		{
			var i = this.entities.indexOf( el );
			if ( i >= 0 ) this.entities.splice( i, 1 );
			
			i = this.collidables.indexOf( el );
			if ( i >= 0 ) this.collidables.splice( i, 1 );
			
			i = collisions.indexOf( el );
			if ( i >= 0 ) collisions.splice( i, 1 );
		},
	step:
		function()
		{
			// move entities
			
			var elapsed = 1;
	
			var gx = GRAVITY_X * elapsed;
			var gy = GRAVITY_Y * elapsed;
			var entity;
			var entities = this.entities;
	
			if ( this.entities )
			{
				for ( var i = 0, length = this.entities.length; i < length; i++ )
				{
					entity = this.entities[i];
					switch (entity.type)
					{
						case PhysicsEntity.DYNAMIC:
							entity.vx += entity.ax * elapsed + gx;
							entity.vy += entity.ay * elapsed + gy;
							entity.x  += entity.vx * elapsed;
							entity.y  += entity.vy * elapsed;
							break;
						case PhysicsEntity.KINEMATIC:
							entity.vx += entity.ax * elapsed;
							entity.vy += entity.ay * elapsed;
							entity.x  += entity.vx * elapsed;
							entity.y  += entity.vy * elapsed;
							break;
					}
				}
			}
			
			// set collidables
			
			var d = (this.player.x + this.player.width) % levelXchunk;
			var i = Math.floor( this.player.x  / levelXchunk );
			if ( d >= 0 && d <= this.player.width && i + 1 < this.colBlocks.length )
				this.collidables = [].concat( this.colBlocks[i], this.colBlocks[i+1] );
			else
				this.collidables = this.colBlocks[i];
				
			
			// find hits
			
			var collisions = this.collider.detectCollisions(
				this.player, 
				this.collidables
			);
 			
 			this.toRemove = [];
 			
			if ( collisions != null ) {
				this.solver.resolveHit( this.player, collisions );
			}
			
			// process remove queue
			for ( var el of this.toRemove ) this.remove( el, collisions );
			this.toRemove = [];
		
			// deal with Y collisions first
 			
 			this.player.outVY = [];
 			
			if (collisions != null) {
				this.solver.resolveY(this.player, collisions);
			}
			
			if ( this.player.outVY.length > 0 )
			{
				var sum = this.player.outVY.reduce( ( s, n ) => s + n );
				var avg = sum / this.player.outVY.length;
			
				this.player.vy = avg;
			}
		
			// deal with X collisions
	 
			collisions2 = this.collider.detectCollisions(
				this.player, 
				collisions // only deal with previously existing collisions (risky?)
			);
	 
			/*collisions = this.collider.detectCollisions(
				this.player, 
				this.collidables
			);*/
 			
 			this.player.outVX = [];
 
			if (collisions2 != null) {
				this.solver.resolveX(this.player, collisions2);
			}
			
			if ( this.player.outVX.length > 0 )
			{
				var sum = this.player.outVX.reduce( ( s, n ) => s + n );
				var avg = sum / this.player.outVX.length;
			
				this.player.vx = avg;
			}
			
			// process remove queue
			for ( var el of this.toRemove ) this.remove( el, collisions );
			this.toRemove = [];
		
			// draw
	
			var board = document.querySelector( "#board" );
			var ctx = board.getContext( "2d" );
	
			ctx.clearRect( 0, 0, board.width, board.height );
		
			ctx.save();
			
			var x = Math.min( 0, hboardX - this.player.x );
			var y = Math.min( 0, hboardY - this.player.y );
			x = Math.max( x, boardX - levelX );
			y = Math.max( y, boardY - levelY );
			
			ctx.translate( x, y );
		
			for ( var el of this.entities )
			{
				ctx.save();
				ctx.translate( el.x, el.y );
				el.sprite.draw( ctx );
				//ctx.fillRect( el.x, el.y, el.width, el.height );
				ctx.restore();
			}
			
			ctx.restore();
		}
	};