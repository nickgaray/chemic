/******************************************************************************

Author - Nick Garay - https://github.com/nickgaray

All reference material copyright of the respective owners. 

******************************************************************************/


//*************************************************************************
// Constants
//*************************************************************************
const ZERO_PI 		= 0;
const QUARTER_PI 	= Math.PI * 0.25;
const HALF_PI 		= Math.PI * 0.50;
const THREE_QUARTER_PI 	= Math.PI * 0.75;
const PI 		= Math.PI;
const TWO_PI 		= Math.PI * 2;

//*************************************************************************
// Creates an ellipsoid with optional scaling along each axis.
//*************************************************************************
function createEllipsoid( resolution, endTheta, endPhi, scaleX, scaleY, scaleZ ) {

	// The geometry of the ellipsoid
	var ellipsoid = new THREE.Geometry();

	// The number of bands of latitude and longitude, i.e. subdivisions of ellipsoid
	var latitudeBands = resolution;
	var longitudeBands = resolution;

	// Default scalar values of axis
	var e = 1;

	var a = 1;
	var b = 1;
	var c = 1;

	if ( scaleX ) {

		a = scaleX;
	}

	if ( scaleY ) {

		b = scaleY;
	}

	if ( scaleZ ) {

		c = scaleZ;
	}
	
	// Plot the ellipsoid
	for ( var latNumber = 0; latNumber <= latitudeBands; ++latNumber ) {

		var theta = latNumber * endTheta / latitudeBands;
		var sinTheta = Math.sin( theta );
		var cosTheta = Math.cos( theta );

		for ( var lonNumber = 0; lonNumber <= longitudeBands; ++lonNumber ) {

			var phi = lonNumber * endPhi / longitudeBands;
			var sinPhi = Math.sin( phi );
			var cosPhi = Math.cos( phi );

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;

			x *= a;
			y *= b;
			z *= c;

			ellipsoid.vertices.push( new THREE.Vector3( x, y, z ) );
		}
	}

	// Construct the faces
	for ( var latNumber = 0; latNumber < latitudeBands; ++latNumber ) {

		for ( var lonNumber = 0; lonNumber < longitudeBands; ++lonNumber ) {

			var first = ( latNumber * ( longitudeBands + 1 ) ) + lonNumber;

			var second = first + longitudeBands + 1;
		
			ellipsoid.faces.push( new THREE.Face3( first, second, first + 1 ) );

			ellipsoid.faces.push( new THREE.Face3( second, second + 1, first + 1 ) );
		}
	}					
	
	// Return the geometry
	return ellipsoid;
} 

//*************************************************************************
// Creates an spherical cone with optional scaling along each axis and an 
// optional focal point distance for the cone ( default is 1 ) pointing 
// in the negative y-axis.
// 
//*************************************************************************
function createSphericalCone( resolution, focalPoint, scaleX, scaleY, scaleZ ) {

	// The geometry of the spherical cone
	var sphericalCone = new THREE.Geometry();

	// The number of bands of latitude and longitude, i.e. subdivisions of ellipsoid
	var latitudeBands = resolution;
	var longitudeBands = resolution;

	// Default scalar values of axis
	var a = 1;
	var b = 1;
	var c = 1;

	var f = -1;

	if ( scaleX ) {

		a = scaleX;
	}

	if ( scaleY ) {

		b = scaleY;
	}

	if ( scaleZ ) {

		c = scaleZ;
	}
	
	if ( focalPoint ) {
	
		f *= focalPoint;
	}
	
	// Plot the ellipsoid
	for ( var latNumber = 0; latNumber <= latitudeBands; ++latNumber ) {

		var theta = latNumber * ( HALF_PI ) / latitudeBands;
		var sinTheta = Math.sin( theta );
		var cosTheta = Math.cos( theta );

		for ( var lonNumber = 0; lonNumber <= longitudeBands; ++lonNumber ) {

			var phi = lonNumber * ( TWO_PI ) / longitudeBands;
			var sinPhi = Math.sin( phi );
			var cosPhi = Math.cos( phi );

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;

			x *= a;
			y *= b;
			z *= c;

			sphericalCone.vertices.push( new THREE.Vector3( x, y, z ) );
		}
	}

	// Construct the spherical faces
	for ( var latNumber = 0; latNumber < latitudeBands; ++latNumber ) {

		for ( var lonNumber = 0; lonNumber < longitudeBands; ++lonNumber ) {

			var first = ( latNumber * ( longitudeBands + 1 ) ) + lonNumber;

			var second = first + longitudeBands + 1;
		
			sphericalCone.faces.push( new THREE.Face3( first, second, first + 1 ) );

			sphericalCone.faces.push( new THREE.Face3( second, second + 1, first + 1 ) );
		}
	}
			
	// Construct the conical faces with the given focal point
	sphericalCone.vertices.push( new THREE.Vector3( 0, f, 0 ) );
	
	for ( var lonNumber = 0; lonNumber < longitudeBands; ++lonNumber ) {
	
		var first = ( latitudeBands * ( longitudeBands + 1 ) ) + lonNumber;

		var second = first + 1;
		
		sphericalCone.faces.push( new THREE.Face3( first, second, sphericalCone.vertices.length - 1) );
	}
	
	// Return the geometry
	return sphericalCone;
} 
