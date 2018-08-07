// Rect collision tests the edges of each rect to
// test whether the objects are overlapping the other
var CollisionDetector_collideRect = 
    function(collider, collidee) {
    
    if ( !collider || !collidee ) { console.log( "collision error", collider, collidee ); return false; }
 
    // Store the collider and collidee edges
    var l1 = collider.getLeft();
    var t1 = collider.getTop();
    var r1 = collider.getRight();
    var b1 = collider.getBottom();
    
    var hitDelta = 1;
    
    var l2 = collidee.getLeft() + hitDelta;
    var t2 = collidee.getTop() + hitDelta;
    var r2 = collidee.getRight() - hitDelta;
    var b2 = collidee.getBottom() - hitDelta;
     
     //console.log( l1, t1, r1, b1, l2, t2, r2, b2 );
     
    // If the any of the edges are beyond any of the
    // others, then we know that the box cannot be
    // colliding
    if (b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2) {
        return false;
    }
     
    // If the algorithm made it here, it had to collide
    return true;
};

var CollisionDetector_checkAll = 
    function(collider, collidees) {
    	var r = [];
    	
    	if ( !collidees ) return;
    	
    	for ( var el of collidees )
    	{
    		if ( CollisionDetector_collideRect( collider, el ) )
    			r.push( el );
    	}
    	
    	return r;
};