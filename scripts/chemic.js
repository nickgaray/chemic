/******************************************************************************

Author - Nick Garay - https://github.com/nickgaray

All reference material copyright of the respective owners. 

******************************************************************************/


//*****************************************************************************
// Chemic - Application - Driver
//*****************************************************************************
var Chemic = function() {

	//*****************************************************************************
	// Constants
	//*****************************************************************************
	//const FONT_URL = 'http://neuralstorm.neocities.org/fonts/helvetiker_regular.typeface.js';
	//const FONT_URL = 'http://ninth-mind.github.io/threejs-text-example/mk3_regular.js';
	const FONT_URL = '../fonts/helvetiker_regular.typeface.js';

	//*****************************************************************************
	// Class Variables - Private hence no 'this.' in front of them
	//*****************************************************************************
	var tableScene;
	var bohrModelScene;
	var spdfScene;

	var tableCamera;
	var bohrModelCamera;
	var spdfCamera;

	var fov = 75;

	var renderer;
	var orbitControls;

	var fontLoader = new THREE.FontLoader();

	var periodicTable = new PeriodicTable();

	var atom;
	var bohrModel;
	var spdfModel;
	
	var sphericalHarmonic;

	//*****************************************************************************
	// Initializes scenes, cameras, renderer, and camera controls
	//*****************************************************************************
	function initialize() {

		// Setup scenes
		tableScene = new THREE.Scene();
		tableScene.background = new THREE.Color( 'black' );

		bohrModelScene = new THREE.Scene();
		bohrModelScene.background = new THREE.Color( 'skyblue' );

		spdfScene = new THREE.Scene();
		spdfScene.background = new THREE.Color( 'black' );
	
		// Setup cameras
		tableCamera = new THREE.OrthographicCamera( -10, 10, 4.5, -5.5, 0.005, 5);
		tableCamera.position.set( 0, 0, 0.25 );
		tableCamera.up.set( 0, 1, 0 );
		tableCamera.lookAt( new THREE.Vector3( 0, 0, -1 ) );

		bohrModelCamera = new THREE.OrthographicCamera( -8, 8, 5.5, -5.5, 0.005, 5);
		bohrModelCamera.position.set( 0, 0, 0.25 );
		bohrModelCamera.up.set( 0, 1, 0 );
		bohrModelCamera.lookAt( new THREE.Vector3( 0, 0, -1 ) );

		spdfCamera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 0.1, 1000 );
		spdfCamera.position.set( 0, 0, 150 );
		spdfCamera.up.set( 0, 1, 0 );
		spdfCamera.lookAt( new THREE.Vector3( 0, 0, -1 ) );
		spdfCamera.updateProjectionMatrix();

		// Setup the renderer
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( window.innerWidth, window.innerHeight );
	
		// Add renderer to DOM
		document.body.appendChild( renderer.domElement );

		// Attach Orbit Controls to the spdfCamera
		orbitControls = new THREE.OrbitControls( spdfCamera, renderer.domElement );
	}

	//*****************************************************************************
	// Composes the scene
	//*****************************************************************************
	function drawScene() {

		tableScene.add( periodicTable.createTable() );		
	}
	
	//*****************************************************************************
	// Sets up lighting for the scene
	//*****************************************************************************
	function applyLighting() {

		var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 1 );
		ambientLight.position.set( 0, 0, 0 );
		spdfScene.add( ambientLight );

		var light1 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light1.position.set( 10, 0, 0 );
		spdfScene.add( light1 );

		var light2 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light2.position.set( -10, 0, 0 );
		spdfScene.add( light2 );

		var light3 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light3.position.set( 0, 10, 0 );
		spdfScene.add( light3 );

		var light4 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light4.position.set( 0, -10, 0 );
		spdfScene.add( light4 );
		
		var light5 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light5.position.set( 0, 0, 10 );
		spdfScene.add( light5 );

		var light6 = new THREE.SpotLight( 0xFFFFFF, 1, 0, 2 );
		light6.position.set( 0, 0, -10 );
		spdfScene.add( light6 );
	}

	//*****************************************************************************
	// Renders the scene and updates the camera
	//*****************************************************************************
	function render() {

		// Render the tableScene in upper half of window
		renderer.setViewport( 0, window.innerHeight / 2, window.innerWidth /2, window.innerHeight / 2 );
		renderer.setScissor( 0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2 );
		renderer.setScissorTest ( true );

		renderer.render( tableScene, tableCamera );
		
		// Lower half of window split into two views: classical Bohr Model & spherical harmonics view

		// Render the bohrModelScene
		renderer.setViewport( 0, 0, window.innerWidth / 2, window.innerHeight / 2 );
		renderer.setScissor( 0, 0, window.innerWidth / 2, window.innerHeight / 2 );
		renderer.setScissorTest ( true );

		renderer.render( bohrModelScene, bohrModelCamera );

		// Render the atomicStructureScene
		renderer.setViewport( window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight );
		renderer.setScissor( window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight );
		renderer.setScissorTest ( true );

		spdfCamera.aspect = window.innerWidth / 2 * 2 / window.innerHeight;
		spdfCamera.updateProjectionMatrix();

		renderer.render( spdfScene, spdfCamera);
		
		// Update the camera
		orbitControls.update();
	}

	//*****************************************************************************
	// Animate function - loop
	//*****************************************************************************
	function animate() {

		window.requestAnimationFrame( animate );

		render();
	}

	//*****************************************************************************
	// Starts the chemic application
	//*****************************************************************************
	function start() {

		try {

			initialize();
			drawScene();
			applyLighting();
			render();
			animate();

		} catch( e ) {

			alert( e.message );
		}
	}

	//*****************************************************************************
	// Callback function to deal with font loading progress
	//*****************************************************************************
	var onFontLoadProgress = function( data ) {

		console.log( ( data.loaded / data.total * 100 ) + '% loaded' );
	};

	//*****************************************************************************
	// Callback function to deal with font loading errors
	//*****************************************************************************
	var onFontLoadError = function( data ) {

		console.log( 'Error loading font!' );

		alert( 'Error loading font!' );
	};

	//*****************************************************************************
	// Callback function to deal with font loading completion
	//*****************************************************************************
	var onFontLoaded = function( font ) {

		periodicTable.setFont( font );

		start();	
	};

	//*****************************************************************************
	// Callback function to deal with mouse button presses
	//*****************************************************************************
	this.onDocumentMouseDown = function( event ) {

		// If we are within bounds of the table scene
		if ( ( event.clientY < window.innerHeight / 2 ) && ( event.clientX < window.innerWidth / 2 ) ) {
		
			// X position of mouse is simply normalized to [-1 , 1]
			var mouseX = ( event.clientX / ( window.innerWidth / 2 ) ) * 2 - 1;

			// Y position of mouse has to take into account viewport position
			var mouseY = ( -( event.clientY / ( window.innerHeight / 2 ) ) * 2 + 1 );

			var mouseVec = new THREE.Vector2( mouseX, mouseY );
		
			var properties = periodicTable.getSelectedElementProperties( mouseVec, tableCamera );		

			if ( atom ) {

				bohrModelScene.remove( bohrModel );

				spdfScene.remove( spdfModel );

				atom.cleanup();

				delete atom;

				atom = null;
			}

			if ( properties ) {
				
				atom = new Atom( properties[ 0 ], properties[ 1 ], properties[ 2 ], properties[ 3 ], properties[ 5 ] );

				bohrModel = atom.createBohrModel();

				spdfModel = atom.createSpdfModel();

				bohrModelScene.add( bohrModel );
				
				spdfScene.add( spdfModel );
				
				// Compute bounding box of spdf model
				var size = new THREE.Box3().setFromObject( spdfModel );
	
				// Update camera position so that the entire model is visible within the field of view (fov)
				spdfCamera.position.set( 0, 0, ( ( size.max.x / 2 ) / Math.tan( fov / 2 ) ) );
			}
		}
	};

	//*****************************************************************************
	// Invoked at construction of Chemic 'object' hence it is the last statement
	// in the definition of Chemic as it will kick off the process
	//*****************************************************************************
	fontLoader.load( FONT_URL, onFontLoaded, onFontLoadProgress, onFontLoaded );
};

var chemic = new Chemic();

// Register event handlers...
document.addEventListener( 'mousedown', chemic.onDocumentMouseDown, false );
