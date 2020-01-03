// Collision Decorator Pattern Abstraction
 
// These methods describe the attributes necessary for
// the resulting collision calculations
 
var Collision = {
 
    // Elastic collisions refer to the simple cast where
    // two entities collide and a transfer of energy is
    // performed to calculate the resulting speed
    // We will follow Box2D's example of using
    // restitution to represent "bounciness"
 
    elastic: function(restitution) {
        this.restitution = restitution || .5 //.2
    },
 
    displace: function() {
        // While not supported in this engine
           // the displacement collisions could include
        // friction to slow down entities as they slide
        // across the colliding entity
    }
};

// The physics entity will take on a shape, collision
// and type based on its parameters. These entities are
// built as functional objects so that they can be
// instantiated by using the 'new' keyword.
 
var PhysicsEntity = function( collisionName, type, x, y, sprite ) {
 
    // Setup the defaults if no parameters are given
    // Type represents the collision detector's handling
    this.type = type || PhysicsEntity.DYNAMIC;
 
    // Collision represents the type of collision
    // another object will receive upon colliding
    this.collision = collisionName || PhysicsEntity.ELASTIC;
 
 	this.states =
 		{
 			"default": sprite
 		};
 	
 	this.updateState( "default" );
 
 	var w = sprite.width;
 	var h = sprite.height;
 
    // Take in a width and height
    this.width  = w;
    this.height = h;
 
    // Store a half size for quicker calculations
    this.halfWidth = this.width * .5;
    this.halfHeight = this.height * .5;
 
    var collision = Collision[ this.collision ];
    collision.call(this);
 
    // Setup the positional data in 2D
 
    // Position
    this.x = x;
    this.y = y;
 
    // Velocity
    this.vx = 0;
    this.vy = 0;
 
    // Acceleration
    this.ax = 0;
    this.ay = 0;
 
    // Update the bounds of the object to recalculate
    // the half sizes and any other pieces
    this.updateBounds();
};
 
// Physics entity calculations
PhysicsEntity.prototype = {

	// add a new 'skin' to use
	addState:
		function ( name, state )
		{
			this.states[ name ] = state;
		},

	// set skin and update bounds (immediately)
	updateState:
		function ( state )
		{
			if ( ! this.curState )
			{
				this.curStateName = state;
				this.curState = this.states[ state ];
				this.updateBounds();
			}
			else
			{
				var w1 = this.curState.width;
				var h1 = this.curState.height;
			
				this.curStateName = state;
				this.curState = this.states[ state ];
			
				var dx, dy;
			
				if ( ! this.flipX )
				{
					dx = w1 - this.curState.width;
					this.x += dx;
				}
			
				dy = h1 - this.curState.height;
				this.y += dy;
			
				this.updateBounds();
			}
		},

	// set skin and update bounds (immediately)
	updateStateInPlace:
		function ( state )
		{
			this.updateState( this.curStateName );
		},

	stateStack: [],
	
	nextState:
		function ( ts )
		{
			var state, delay;
			
			if ( this.stateStack.length > 1 )
			{
				({ state, delay } = this.stateStack.shift());
			
				var t = ts ? ts : performance.now();
				this.stateStart = t;
				this.stateDur = delay;
			}
			else
			{
				this.stateStart = null;
				this.stateDur = null;
				
				state = this.stateStack[0];
			}
			
			this.updateState( state );
		},
	
	pushState:
		function ( state, delay )
		{
			this.stateStack.push( { state: state, delay: delay } );
			
			if ( this.stateStack.length == 1 )
				this.nextState();
		},
	
	clearStateStack:
		function ()
		{
			this.stateStack = [];
		},
	
	setState:
		function ( state )
		{
			this.stateStack = [ state ];
			this.updateState( state );
		},
		
	frame:
		function ( ctx, el, t )
		{
			ctx.save();
			ctx.translate( el.x, el.y );
			
			if ( this.stateDur && t - this.stateStart >= this.stateDur )
			{
				this.nextState();
				this.lastFrame = t;
			}
		
			if ( this.lastFrame && t - this.lastFrame >= this.curState.targetFrameDelay )
			{
				this.curState.index = ++this.curState.index % (this.curState.length || 1);
				this.lastFrame = t;
			}
			
			if ( !this.lastFrame )
				this.lastFrame = t;
			
			this.curState.draw( ctx, el );
			
			ctx.restore();
		},
 
    // Update bounds includes the rect's
    // boundary updates
    updateBounds:
    	function() {
			this.width = this.curState.width;
			this.height = this.curState.height;
		
			this.halfWidth = this.width * .5;
			this.halfHeight = this.height * .5;
		},
 
    // Getters for the mid point of the rect
    getMidX: function() {
        return this.halfWidth + this.x;
    },
 
    getMidY: function() {
        return this.halfHeight + this.y;
    },
 
    // Getters for the top, left, right, and bottom
    // of the rectangle
    getTop: function() {
        return this.y;
    },
    getLeft: function() {
        return this.x;
    },
    getRight: function() {
        return this.x + this.width;
    },
    getBottom: function() {
        return this.y + this.height;
    }
};

// Engine Constants
 
// These constants represent the 3 (sic) different types of
// entities acting in this engine
// These types are derived from Box2D's engine that
// model the behaviors of its own entities/bodies
 
// Kinematic entities are not affected by gravity, and
// will not allow the solver to solve these elements
// These entities will be our platforms in the stage
PhysicsEntity.KINEMATIC = 'kinematic';
 
// Dynamic entities will be completely changing and are
// affected by all aspects of the physics system
PhysicsEntity.DYNAMIC   = 'dynamic';
 
// Solver Constants
 
// These constants represent the different methods our
// solver will take to resolve collisions
 
// The displace resolution will only move an entity
// outside of the space of the other and zero the
// velocity in that direction
PhysicsEntity.DISPLACE = 'displace';
 
// The elastic resolution will displace and also bounce
// the colliding entity off by reducing the velocity by
// its restituion coefficient
PhysicsEntity.ELASTIC = 'elastic';