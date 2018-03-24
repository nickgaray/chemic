/******************************************************************************

Author - Nick Garay - https://github.com/nickgaray

All reference material copyright of the respective owners. 

******************************************************************************/


//*****************************************************************************
// Periodic Table
//*****************************************************************************
var PeriodicTable = function() {

	//*************************************************************************
	// Constants
	//*************************************************************************
	const ATOMIC_NBR 	= 0;
	const ATOMIC_MASS 	= 1;
	const ATOMIC_NAME 	= 2;
	const ATOMIC_SYMBOL	= 3;
	const GROUP_NBR		= 4;
	const PERIOD_NBR	= 5;
	
	const ACTINIDE_SERIES   = 8;
	const LANTHANIDE_SERIES = 9;
	const ACTINIDE_GROUP_NBR = 101;
	const LANTHANIDE_GROUP_NBR = 102;

	const OFFSET = 1.05;
	const SELECTION_OFFSET_Z = 1.20;
	
	const FONT_COLOR = 'black';
	const FONT_HEIGHT = 0.01;
	const ATOMIC_SYMBOL_FONT_SIZE = 0.30;
	const ATOMIC_NBR_FONT_SIZE = 0.15;
	const ATOMIC_MASS_FONT_SIZE = 0.125;

	const ACTINIDES_LANTHANIDES_OFFSET_X = 3 * OFFSET;
	
	const PERIODIC_TABLE = [
		[ 1,1.0079,'Hydrogen','H',1,1 ],		[ 2,4.0026,'Helium','He',18,1 ],		[ 3,6.941,'Lithium','Li',1,2 ],				[ 4,9.0122,'Beryllium','Be',2,2 ], 
		[ 5,10.811,'Boron','B',13,2 ],			[ 6,12.0107,'Carbon','C',14,2 ], 		[ 7,14.0067,'Nitrogen','N',15,2 ], 			[ 8,15.9994,'Oxygen','O',16,2 ], 
		[ 9,18.9984,'Fluorine','F',17,2 ], 		[ 10,20.1797,'Neon','Ne',18,2 ],		[ 11,22.9897,'Sodium','Na',1,3 ], 			[ 12,24.305,'Magnesium','Mg',2,3 ], 
		[ 13,26.9815,'Aluminum','Al',13,3 ],	[ 14,28.0855,'Silicon','Si',14,3 ], 	[ 15,30.9738,'Phosphorus','P',15,3 ], 		[ 16,32.065,'Sulfur','S',16,3 ], 
		[ 17,35.453,'Chlorine','Cl',17,3 ], 	[ 18,39.948,'Argon','Ar',18,3 ], 		[ 19,39.0983,'Potassium','K',1,4 ], 		[ 20,40.078,'Calcium','Ca',2,4 ], 
		[ 21,44.9559,'Scandium','Sc',3,4 ],		[ 22,47.867,'Titanium','Ti',4,4 ],	 	[ 23,50.9415,'Vanadium','V',5,4 ], 			[ 24,51.9961,'Chromium','Cr',6,4 ], 
		[ 25,54.938,'Manganese','Mn',7,4 ],		[ 26,55.845,'Iron','Fe',8,4 ], 			[ 27,58.9332,'Cobalt','Co',9,4 ], 			[ 28,58.6934,'Nickel','Ni',10,4 ], 
		[ 29,63.546,'Copper','Cu',11,4 ], 		[ 30,65.39,'Zinc','Zn',12,4 ], 			[ 31,69.723,'Gallium','Ga',13,4 ], 			[ 32,72.64,'Germanium','Ge',14,4 ],
		[ 33,74.9216,'Arsenic','As',15,4 ],	 	[ 34,78.96,'Selenium','Se',16,4 ],	 	[ 35,79.904,'Bromine','Br',17,4 ], 			[ 36,83.8,'Krypton','Kr',18,4 ], 
		[ 37,85.4678,'Rubidium','Rb',1,5 ],		[ 38,87.62,'Strontium','Sr',2,5 ],	 	[ 39,88.9059,'Yttrium','Y',3,5 ], 			[ 40,91.224,'Zirconium','Zr',4,5 ], 
		[ 41,92.9064,'Niobium','Nb',5,5 ], 		[ 42,95.94,'Molybdenum','Mo',6,5 ], 	[ 43,98,'Technetium','Tc',7,5 ], 			[ 44,101.07,'Ruthenium','Ru',8,5 ], 
		[ 45,102.9055,'Rhodium','Rh',9,5 ],		[ 46,106.42,'Palladium','Pd',10,5 ], 	[ 47,107.8682,'Silver','Ag',11,5 ], 		[ 48,112.411,'Cadmium','Cd',12,5 ], 
		[ 49,114.818,'Indium','In',13,5 ], 		[ 50,118.71,'Tin','Sn',14,5 ], 			[ 51,121.76,'Antimony','Sb',15,5 ], 		[ 52,127.6,'Tellurium','Te',16,5 ], 
		[ 53,126.9045,'Iodine','I',17,5 ], 		[ 54,131.293,'Xenon','Xe',18,5 ], 		[ 55,132.9055,'Cesium','Cs',1,6 ], 			[ 56,137.327,'Barium','Ba',2,6 ], 
		[ 57,138.9055,'Lanthanum','La',101, 6 ], 	[ 58,140.116,'Cerium','Ce',101,6 ], 	[ 59,140.9077,'Praseodymium','Pr',101,6 ],	[ 60,144.24,'Neodymium','Nd',101,6 ],
		[ 61,145,'Promethium','Pm',101,6 ], 	[ 62,150.36,'Samarium','Sm',101,6 ], 	[ 63,151.964,'Europium','Eu',101,6 ], 		[ 64,157.25,'Gadolinium','Gd',101,6 ], 
		[ 65,158.9253,'Terbium','Tb',101,6 ],	[ 66,162.5,'Dysprosium','Dy',101,6 ], 	[ 67,164.9303,'Holmium','Ho',101,6 ], 		[ 68,167.259,'Erbium','Er',101,6 ], 
		[ 69,168.9342,'Thulium','Tm',101,6 ], 	[ 70,173.04,'Ytterbium','Yb',101,6 ],	[ 71,174.967,'Lutetium','Lu',101,6 ], 		[ 72,178.49,'Hafnium','Hf',4,6 ], 
		[ 73,180.9479,'Tantalum','Ta',5,6 ], 	[ 74,183.84,'Tungsten','W',6,6 ], 		[ 75,186.207,'Rhenium','Re',7,6 ],			[ 76,190.23,'Osmium','Os',8,6 ], 
		[ 77,192.217,'Iridium','Ir',9,6 ], 		[ 78,195.078,'Platinum','Pt',10,6 ], 	[ 79,196.9665,'Gold','Au',11,6 ], 			[ 80,200.59,'Mercury','Hg',12,6 ],
		[ 81,204.3833,'Thallium','Tl',13,6 ], 	[ 82,207.2,'Lead','Pb',14,6 ], 			[ 83,208.9804,'Bismuth','Bi',15,6 ], 		[ 84,209,'Polonium','Po',16,6 ], 
		[ 85,210,'Astatine','At',17,6 ],		[ 86,222,'Radon','Rn',18,6 ],			[ 87,223,'Francium','Fr',1,7 ], 			[ 88,226,'Radium','Ra',2,7 ], 
		[ 89,227,'Actinium','Ac',102, 7 ], 		[ 90,232.0381,'Thorium','Th',102,7 ],	[ 91,231.0359,'Protactinium','Pa',102,7 ],	[ 92,238.0289,'Uranium','U',102,7 ], 
		[ 93,237,'Neptunium','Np',102,7 ], 		[ 94,244,'Plutonium','Pu',102,7 ],	 	[ 95,243,'Americium','Am',102,7 ],			[ 96,247,'Curium','Cm',102,7 ], 
		[ 97,247,'Berkelium','Bk',102,7 ], 		[ 98,251,'Californium','Cf',102,7 ], 	[ 99,252,'Einsteinium','Es',102,7 ], 		[ 100,257,'Fermium','Fm',102,7 ],
		[ 101,258,'Mendelevium','Md',102,7 ], 	[ 102,259,'Nobelium','No',102,7 ],	 	[ 103,262,'Lawrencium','Lr',102,7 ], 		[ 104,261,'Rutherfordium','Rf',4,7 ], 
		[ 105,262,'Dubnium','Db',5,7 ],			[ 106,266,'Seaborgium','Sg',6,7 ],	 	[ 107,264,'Bohrium','Bh',7,7 ], 			[ 108,277,'Hassium','Hs',8,7 ], 
		[ 109,268,'Meitnerium','Mt',9,7 ], 		[ 110,281,'Darmstadtium','Ds',10,7 ],	[ 111,281,'Roentgenium','Rg',11,7 ], 		[ 112,285,'Copernicium','Cn',12,7 ], 
		[ 113,286,'Nihonium','Nh',13,7 ], 		[ 114,289,'Flerovium','Fl',14,7 ],	 	[ 115,289,'Moscovium','Mc',15,7 ], 			[ 116,293,'Livermorium','Lv',16,7 ], 
		[ 117,294,'Tennessine','Ts',17,7 ], 	[ 118,294,'Oganesson','Og',18,7 ] ];


	//****************************************************************************
	// Class Variables - Private hence no 'this.' in front of them
	//****************************************************************************
	// The scene graph of the periodic table
	var tableSceneGraph = new THREE.Object3D();

	// Holds the list of Object3D elements for selection mapping and lookup
	var elements = []; 
	
	// Holds the list of Object3D elements for selection mapping and lookup
	var theFont;
	
	// Holds the selected element
	var selectedElement;

	//****************************************************************************
	// Maps the atomic symbol to a color for rendering the periodic table
	//****************************************************************************
	var getColorFromAtomicSymbol = function( symbol ) {
	
			// Default Color - Indicates Error
			var color = 0x8F8F00;
			
			switch ( symbol ) {
				case 'Li': case 'Na': case 'K': case 'Rb': case 'Cs': case 'Fr':  
					color = 0xFF99FF;
					break;
					
				case 'Be': case 'Mg': case 'Ca': case 'Sr':	case 'Ba': case 'Ra':
					color = 0xCC33FF;
					break;
				
				case 'H':
					color = 0x00FFFF;
					break;
				
				case 'Sc': case 'Y':
					color = 0x00EFFF;
					break;
				
				case 'Ti': case 'Zr': case 'Hf': case 'Rf': case 'V': case 'Nb':  
				case 'Ta': case 'Db': case 'Cr': case 'Mo': case 'W': case 'Sg':  
				case 'Mn': case 'Tc': case 'Re': case 'Bh': case 'Fe': case 'Ru':  
				case 'Os': case 'Hs': case 'Co': case 'Rh': case 'Ir': case 'Mt':  
				case 'Ni': case 'Pd': case 'Pt': case 'Ds': case 'Cu': case 'Ag':
				case 'Au': case 'Rg': case 'Zn': case 'Cd': case 'Hg': case 'Cn':  
					color = 0x00FFFF;
					break;
				
				case 'B': case 'Si': case 'Ge': case 'As': case 'Sb': case 'Te':  
				case 'Po': 
					color = 0x00FF00;
					break;
					
				case 'La': case 'Ce': case 'Pr': case 'Nd': case 'Pm': case 'Sm':  
				case 'Eu': case 'Gd': case 'Tb': case 'Dy': case 'Ho': case 'Er': 
				case 'Tm': case 'Yb': case 'Lu':
					color = 0xFFFF00;
					break;
					
				
				case 'Ac': case 'Th': case 'Pa': case 'U': case 'Np': case 'Pu':  
				case 'Am': case 'Cm': case 'Bk': case 'Cf': case 'Es': case 'Fm':  
				case 'Md': case 'No': case 'Lr':  
					color = 0xFF3300;
					break;
				
				case 'Al': case 'Ga': case 'In': case 'Tl': case 'Nh': case 'Fl':  
				case 'Mc': case 'Lv': case 'Sn': case 'Pb': case 'Bi': 
					color = 0xFF9900;
					break;
				
				case 'C': case 'N': case 'P': case 'O': case 'S': case 'Se':  
					color = 0x0066FF;
					break;
				
				case 'F': case 'Cl': case 'Br': case 'I': case 'At': case 'Ts':  
					color = 0xFFCC66;
					break;
				
				case 'He': case 'Ne': case 'Ar': case 'Kr': case 'Xe': case 'Rn':  
				case 'Og':  
					color = 0xFFCC00;
					break;
										
				default:
					console.log( 'Invalid color mapping' );
					break;
			}
			
			return color;
	};
	
	//****************************************************************************
	// Creates atomic symbol text mesh
	//****************************************************************************
	var createSymbolText = function( symText ) {
		
		var material = new THREE.MeshBasicMaterial( { color: FONT_COLOR } );
		
		var properties = { font: theFont, size: ATOMIC_SYMBOL_FONT_SIZE, height: FONT_HEIGHT };

		var textGeom = new THREE.TextGeometry( symText, properties );
		
		var textMesh = new THREE.Mesh( textGeom, material );

		// Compute the bounding box to center the text in a 1x1 square
		textGeom.computeBoundingBox();
		textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
		textGeom.textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
		
		textGeom.translate( -textGeom.textWidth / 2, -textGeom.textHeight / 2, 0 );
		
		return textMesh;		
	};
	
	//****************************************************************************
	// Creates atomic number text mesh
	//****************************************************************************
	var createAtomicNbrText = function( nbr ) {

		var material = new THREE.MeshBasicMaterial( { color: FONT_COLOR } );
		
		var properties = { font: theFont, size: ATOMIC_NBR_FONT_SIZE, height: FONT_HEIGHT };

		var textGeom = new THREE.TextGeometry( nbr, properties );
		
		var textMesh = new THREE.Mesh( textGeom, material );

		// Compute the bounding box to center the text in a 1x1 square
		textGeom.computeBoundingBox();
		textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
		textGeom.textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
		
		textGeom.translate( -0.5 * 0.95 , textGeom.textHeight + ( textGeom.textHeight / 2 ), 0 );
		
		return textMesh;
	};
	
	//****************************************************************************
	// Creates atomic mass text mesh
	//****************************************************************************
	var createAtomicMassText = function( nbr ) {

		var material = new THREE.MeshBasicMaterial( { color: FONT_COLOR } );
		
		var properties = { font: theFont, size: ATOMIC_MASS_FONT_SIZE, height: FONT_HEIGHT };

		var textGeom = new THREE.TextGeometry( nbr, properties );
		
		var textMesh = new THREE.Mesh( textGeom, material );

		// Compute the bounding box to center the text in a 1x1 square
		textGeom.computeBoundingBox();
		textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
		textGeom.textHeight = textGeom.boundingBox.max.y - textGeom.boundingBox.min.y;
		
		textGeom.translate( -textGeom.textWidth / 2, -0.5 + ( textGeom.textHeight / 2 ), 0 );
		
		return textMesh;
	};

	//****************************************************************************
	// Generates the periodic table as a scene graph
	//****************************************************************************
	this.createTable = function() {

		// Simple geometry for a table cell
		var geometry = new THREE.PlaneGeometry( 1, 1 );

		// Initial offsets of specially treated elements
		var actinidesOffsetX = ACTINIDES_LANTHANIDES_OFFSET_X;
		var lanthanidesOffsetX = ACTINIDES_LANTHANIDES_OFFSET_X;

		// Width and height boundaries of table
		var width = 0;
		var height = 0;

		// Group elements into their respective categories
		for ( var idx = 0; idx < PERIODIC_TABLE.length; ++idx ) {

			// Create the object3D representation of the element
			var curElement = new THREE.Object3D();
			
			// Get the color from its atomic symbol
			var color = getColorFromAtomicSymbol( PERIODIC_TABLE[ idx ][ ATOMIC_SYMBOL ] );

			// Simple material for the table cell
			var material = new THREE.MeshBasicMaterial( { color: color } );

			// The element
			var element = new THREE.Mesh( geometry, material );

			// Add the element to the object3D
			curElement.add( element );
			
			curElement.add( createSymbolText( PERIODIC_TABLE[ idx ][ ATOMIC_SYMBOL ] ) );
			curElement.add( createAtomicNbrText( PERIODIC_TABLE[ idx ][ ATOMIC_NBR ] ) );
			curElement.add( createAtomicMassText( PERIODIC_TABLE[ idx ][ ATOMIC_MASS ] ) );
			
			console.log( PERIODIC_TABLE[ idx ][ ATOMIC_NBR ] + " " + PERIODIC_TABLE[ idx ][ ATOMIC_SYMBOL ] );
			
			// Set the x position of the element based on element type
			if ( ACTINIDE_GROUP_NBR === PERIODIC_TABLE[ idx ][ GROUP_NBR ] ) {

				curElement.position.x = actinidesOffsetX;

				actinidesOffsetX += OFFSET;

				curElement.position.y -= ( ACTINIDE_SERIES * OFFSET );
			}
			else if( LANTHANIDE_GROUP_NBR === PERIODIC_TABLE[ idx ][ GROUP_NBR ] ) {

				curElement.position.x = lanthanidesOffsetX;

				lanthanidesOffsetX += OFFSET;

				curElement.position.y -= ( LANTHANIDE_SERIES * OFFSET );
			}
			else {

				curElement.position.x = PERIODIC_TABLE[ idx ][ GROUP_NBR ] * OFFSET;

				// Set the y position of the element
				curElement.position.y -= ( PERIODIC_TABLE[ idx ][ PERIOD_NBR ] * OFFSET );
			}

			// Calculate width boundary for centering
			width = ( curElement.position.x > width ) ? curElement.position.x : width;

			// Calculate height boundary for centering
			height = ( curElement.position.y < width ) ? curElement.position.y : height;
	
			// Add element to the scene graph
			tableSceneGraph.add( curElement );

			// Add element
			elements.push( curElement );
		}

		// Center the table in the scene
		tableSceneGraph.position.x -= ( width + OFFSET ) / 2;
		tableSceneGraph.position.y = -( height ) / 2 + OFFSET;

		return tableSceneGraph;
	};
	
	//*****************************************************************************
	// Maps an object to a selected element in the periodic table returning its
	// properties
	//*****************************************************************************
	this.getSelectedElementProperties = function( mouseVec, camera ) {

		var properties;
		
		var newSelection;

		// Create a ray caster to find position where mouse button press occurred
		var raycaster = new THREE.Raycaster();

		// Set the ray cast from the camera at the translated mouse position
		raycaster.setFromCamera(  mouseVec, camera  );

		// Get the list of objects the ray intersects
		var intersects = raycaster.intersectObjects( elements, true );
    
		// If the ray intersects objects
		if ( intersects.length > 0 )  {

			// Walk the list of elements
			for ( var idx = 0; ( idx < elements.length ) && ( !properties ); ++idx ) {

				// For each child of the element Object3D scene graph				
				for ( var childIdx = 0; ( childIdx < elements[ idx ].children.length ) && ( !properties ); ++childIdx ) {
				
					// the child is intersected by the ray
					if ( intersects[0].object === elements[ idx ].children[ childIdx ] ) {
			
						// Get the properties of the element
						properties = PERIODIC_TABLE[ idx ];
						
						// Set the selected element
						newSelection = elements[ idx ];
					}
				}
			}
		}

		// If an element was previously selected
		if ( selectedElement ) {
			
			// Erase the handle on the element
			selectedElement = null;			
		}
		
		// If a new selection was made
		if ( newSelection ) {
			
			// Store the handle to the selected element
			selectedElement = newSelection;
		}
		
		// Return the properties of the selected element or null
		return properties;
	};

	//*****************************************************************************
	// Maps an object to a selected item in the periodic table returning the index
	//*****************************************************************************
	this.setFont = function( font ) {

		theFont = font;	
	};
};
