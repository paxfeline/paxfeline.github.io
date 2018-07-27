var abs = Math.abs;

var resolveHit = function( player, entity ) {
	if ( entity.anyHit ) entity.anyHit();
};

var resolveY = function(player, entity) {

    // Find the mid points of the entity and player
    var pMidX = player.getMidX();
    var pMidY = player.getMidY();
    var aMidX = entity.getMidX();
    var aMidY = entity.getMidY();
     
     // FIX: (or build everything from squares?)
     // "normalized" ignores actual boundaries
     
    // To find the side of entry calculate based on
    // the normalized sides
    var dx = (aMidX - pMidX) / entity.halfWidth;
    var dy = (aMidY - pMidY) / entity.halfHeight;
     
    // Calculate the absolute change in x and y
    var absDX = abs(dx);
    var absDY = abs(dy);
     
    // If the object is approaching from the top or bottom
    if ( absDX < absDY + 0.1 )
    {
		//console.log( `v hit @ ${player.vy}` );
		
		if ( entity.yHit && entity.yHit( dy ) ) eng.toRemove.push( entity );
		
        // If the player is approaching from positive Y
        if (dy < 0) {
            player.y = entity.getBottom();
 
        } else {
        // If the player is approaching from negative Y
            player.y = entity.getTop() - player.height;
        }
         
        // Velocity component
        //player.vy = -player.vy * entity.restitution;
        var vyout = -player.vy * entity.restitution;
        if (abs(vyout) < STICKY_THRESHOLD)
        {
            vyout = 0;
			//console.log( "v stick" );
        }
        player.outVY.push( vyout );
    }
};

var resolveX = function(player, entity) {

    // Find the mid points of the entity and player
    var pMidX = player.getMidX();
    var pMidY = player.getMidY();
    var aMidX = entity.getMidX();
    var aMidY = entity.getMidY();
     
     // FIX: (or build everything from squares?)
     // "normalized" ignores actual boundaries
     
    // To find the side of entry calculate based on
    // the normalized sides
    var dx = (aMidX - pMidX) / entity.halfWidth;
    var dy = (aMidY - pMidY) / entity.halfHeight;
     
    // Calculate the absolute change in x and y
    var absDX = abs(dx);
    var absDY = abs(dy);
     
    // If the object is approaching from the sides
    if ( absDX >= absDY + 0.1 )
    {
		//console.log( "h hit" );
		
        if ( entity.xHit && entity.xHit( dy ) ) eng.toRemove.push( entity );
		
        // If the player is approaching from positive X
        if (dx < 0) {
            player.x = entity.getRight();
 
        } else {
        // If the player is approaching from negative X
            player.x = entity.getLeft() - player.width;
        }
         
        // Velocity component
        /*player.vx = -player.vx * entity.restitution;
 
        if (abs(player.vx) < STICKY_THRESHOLD) {
            player.vx = 0;
			console.log( "h stick" );
        }*/
        
        var vxout = -player.vx * entity.restitution;
        if (abs(vxout) < STICKY_THRESHOLD)
        {
            vxout = 0;
			//console.log( "h stick" );
        }
        player.outVX.push( vxout );
    }
};

var resolveAllHit = 
	function ( player, collidees )
	{
		for ( var el of collidees )
			resolveHit( player, el );
	};

var resolveAllY = 
	function ( player, collidees )
	{
		for ( var el of collidees )
			resolveY( player, el );
	};

var resolveAllX = 
	function ( player, collidees )
	{
		for ( var el of collidees )
			resolveX( player, el );
	};