/******************************************************************************

Copyright © 2017 - Nick Garay - All Rights Reserved

You may NOT use, copy, distribute or otherwise modify the content on this 
module without written permission. 

All reference material copyright of the respective owners. 

******************************************************************************/

//*****************************************************************************
// Atom - Handles the composition and rendering of an atomic structure for a
// given element given the parameters.
//*****************************************************************************
var Atom = function( number, mass, name, symbol, periodNbr ) {

	//*************************************************************************
	// Constants
	//*************************************************************************
	const BOHR_MODEL_NUCLEAR_RADIUS = 0.75;
	const INITIAL_BOHR_MODEL_RADIUS = 1;
	const BOHR_MODEL_RADIUS_STEP = 0.5;
	const BOHR_MODEL_SHELL_COLOR = 0x000000;
	const BOHR_MODEL_SHELL_OPACITY = 1.0;
	
	const ELECTRON_DIAMETER = 0.10;
	const PARTICLE_DIAMETER = 0.05;
	const NUCLEAR_PARTICLE_DIAMETER = 0.04;
	
	const ELECTRON_COLOR = 0x0000FF;
	const PROTON_COLOR = 0xFF0000;
	const NEUTRON_COLOR = 0xFFFFFF;

	const NUM_SEGMENTS = 10;

	const POINTS_IN_SHELL_GEOMETRY = 100;
	const POINTS_IN_SHELL_CURVE = 100;

	//*************************************************************************
	// Class Variables - Private hence no 'this.' in front of them
	//*************************************************************************

	// The atomic number, used in calculations for creating objects
	var atomicNumber = number;

	// The atomic mass, used in calculations for creating objects
	var atomicMass = mass;

	// The element name for display purposes
	var theName = name;

	// The element symbol for display purposes
	var theSymbol = symbol;

	// The period the element belongs to
	var period = periodNbr;

	// These variables are used in memory management to cleanup the scene when this atom is deleted
	var bohrModel;
	var shellMaterial;
	var electronMaterial;
	var protonMaterial;
	var neutronMaterial;
	var shellGeometries = [];
	var electronGeometries = [];
	var particleGeometries = [];

	var spdfModel;
	var shellMaterials = [];
	var sShellGeometries = [];
	var pShellGeometries = [];
	var dShellGeometries = [];
	var fShellGeometries = [];

	console.log( 'Atom - name: ' + 	theName + 
		     ' number: ' + atomicNumber + 
		     ' mass: ' + atomicMass + 
		     ' symbol: ' + theSymbol + 
		     ' period: ' + period );

	//*************************************************************************
	// Performs the cleanup and disposition of objects to release memory
	//*************************************************************************
	var cleanupFromModel = function( objects, model ) {

		// If objects is an array of objects
		if ( Object.prototype.toString.call( objects ) === '[object Array]' ) {

			if ( objects.length > 0 ) {

				// Walk the array removing and disposing each element
				var idx = objects.length;

				do {
					--idx;

					// Get the object being cleaned up
					var object = objects[ idx ];
	
					// Remove an element from the array
					objects.splice( idx, 1 );

					// Remove the object from the model
					model.remove( object );

					if ( object.dispose !== undefined ) {
	
						// Dispose of the object
						object.dispose();
					}
				
					object = null;

				} while ( objects.length > 0 );
			}
		}
		else { // objects is just a single object to be disposed
			
			// Remove the object from the model
			model.remove( objects );

			// Dispose of the object
			objects.dispose();

			objects = null;
		}
	}

	//*************************************************************************
	// Utility function to cleanup memory for model no longer being rendered
	// Geometries and Materials need to be disposed.
	//*************************************************************************
	this.cleanup = function() {

		cleanupFromModel( electronGeometries, bohrModel );
		cleanupFromModel( shellGeometries, bohrModel );
		cleanupFromModel( particleGeometries, bohrModel );
		cleanupFromModel( electronMaterial, bohrModel );
		cleanupFromModel( protonMaterial, bohrModel );
		cleanupFromModel( neutronMaterial, bohrModel );
		cleanupFromModel( shellMaterial, bohrModel );

		cleanupFromModel( shellMaterials, spdfModel );
		cleanupFromModel( sShellGeometries, spdfModel );
		cleanupFromModel( pShellGeometries, spdfModel );
		cleanupFromModel( dShellGeometries, spdfModel );
		cleanupFromModel( fShellGeometries, spdfModel );

		bohrModel = null;
		spdfModel = null;
	};
	
	//*************************************************************************
	// Creates the orbitals and their respective electrons.
	//*************************************************************************
	function createBohrOrbitals() {

		// Number of electrons is number of protons in a stable atom
		var numElectrons = atomicNumber;

		// Set the initial radius
		var radius = INITIAL_BOHR_MODEL_RADIUS;
		
		// Set the initial energy level
		var energyLevel = 1;
		
		// Initialize the radian step
		var stepRadians = 0;

		// Create a new shell material
		shellMaterial = new THREE.LineBasicMaterial( { color : BOHR_MODEL_SHELL_COLOR, transparent: true, opacity: BOHR_MODEL_SHELL_OPACITY } );
		
		// Create a new electorn material
		electronMaterial = new THREE.MeshBasicMaterial( { color: ELECTRON_COLOR } );
		
		do {
		
			// Create an ellipse curve representing the orbital shell
			var curve = new THREE.EllipseCurve( 0, 0, radius, radius, 0, TWO_PI, false, 0 );

			// Create a path from the curve in order to create the geometry
			var path = new THREE.Path( curve.getPoints( POINTS_IN_SHELL_CURVE ) );

			// Create a geometry for the orbital shell
			var shellGeometry = path.createPointsGeometry( POINTS_IN_SHELL_GEOMETRY );
		
			// Add to list of geometries
			shellGeometries.push( shellGeometry );

			// Create a new line from the shell geometry and material
			var shell = new THREE.Line( shellGeometry, shellMaterial );

			// Add the shell to the Bohr Model
			bohrModel.add( shell );

			// Calculate number of electrons in the shell based on energy level
			var numShellElectrons = Math.min( 2 * Math.pow( energyLevel, 2 ), numElectrons );

			// Calculate the arc space between electrons in the shell
			stepRadians = ( TWO_PI ) / numShellElectrons;
			
			// For each electron to be added to the shell
			for ( var electronIdx = 0; electronIdx < numShellElectrons; ++electronIdx ) {
			
				// Calculate its position
				var x = radius * Math.cos( stepRadians * electronIdx );
				var y = radius * Math.sin( stepRadians * electronIdx );
				
				// Create a geometry for the electron
				var electronGeometry = new THREE.SphereGeometry( ELECTRON_DIAMETER, NUM_SEGMENTS, NUM_SEGMENTS );
				
				// Place in correct location
				electronGeometry.translate( x, y, 0 );

				// Add to the list of electron geometries
				electronGeometries.push( electronGeometry );
		
				// Create a mesh for the electron
				var electron = new THREE.Mesh( electronGeometry, electronMaterial );

				// Add the electron to the model
				bohrModel.add( electron );
			}

			// Next energy level
			++energyLevel;
			
			// Number of electrons remaining
			numElectrons -= numShellElectrons ;			

			// Radius of possible next shell
			radius += BOHR_MODEL_RADIUS_STEP;
		
		} while ( numElectrons > 0 );
	}

	//*************************************************************************
	// Creates the nucleus of the atom.
	//*************************************************************************
	function createBohrNucleus() {
		
		// Create a material for all protons
		protonMaterial = new THREE.MeshBasicMaterial( { color: PROTON_COLOR } );

		// Create a material for all neutrons
		neutronMaterial = new THREE.MeshBasicMaterial( { color: NEUTRON_COLOR } );

		// Initialize the radian step
		var stepRadians = 0;

		// Compute number of particles to be added to the model at the nucleus
		var numParticles = atomicNumber +  Math.floor( atomicMass - atomicNumber );	

		// Number of protons
		var numProtons = atomicNumber;

		// Initial number of particles to add to model
		var numParticlesToAdd = 1;

		// A layer, for usage in concentric circles of particles
		var layer = 0;
		
		// Flag to indicate need to add a proton
		var addProton = true;

		do {
			// Calculate the arc spacing of particles
			stepRadians = TWO_PI / numParticlesToAdd;

			// The radius is twice the particle diameter increasing each layer, this is how far from center particles are added
			radius = NUCLEAR_PARTICLE_DIAMETER * layer * 2;
			
			// For the number of particles to add
			for ( var particleCount  = 0; particleCount < numParticlesToAdd; ++particleCount ) {

				// Compute particle position
				var x = radius * Math.cos( particleCount * stepRadians );
				var y = radius * Math.sin( particleCount * stepRadians );

				// Create a new geometry for the particle
				var particleGeometry = new THREE.SphereGeometry( NUCLEAR_PARTICLE_DIAMETER, NUM_SEGMENTS, NUM_SEGMENTS );
				
				// Move the particle to correct location
				particleGeometry.translate( x, y, 0 );

				// Add the particle geometry to list of particle geometries
				particleGeometries.push( particleGeometry );

				// Holder for material to use
				var particleMaterial;

				// If we still have protons and we need to add them to model
				if ( numProtons && addProton ) {

					// Set the material to the proton material
					particleMaterial = protonMaterial;
					
					// Decrement number of protons
					--numProtons;
					
					// Indicate next particle to be neutron
					addProton = false;
				}
				else {

					// Set the material to the neutron material
					particleMaterial = neutronMaterial;
			
					// Indicate next particle to be proton
					addProton = true;
				}

				// Create a mesh for the particle given geometry and material
				var particle = new THREE.Mesh( particleGeometry, particleMaterial );

				// Add the particle to the model
				bohrModel.add( particle );
			}

			// Num particles less the number added this pass
			numParticles -= numParticlesToAdd;

			// Move to next layer
			++layer;

			// Compute the perimeter, used to measure how many particles to add in next pass
			var perimeter = ( NUCLEAR_PARTICLE_DIAMETER * layer ) * TWO_PI;

			// Compute number of particles to add
			numParticlesToAdd = Math.floor( Math.min( perimeter / NUCLEAR_PARTICLE_DIAMETER, numParticles ) );

		} while( numParticles > 0 )	
	}

	//*************************************************************************
	// Creates and returns the scene graph Bohr Model of the atom.
	//*************************************************************************
	this.createBohrModel = function() {

		// Create the scene graph container
		bohrModel = new THREE.Object3D();
		
		// Create the orbital shells
		createBohrOrbitals();

		// Create the nuclues
		createBohrNucleus();

		// Return the scene graph	
		return bohrModel;
	};
	
	//*************************************************************************
	// Creates and returns an S-Shell with given opacity and scale.
	// S-Shells are spherical shells
	//*************************************************************************
	function create_S_Shell( resolution, opacity, scale ) { 

		var sShell = new THREE.Object3D();

		var properties = { color: 'red', 
				   shading: THREE.SmoothShading,
				   side: THREE.DoubleSide,
				   wireframe: false,
				   opacity: opacity,
				   transparent: true };

		var ellipsoid = createEllipsoid( resolution, PI, TWO_PI );

		ellipsoid.scale( scale, scale, scale );

		sShellGeometries.push( ellipsoid );
		
		var material = new THREE.MeshLambertMaterial( properties );

		shellMaterials.push( material );

		var mesh = new THREE.Mesh( ellipsoid, material );

		sShell.add( mesh );

		return sShell;
	};

	//*************************************************************************
	// Creates and returns an the P-Shells with given opacity and scale.
	// P-Shells have six sperical cones oriented along the major axis (x, y, & z)
	// The pairing of sperical cones on an axis is known aslo as a "dumbell".
	// Boolean pX, pY, pZ are optional and if not specified the
	// Px-orbitals will be created by default.
	//*************************************************************************
	function create_P_Shells( resolution, opacity, scale, pX, pY, pZ ) {

		var focalPoint = 1.5;

		var properties1 = { color: 'yellow', 
				   shading: THREE.SmoothShading,
				   side: THREE.DoubleSide,
				   wireframe: false,
				   opacity: opacity,
				   transparent: true };

		var properties2 = { color: 'orange', 
				   shading: THREE.SmoothShading,
				   side: THREE.DoubleSide,
				   wireframe: false,
				   opacity: opacity,
				   transparent: true };

		var pShells = new THREE.Object3D();

		var material1 = new THREE.MeshLambertMaterial( properties1 );
		var material2 = new THREE.MeshLambertMaterial( properties2 );

		shellMaterials.push( material1 );
		shellMaterials.push( material2 );


		// Note: After creating the sperical cones the tear drop is in need of reorientation about the z-axis
		// This initial rotation corrects the positioning of the tip of the teardrop from pointing down
		// the negative y-axis to pointing towards the negative x-axis.  After this initial orientation
		// other rotations can be applied to reorient the sperical cones correctly

		if ( ( pX === undefined ) || ( pX === true  ) ) {

			var sc1 = createSphericalCone( resolution, focalPoint );
			sc1.scale( scale, scale, scale );
			sc1.rotateZ( -HALF_PI );
			sc1.translate( scale * focalPoint, 0, 0 );
			var m1 = new THREE.Mesh( sc1, material1 );
			pShells.add( m1 );		

			var sc2 = createSphericalCone( resolution, focalPoint );
			sc2.scale( scale, scale, scale );
			sc2.rotateZ( -HALF_PI );
			sc2.rotateY( PI );
			sc2.translate( -scale * focalPoint, 0, 0 );
			var m2 = new THREE.Mesh( sc2, material2 );
			pShells.add( m2 );

			pShellGeometries.push( sc1 );
			pShellGeometries.push( sc2 );
		}

		if ( ( pY !== undefined ) && ( pY === true ) ) {

			var sc3 = createSphericalCone( resolution, focalPoint );
			sc3.scale( scale, scale, scale );
			sc3.rotateZ( -HALF_PI );
			sc3.rotateY( HALF_PI );
			sc3.translate( 0, 0, -scale * focalPoint );
			var m3 = new THREE.Mesh( sc3, material1 );
			pShells.add( m3 );

			var sc4 = createSphericalCone( resolution, focalPoint );
			sc4.scale( scale, scale, scale );
			sc4.rotateZ( -HALF_PI );
			sc4.rotateY( -HALF_PI );
			sc4.translate( 0, 0, scale * focalPoint );
			var m4 = new THREE.Mesh( sc4, material2 );
			pShells.add( m4 );

			pShellGeometries.push( sc3 );
			pShellGeometries.push( sc4 );
		}

		if ( ( pZ !== undefined ) && ( pZ === true ) ) {

			var sc5 = createSphericalCone( resolution, focalPoint );
			sc5.scale( scale, scale, scale );
			sc5.rotateZ( -HALF_PI );
			sc5.rotateZ( HALF_PI );
			sc5.translate( 0, scale * focalPoint, 0 );
			var m5 = new THREE.Mesh( sc5, material1 );
			pShells.add( m5 );

			var sc6 = createSphericalCone( resolution, focalPoint );
			sc6.scale( scale, scale, scale );
			sc6.rotateZ( -HALF_PI );
			sc6.rotateZ( -HALF_PI );
			sc6.translate( 0, -scale * focalPoint, 0 );
			var m6 = new THREE.Mesh( sc6, material2 );
			pShells.add( m6 );

			pShellGeometries.push( sc5 );
			pShellGeometries.push( sc6 );
		}
	
		return pShells;
	}

	//*************************************************************************
	// Creates and returns an D-Shells with given opacity and scale.
	// D-Shells have 18 sperical cones in various orientations with the dZ2
	// shell also presenting a toroid orbital about the z-axis.
	// The pairing of sperical cones is known aslo as a "dumbell".
	// Boolean dXZ, dYZ, dXY, dX2Y2, and dZ2 are optional and if not specified the
	// dXZ-orbitals will be created by default.
	//*************************************************************************
	function create_D_Shells( resolution, opacity, scale, dXZ, dYZ, dXY, dX2Y2, dZ2 ) { 

		var focalPoint = 2;

		// The radius of the torus is the lenght of the focal point + 1/2 radius of 
		// the sphere making base of spherical cones.  Since the sperical cones are unit spheres
		// the total torusRadius before scaling is 2.5.  The diameter is the 1/2 radius of
		// sperical cones base, hence 0.5 before scaling.
		var torusRadius = 2.5 * scale;
		var torusDiameter = 0.5 * scale;
		var radialSegments = 20;
		var tubularSegments = 100;

		var properties1 = { color: 'lightblue', 
				     shading: THREE.SmoothShading,
				     side: THREE.DoubleSide,
				     wireframe: false,
				     opacity: opacity,
				     transparent: true };

		var properties2 = { color: 'cyan', 
				     shading: THREE.SmoothShading,
				     side: THREE.DoubleSide,
				     wireframe: false,
				     opacity: opacity,	
				     transparent: true };

		var dShells = new THREE.Object3D();

		var material1 = new THREE.MeshLambertMaterial( properties1 );
		var material2 = new THREE.MeshLambertMaterial( properties2 );

		shellMaterials.push( material1 );
		shellMaterials.push( material2 );

		if ( ( dXZ === undefined ) || ( dXZ === true ) ) {

			// These spherical cones are rotated about the y-axis

			var sc1 = createSphericalCone( resolution, focalPoint );
			sc1.scale( scale, scale, scale );
			sc1.rotateZ( -HALF_PI );
			sc1.rotateY( QUARTER_PI );
			sc1.translate( scale * focalPoint * Math.cos( QUARTER_PI ), 0, scale * focalPoint * Math.sin( -QUARTER_PI ) );
			var m1 = new THREE.Mesh( sc1, material1 );
			dShells.add( m1 );

			var sc2 = createSphericalCone( resolution, focalPoint );
			sc2.scale( scale, scale, scale );
			sc2.rotateZ( -HALF_PI );
			sc2.rotateY( -THREE_QUARTER_PI );
			sc2.translate( scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), 0, scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			var m2 = new THREE.Mesh( sc2, material1 );
			dShells.add( m2 );

			var sc3 = createSphericalCone( resolution, focalPoint );
			sc3.scale( scale, scale, scale );
			sc3.rotateZ( -HALF_PI );
			sc3.rotateY( -QUARTER_PI );
			sc3.translate( scale * focalPoint * Math.cos( -QUARTER_PI ), 0, scale * focalPoint * Math.sin( QUARTER_PI ) );
			var m3 = new THREE.Mesh( sc3, material2 );
			dShells.add( m3 );

			var sc4 = createSphericalCone( resolution, focalPoint );
			sc4.scale( scale, scale, scale );
			sc4.rotateZ( -HALF_PI );
			sc4.rotateY( THREE_QUARTER_PI );
			sc4.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), 0, scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			var m4 = new THREE.Mesh( sc4, material2 );
			dShells.add( m4 );

			dShellGeometries.push( sc1 );
			dShellGeometries.push( sc2 );
			dShellGeometries.push( sc3 );
			dShellGeometries.push( sc4 );
		}

		if ( ( dYZ !== undefined ) && ( dYZ === true ) ) {

			// These spherical cones are rotated about the x-axis

			var sc5 = createSphericalCone( resolution, focalPoint );
			sc5.scale( scale, scale, scale );
			sc5.rotateX( -QUARTER_PI );
			sc5.translate( 0, scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ) );
			var m5 = new THREE.Mesh( sc5, material1 );
			dShells.add( m5 );

			var sc6 = createSphericalCone( resolution, focalPoint );
			sc6.scale( scale, scale, scale );
			sc6.rotateX( THREE_QUARTER_PI );
			sc6.translate( 0, scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			var m6 = new THREE.Mesh( sc6, material1 );
			dShells.add( m6 );

			var sc7 = createSphericalCone( resolution, focalPoint );
			sc7.scale( scale, scale, scale );
			sc7.rotateX( QUARTER_PI );
			sc7.translate( 0, scale * focalPoint * Math.cos( -QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ) );
			var m7 = new THREE.Mesh( sc7, material2 );
			dShells.add( m7 );

			var sc8 = createSphericalCone( resolution, focalPoint );
			sc8.scale( scale, scale, scale );
			sc8.rotateX( -THREE_QUARTER_PI );
			sc8.translate( 0, scale * focalPoint * Math.cos( THREE_QUARTER_PI ), scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			var m8 = new THREE.Mesh( sc8, material2 );
			dShells.add( m8 );

			dShellGeometries.push( sc5 );
			dShellGeometries.push( sc6 );
			dShellGeometries.push( sc7 );
			dShellGeometries.push( sc8 );
		}

		if ( ( dXY !== undefined ) && ( dXY === true ) ) {

			// These spherical cones are rotated about the z-axis

			var sc9 = createSphericalCone( resolution, focalPoint );
			sc9.scale( scale, scale, scale );
			sc9.rotateZ( -QUARTER_PI );
			sc9.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m9 = new THREE.Mesh( sc9, material1 );
			dShells.add( m9 );

			var sc10 = createSphericalCone( resolution, focalPoint );
			sc10.scale( scale, scale, scale );
			sc10.rotateZ( QUARTER_PI );
			sc10.translate( -scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m10 = new THREE.Mesh( sc10, material1 );
			dShells.add( m10 );

			var sc11 = createSphericalCone( resolution, focalPoint );
			sc11.scale( scale, scale, scale );
			sc11.rotateZ( THREE_QUARTER_PI );
			sc11.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m11 = new THREE.Mesh( sc11, material2 );
			dShells.add( m11 );

			var sc12 = createSphericalCone( resolution, focalPoint );
			sc12.scale( scale, scale, scale );
			sc12.rotateZ( -THREE_QUARTER_PI );
			sc12.translate( -scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m12 = new THREE.Mesh( sc12, material2 );
			dShells.add( m12 );

			dShellGeometries.push( sc9 );
			dShellGeometries.push( sc10 );
			dShellGeometries.push( sc11 );
			dShellGeometries.push( sc12 );
		}

		if ( ( dX2Y2 !== undefined ) && ( dX2Y2 === true ) ) {

			// These spherical cones are rotated about the z-axis

			var sc13 = createSphericalCone( resolution, focalPoint );
			sc13.scale( scale, scale, scale );
			sc13.rotateZ( -HALF_PI );
			sc13.translate( scale * focalPoint, 0, 0 );
			var m13 = new THREE.Mesh( sc13, material1 );
			dShells.add( m13 );

			var sc14 = createSphericalCone( resolution, focalPoint );
			sc14.scale( scale, scale, scale );
			sc14.rotateZ( HALF_PI );
			sc14.translate( -scale * focalPoint, 0, 0 );
			var m14 = new THREE.Mesh( sc14, material1 );
			dShells.add( m14 );

			var sc15 = createSphericalCone( resolution, focalPoint );
			sc15.scale( scale, scale, scale );
			sc15.rotateZ( ZERO_PI );
			sc15.translate( 0, scale * focalPoint, 0 );
			var m15 = new THREE.Mesh( sc15, material2 );
			dShells.add( m15 );

			var sc16 = createSphericalCone( resolution, focalPoint );
			sc16.scale( scale, scale, scale );
			sc16.rotateZ( PI );
			sc16.translate( 0, -scale * focalPoint, 0 );
			var m16 = new THREE.Mesh( sc16, material2 );
			dShells.add( m16 );

			dShellGeometries.push( sc13 );
			dShellGeometries.push( sc14 );
			dShellGeometries.push( sc15 );
			dShellGeometries.push( sc16 );
		}

		if ( ( dZ2 !== undefined ) && ( dZ2 === true ) ) {

			// These spherical cones are rotated about the x-axis

			var sc17 = createSphericalCone( resolution, focalPoint );
			sc17.scale( scale, scale, scale );
			sc17.rotateX( -HALF_PI );
			sc17.translate( 0, 0, -scale * focalPoint );
			var m17 = new THREE.Mesh( sc17, material1 );
			dShells.add( m17 );

			var sc18 = createSphericalCone( resolution, focalPoint );
			sc18.scale( scale, scale, scale );
			sc18.rotateX( HALF_PI );
			sc18.translate( 0, 0, scale * focalPoint );
			var m18 = new THREE.Mesh( sc18, material1 );
			dShells.add( m18 );

			var torus = new THREE.TorusGeometry( torusRadius, torusDiameter, 20, 100 );
			var tm = new THREE.Mesh( torus, material2 );
			dShells.add( tm ); 

			dShellGeometries.push( sc17 );
			dShellGeometries.push( sc18 );
			dShellGeometries.push( torus );
		}

		return dShells;
	};

	//*************************************************************************
	// Creates and returns an F-Shells with given opacity and scale.
	//*************************************************************************
	function create_F_Shells( resolution, opacity, scale, fZ3, fXZ2, fYZ2, fXX23Y2, fYY23X2, fXYZ, fZX23Y2 ) { 

		var focalPoint = 2;

		// The radius of the torus is the lenght of the focal point + 1/2 radius of 
		// the sphere making base of spherical cones.  Since the sperical cones are unit spheres
		// the total torusRadius before scaling is 2.5.  The diameter is the 1/2 radius of
		// sperical cones base, hence 0.5 before scaling.
		var torusRadius = 2.5 * scale;
		var torusDiameter = 0.5 * scale;
		var radialSegments = 20;
		var tubularSegments = 100;

		var properties1 = { color: 'green', 
				   shading: THREE.SmoothShading,
				   side: THREE.DoubleSide,
				   wireframe: false,
				   opacity: opacity,
				   transparent: true };

		var properties2 = { color: 'lightgreen', 
				   shading: THREE.SmoothShading,
				   side: THREE.DoubleSide,
				   wireframe: false,
				   opacity: opacity,
				   transparent: true };

		var fShells = new THREE.Object3D();

		var material1 = new THREE.MeshLambertMaterial( properties1 );
		var material2 = new THREE.MeshLambertMaterial( properties2 );
		
		shellMaterials.push( material1 );
		shellMaterials.push( material2 );

		if ( ( fZ3 === undefined ) || ( fZ3 === true ) ) {

			var sc1 = createSphericalCone( resolution, focalPoint );
			sc1.scale( scale, scale, scale );
			sc1.translate( 0, scale * focalPoint, 0 );
			var m1 = new THREE.Mesh( sc1, material1 );
			fShells.add( m1 );

			var sc2 = createSphericalCone( resolution, focalPoint );
			sc2.scale( scale, scale, scale );
			sc2.rotateZ( PI );
			sc2.translate( 0, -scale * focalPoint, 0 );
			var m2 = new THREE.Mesh( sc2, material2 );
			fShells.add( m2 );

			var torus1 = new THREE.TorusGeometry( torusRadius, torusDiameter, 20, 100 );
			torus1.rotateX( HALF_PI );
			torus1.translate( 0, 1 * scale, 0 );
			var tm1 = new THREE.Mesh( torus1, material2 );
			fShells.add( tm1 ); 

			var torus2 = new THREE.TorusGeometry( torusRadius, torusDiameter, 20, 100 );
			torus2.rotateX( HALF_PI );
			torus2.translate( 0, -1 * scale, 0 );
			var tm2 = new THREE.Mesh( torus2, material1 );
			fShells.add( tm2 ); 

			fShellGeometries.push( sc1 );
			fShellGeometries.push( sc2 );
			fShellGeometries.push( torus1 );
			fShellGeometries.push( torus2 );
		}

		if ( ( fXZ2 !== undefined ) && ( fXZ2 === true ) ) {

			// These spherical cones are rotated about the y-axis

			var sc3 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc3.scale( scale, scale, scale );
			sc3.rotateZ( -HALF_PI );
			sc3.rotateY( QUARTER_PI );
			sc3.translate( scale * focalPoint * Math.cos( QUARTER_PI ), 0, scale * focalPoint * Math.sin( -QUARTER_PI ) );
			var m3 = new THREE.Mesh( sc3, material1 );
			fShells.add( m3 );

			var sc4 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc4.scale( scale, scale, scale );
			sc4.rotateZ( -HALF_PI );
			sc4.rotateY( -THREE_QUARTER_PI );
			sc4.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), 0, scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			var m4 = new THREE.Mesh( sc4, material2 );
			fShells.add( m4 );

			var sc5 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc5.scale( scale, scale, scale );
			sc5.rotateZ( -HALF_PI );
			sc5.rotateY( -HALF_PI );
			sc5.translate( scale * focalPoint * Math.cos( -HALF_PI ), 0, scale * focalPoint * Math.sin( HALF_PI ) );
			var m5 = new THREE.Mesh( sc5, material1 );
			fShells.add( m5 );

			var sc6 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc6.scale( scale, scale, scale );
			sc6.rotateZ( -HALF_PI );
			sc6.rotateY( HALF_PI );
			sc6.translate( scale * focalPoint * Math.cos( -HALF_PI ), 0, scale * focalPoint * Math.sin( -HALF_PI ) );
			var m6 = new THREE.Mesh( sc6, material2 );
			fShells.add( m6 );

			var sc7 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc7.scale( scale, scale, scale );
			sc7.rotateZ( -HALF_PI );
			sc7.rotateY( THREE_QUARTER_PI );
			sc7.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), 0, scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			var m7 = new THREE.Mesh( sc7, material1 );
			fShells.add( m7 );

			var sc8 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc8.scale( scale, scale, scale );
			sc8.rotateZ( -HALF_PI );
			sc8.rotateY( -QUARTER_PI );
			sc8.translate( scale * focalPoint * Math.cos( -QUARTER_PI ), 0, scale * focalPoint * Math.sin( QUARTER_PI ) );
			var m8 = new THREE.Mesh( sc8, material2 );
			fShells.add( m8 );

			fShellGeometries.push( sc3 );
			fShellGeometries.push( sc4 );
			fShellGeometries.push( sc5 );
			fShellGeometries.push( sc6 );
			fShellGeometries.push( sc7 );
			fShellGeometries.push( sc8 );
		}

		if ( ( fYZ2 !== undefined ) && ( fYZ2 === true ) ) {

			// These spherical cones are rotated about the x-axis

			var sc9 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc9.scale( scale, scale, scale );
			sc9.rotateX( QUARTER_PI );
			sc9.translate( 0, scale * focalPoint * Math.cos( -QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ) );
			var m9 = new THREE.Mesh( sc9, material1 );
			fShells.add( m9 );

			var sc10 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc10.scale( scale, scale, scale );
			sc10.rotateX( -THREE_QUARTER_PI );
			sc10.translate( 0, scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			var m10 = new THREE.Mesh( sc10, material2 );
			fShells.add( m10 );

			var sc11 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc11.scale( scale, scale, scale );
			sc11.rotateX( -HALF_PI );
			sc11.translate( 0, scale * focalPoint * Math.cos( HALF_PI ), scale * focalPoint * Math.sin( -HALF_PI ) );
			var m11 = new THREE.Mesh( sc11, material1 );
			fShells.add( m11 );

			var sc12 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc12.scale( scale, scale, scale );
			sc12.rotateX( HALF_PI );
			sc12.translate( 0, scale * focalPoint * Math.cos( HALF_PI ), scale * focalPoint * Math.sin( HALF_PI ) );
			var m12 = new THREE.Mesh( sc12, material2 );
			fShells.add( m12 );

			var sc13 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc13.scale( scale, scale, scale );
			sc13.rotateX( THREE_QUARTER_PI );
			sc13.translate( 0, scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			var m13 = new THREE.Mesh( sc13, material1 );
			fShells.add( m13 );

			var sc14 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc14.scale( scale, scale, scale );
			sc14.rotateX( -QUARTER_PI );
			sc14.translate( 0, scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ) );
			var m14 = new THREE.Mesh( sc14, material2 );
			fShells.add( m14 );

			fShellGeometries.push( sc9 );
			fShellGeometries.push( sc10 );
			fShellGeometries.push( sc11 );
			fShellGeometries.push( sc12 );
			fShellGeometries.push( sc13 );
			fShellGeometries.push( sc14 );
		}

		if ( ( fXX23Y2 !== undefined ) && ( fXX23Y2 === true ) ) {

			// These spherical cones are rotated about the z-axis

			var sc15 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc15.scale( scale, scale, scale );
			sc15.rotateZ( -HALF_PI );
			sc15.translate( scale * focalPoint * Math.cos( ZERO_PI ), scale * focalPoint * Math.sin( ZERO_PI ), 0 );
			var m15 = new THREE.Mesh( sc15, material1 );
			fShells.add( m15 );

			var sc16 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc16.scale( scale, scale, scale );
			sc16.rotateZ( HALF_PI );
			sc16.translate( scale * focalPoint * Math.cos( PI ), scale * focalPoint * Math.sin( PI ), 0 );
			var m16 = new THREE.Mesh( sc16, material2 );
			fShells.add( m16 );

			var sc17 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc17.scale( scale, scale, scale );
			sc17.rotateZ( THREE_QUARTER_PI );
			sc17.translate( scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( -THREE_QUARTER_PI ), 0 );
			var m17 = new THREE.Mesh( sc17, material1 );
			fShells.add( m17 );

			var sc18 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc18.scale( scale, scale, scale );
			sc18.rotateZ( -QUARTER_PI );
			sc18.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m18 = new THREE.Mesh( sc18, material2 );
			fShells.add( m18 );

			var sc19 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc19.scale( scale, scale, scale );
			sc19.rotateZ( QUARTER_PI );
			sc19.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m19 = new THREE.Mesh( sc19, material1 );
			fShells.add( m19 );

			var sc20 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc20.scale( scale, scale, scale );
			sc20.rotateZ( -THREE_QUARTER_PI );
			sc20.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ), 0 );
			var m20 = new THREE.Mesh( sc20, material2 );
			fShells.add( m20 );

			fShellGeometries.push( sc15 );
			fShellGeometries.push( sc16 );
			fShellGeometries.push( sc17 );
			fShellGeometries.push( sc18 );
			fShellGeometries.push( sc19 );
			fShellGeometries.push( sc20 );
		}

		if ( ( fYY23X2 !== undefined ) && ( fYY23X2 === true ) ) {


			var sc21 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc21.scale( scale, scale, scale );
			sc21.rotateZ( -QUARTER_PI );
			sc21.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m21 = new THREE.Mesh( sc21, material1 );
			fShells.add( m21 );

			var sc22 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc22.scale( scale, scale, scale );
			sc22.rotateZ( THREE_QUARTER_PI );
			sc22.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m22 = new THREE.Mesh( sc22, material2 );
			fShells.add( m22 );

			var sc23 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc23.scale( scale, scale, scale );
			sc23.rotateZ( PI );
			sc23.translate( scale * focalPoint * Math.cos( HALF_PI ), scale * focalPoint * Math.sin( -HALF_PI ), 0 );
			var m23 = new THREE.Mesh( sc23, material1 );
			fShells.add( m23 );

			var sc24 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc24.scale( scale, scale, scale );
			// No rotation necessary
			sc24.translate( scale * focalPoint * Math.cos( HALF_PI ), scale * focalPoint * Math.sin( HALF_PI ), 0 );
			var m24 = new THREE.Mesh( sc24, material2 );
			fShells.add( m24 );

			var sc25 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc25.scale( scale, scale, scale );
			sc25.rotateZ( QUARTER_PI );
			sc25.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m25 = new THREE.Mesh( sc25, material1 );
			fShells.add( m25 );

			var sc26 = createSphericalCone( resolution, focalPoint, 0.375, 1, 0.75 );
			sc26.scale( scale, scale, scale );
			sc26.rotateZ( -THREE_QUARTER_PI );
			sc26.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ), 0 );
			var m26 = new THREE.Mesh( sc26, material2 );
			fShells.add( m26 );

			fShellGeometries.push( sc21 );
			fShellGeometries.push( sc22 );
			fShellGeometries.push( sc23 );
			fShellGeometries.push( sc24 );
			fShellGeometries.push( sc25 );
			fShellGeometries.push( sc26 );
		}

		if ( ( fXYZ !== undefined ) && ( fXYZ === true ) ) {

			var sc27= createSphericalCone( resolution, focalPoint );
			sc27.scale( scale, scale, scale );
			sc27.rotateX( -QUARTER_PI );
			sc27.translate( 0, scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ) );
			sc27.rotateY( -QUARTER_PI );
			var m27 = new THREE.Mesh( sc27, material1 );
			fShells.add( m27 );

			var sc28 = createSphericalCone( resolution, focalPoint );
			sc28.scale( scale, scale, scale );
			sc28.rotateX( THREE_QUARTER_PI );
			sc28.translate( 0, scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			sc28.rotateY( -QUARTER_PI );
			var m28 = new THREE.Mesh( sc28, material2 );
			fShells.add( m28 );

			var sc29 = createSphericalCone( resolution, focalPoint );
			sc29.scale( scale, scale, scale );
			sc29.rotateX( QUARTER_PI );
			sc29.translate( 0, scale * focalPoint * Math.cos( -QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ) );
			sc29.rotateY( -QUARTER_PI );
			var m29 = new THREE.Mesh( sc29, material1 );
			fShells.add( m29 );

			var sc30 = createSphericalCone( resolution, focalPoint );
			sc30.scale( scale, scale, scale );
			sc30.rotateX( -THREE_QUARTER_PI );
			sc30.translate( 0, scale * focalPoint * Math.cos( THREE_QUARTER_PI ), scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			sc30.rotateY( -QUARTER_PI );
			var m30 = new THREE.Mesh( sc30, material2 );
			fShells.add( m30 );

			var sc31 = createSphericalCone( resolution, focalPoint );
			sc31.scale( scale, scale, scale );
			sc31.rotateZ( -QUARTER_PI );
			sc31.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			sc31.rotateY( -QUARTER_PI );
			var m31 = new THREE.Mesh( sc31, material2 );
			fShells.add( m31 );

			var sc32 = createSphericalCone( resolution, focalPoint );
			sc32.scale( scale, scale, scale );
			sc32.rotateZ( QUARTER_PI );
			sc32.translate( -scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			sc32.rotateY( -QUARTER_PI );
			var m32 = new THREE.Mesh( sc32, material2 );
			fShells.add( m32 );

			var sc33 = createSphericalCone( resolution, focalPoint );
			sc33.scale( scale, scale, scale );
			sc33.rotateZ( THREE_QUARTER_PI );
			sc33.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			sc33.rotateY( -QUARTER_PI );
			var m33 = new THREE.Mesh( sc33, material1 );
			fShells.add( m33 );

			var sc34 = createSphericalCone( resolution, focalPoint );
			sc34.scale( scale, scale, scale );
			sc34.rotateZ( -THREE_QUARTER_PI );
			sc34.translate( -scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			sc34.rotateY( -QUARTER_PI );
			var m34 = new THREE.Mesh( sc34, material1 );
			fShells.add( m34 );

			fShellGeometries.push( sc27 );
			fShellGeometries.push( sc28 );
			fShellGeometries.push( sc29 );
			fShellGeometries.push( sc30 );
			fShellGeometries.push( sc31 );
			fShellGeometries.push( sc32 );
			fShellGeometries.push( sc33 );
			fShellGeometries.push( sc34 );
		}

		if ( ( fZX23Y2 !== undefined ) && ( fZX23Y2 === true ) ) {

			var sc35= createSphericalCone( resolution, focalPoint );
			sc35.scale( scale, scale, scale );
			sc35.rotateX( -QUARTER_PI );
			sc35.translate( 0, scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( -QUARTER_PI ) );
			var m35 = new THREE.Mesh( sc35, material1 );
			fShells.add( m35 );

			var sc36 = createSphericalCone( resolution, focalPoint );
			sc36.scale( scale, scale, scale );
			sc36.rotateX( THREE_QUARTER_PI );
			sc36.translate( 0, scale * focalPoint * Math.cos( -THREE_QUARTER_PI ), scale * focalPoint * Math.sin( THREE_QUARTER_PI ) );
			var m36 = new THREE.Mesh( sc36, material2 );
			fShells.add( m36 );

			var sc37 = createSphericalCone( resolution, focalPoint );
			sc37.scale( scale, scale, scale );
			sc37.rotateX( QUARTER_PI );
			sc37.translate( 0, scale * focalPoint * Math.cos( -QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ) );
			var m37 = new THREE.Mesh( sc37, material1 );
			fShells.add( m37 );

			var sc38 = createSphericalCone( resolution, focalPoint );
			sc38.scale( scale, scale, scale );
			sc38.rotateX( -THREE_QUARTER_PI );
			sc38.translate( 0, scale * focalPoint * Math.cos( THREE_QUARTER_PI ), scale * focalPoint * Math.sin( -THREE_QUARTER_PI ) );
			var m38 = new THREE.Mesh( sc38, material2 );
			fShells.add( m38 );

			var sc39 = createSphericalCone( resolution, focalPoint );
			sc39.scale( scale, scale, scale );
			sc39.rotateZ( -QUARTER_PI );
			sc39.translate( scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m39 = new THREE.Mesh( sc39, material2 );
			fShells.add( m39 );

			var sc40 = createSphericalCone( resolution, focalPoint );
			sc40.scale( scale, scale, scale );
			sc40.rotateZ( QUARTER_PI );
			sc40.translate( -scale * focalPoint * Math.cos( QUARTER_PI ), scale * focalPoint * Math.sin( QUARTER_PI ), 0 );
			var m40 = new THREE.Mesh( sc40, material2 );
			fShells.add( m40 );

			var sc41 = createSphericalCone( resolution, focalPoint );
			sc41.scale( scale, scale, scale );
			sc41.rotateZ( THREE_QUARTER_PI );
			sc41.translate( scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m41 = new THREE.Mesh( sc41, material1 );
			fShells.add( m41 );

			var sc42 = createSphericalCone( resolution, focalPoint );
			sc42.scale( scale, scale, scale );
			sc42.rotateZ( -THREE_QUARTER_PI );
			sc42.translate( -scale * focalPoint * Math.cos( THREE_QUARTER_PI ), -scale * focalPoint * Math.sin( THREE_QUARTER_PI ), 0 );
			var m42 = new THREE.Mesh( sc42, material1 );
			fShells.add( m42 );

			fShellGeometries.push( sc35 );
			fShellGeometries.push( sc36 );
			fShellGeometries.push( sc37 );
			fShellGeometries.push( sc38 );
			fShellGeometries.push( sc39 );
			fShellGeometries.push( sc40 );
			fShellGeometries.push( sc41 );
			fShellGeometries.push( sc42 );
		}

		return fShells;
	};

	//*************************************************************************
	// Creates and returns the scene graph SPDF Model of the atom.
	//
	// The 3d orbitals begin to be filled out after the 4s orbital, however because of the way three.js
	// is processing the order in which to render elements (likely based on object id - for transparent elements).
	// If 3d orbitals are to be created they must be created before the 4s orbital and added to the model otherwise 
	// the surfaces get culled and not rendered unless camera position is within radius of 4s orbital.
	// This happens to all orbitals beyond 3d that begin to be filled out in latter periods.
	//*************************************************************************
	this.createSpdfModel = function() {

		var resolution = 40;
		var opacity = 1.0;
		var opacityStep = 1.0 / 7;
		var scale = 1;

		var numElectrons = atomicNumber;

		spdfModel = new THREE.Object3D();

		if ( numElectrons > 0 ) {  // period 1
			
			// Create 1s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 1 ) );

			numElectrons -= 2;

			opacity -= opacityStep;
		}

		if ( numElectrons > 0 ) {  // period 2

			// Create 2s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 2 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }

				spdfModel.add( create_P_Shells( resolution, opacity, 1, pX, pY, pZ ) );
			}

			opacity -= opacityStep;
		}

		if ( numElectrons > 0 ) {  // period 3

			// Create 3s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 4 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }

				// Create 3p orbital
				spdfModel.add( create_P_Shells( resolution, opacity, 2, pX, pY, pZ ) );
			}

			opacity -= opacityStep;
		}

		if ( numElectrons > 0 ) {  // period 4

			if ( numElectrons > 2 ) {

				var dXZ = false;
				var dYZ = false;
				var dXY = false;
				var dX2Y2 = false;
				var dZ2 = false;

				if ( numElectrons >= 11 ) { dZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { dX2Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { dXY = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { dYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 2 ) { dXZ = true; numElectrons -= 2; }

				// Create 3d orbital - adjust opacity to mach period 3 block
				spdfModel.add( create_D_Shells( resolution, opacity + opacityStep, 2.25, dXZ, dYZ, dXY, dX2Y2, dZ2 ) );
			}

			// Create 4s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 8 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }
				
				// Create 4p orbital
				spdfModel.add( create_P_Shells( resolution, opacity, 4, pX, pY, pZ ) );
			}

			// 4d & 4f orbitals are not filled to any capacity by period 4 elements, 
			// but do begin to be filled by period 5 elements thus the code for 4d 4f orbitals is
			// located in period 5 block

			opacity -= opacityStep;
		}

		if ( numElectrons > 0 ) {  // period 5

			if ( numElectrons > 2 ) {

				var dXZ = false;
				var dYZ = false;
				var dXY = false;
				var dX2Y2 = false;
				var dZ2 = false;

				if ( numElectrons >= 11 ) { dZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { dX2Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { dXY = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { dYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { dXZ = true; numElectrons -= 2; }

				// Create 4d orbital - adjust opacity to mach period 4 block
				spdfModel.add( create_D_Shells( resolution, opacity + opacityStep, 4.25, dXZ, dYZ, dXY, dX2Y2, dZ2 ) );
			}

			// Create 5s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 16 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }
				
				// Create 5p orbital
				spdfModel.add( create_P_Shells( resolution, opacity, 8, pX, pY, pZ ) );
			}

			opacity -= opacityStep;
		}
		
		if ( numElectrons > 0 ) { // period 6

			if ( numElectrons > 2 ) {

				var fZ3 = false;
				var fXZ2 = false;
				var fYZ2 = false;
				var fXX23Y2 = false;
				var fYY23X2 = false;
				var fXYZ = false;
				var fZX23Y2 = false;

				if ( numElectrons >= 15 ) { fZX23Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 13 ) { fXYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 11 ) { fYY23X2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { fXX23Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { fYZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { fXZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { fZ3 = true; numElectrons -= 2; }

				// Create 4f orbital - adjust opacity to mach period 4 block
				spdfModel.add( create_F_Shells( resolution, opacity + ( 2 * opacityStep ), 4.75, fZ3, fXZ2, fYZ2, fXX23Y2, fYY23X2, fXYZ, fZX23Y2 ) );
			}

			if ( numElectrons > 2 ) {

				var dXZ = false;
				var dYZ = false;
				var dXY = false;
				var dX2Y2 = false;
				var dZ2 = false;

				if ( numElectrons >= 11 ) { dZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { dX2Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { dXY = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { dYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { dXZ = true; numElectrons -= 2; }

				// Create 5d orbital - adjust opacity to mach period 5 block
				spdfModel.add( create_D_Shells( resolution, opacity + opacityStep, 8.25, dXZ, dYZ, dXY, dX2Y2, dZ2 ) );
			}

			// Create 6s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 32 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }
				
				// Create 6p orbital
				spdfModel.add( create_P_Shells( resolution, opacity, 16, pX, pY, pZ ) );
			}

			opacity -= opacityStep;
		}

		if ( numElectrons > 0 ) {


			if ( numElectrons > 2 ) {

				var fZ3 = false;
				var fXZ2 = false;
				var fYZ2 = false;
				var fXX23Y2 = false;
				var fYY23X2 = false;
				var fXYZ = false;
				var fZX23Y2 = false;

				if ( numElectrons >= 15 ) { fZX23Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 13 ) { fXYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 11 ) { fYY23X2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { fXX23Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { fYZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { fXZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { fZ3 = true; numElectrons -= 2; }

				// Create 5f orbital - adjust opacity to mach period 5 block
				spdfModel.add( create_F_Shells( resolution, opacity + ( 2 * opacityStep ), 8.75, fZ3, fXZ2, fYZ2, fXX23Y2, fYY23X2, fXYZ, fZX23Y2 ) );
			}

			if ( numElectrons > 2 ) {

				var dXZ = false;
				var dYZ = false;
				var dXY = false;
				var dX2Y2 = false;
				var dZ2 = false;

				if ( numElectrons >= 11 ) { dZ2 = true; numElectrons -= 2; }
				if ( numElectrons >= 9 ) { dX2Y2 = true; numElectrons -= 2; }
				if ( numElectrons >= 7 ) { dXY = true; numElectrons -= 2; }
				if ( numElectrons >= 5 ) { dYZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { dXZ = true; numElectrons -= 2; }

				// Create 6d orbital - adjust opacity to mach period 6 block
				spdfModel.add( create_D_Shells( resolution, opacity + opacityStep, 16.25, dXZ, dYZ, dXY, dX2Y2, dZ2 ) );
			}

			// Create 7s orbital
			spdfModel.add( create_S_Shell( resolution, opacity, 64 ) );

			numElectrons -= 2;

			if ( numElectrons > 0 ) {

				var pX = false;
				var pY = false;
				var pZ = false;

				if ( numElectrons >= 5 ) { pZ = true; numElectrons -= 2; }
				if ( numElectrons >= 3 ) { pY = true; numElectrons -= 2; }
				if ( numElectrons >= 1 ) { pX = true; numElectrons -= 2; }
				
				// Create 7p orbital
				spdfModel.add( create_P_Shells( resolution, opacity, 32, pX, pY, pZ ) );
			}

			opacity -= opacityStep;
		}
		
		return spdfModel;	
	}
};