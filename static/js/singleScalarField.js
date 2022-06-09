/**
 * This script is used to visualize one scalarField at the bottom of the screen
 */

/**
 * SingleSF is used to handle the rendering and interactions of the single scalar field div
 * @param {*} scalarField scalar field matrix
 */

class SingleSF {
    constructor(divId) {
        this.divId = divId;
        this.width = parseInt(d3.select(this.divId).style('width'));
        this.height = parseInt(d3.select(this.divId).style('height'));
        this.rows = 599;    // the number of rows, the node num in this row = rows + 1   (150, 450) (600, 248)
        this.cols = 247;
        this.camera = '';
        this.scene = '';
        this.renderer = '';
        this.controls = '';
        this.features = {};     // all features at this timestamp {'index': node geometry}
        this.highlightFeatureIndex = '';     // the feature id
        this.init();
        // this.controls = new OrbitControls( this.camera, this.renderer.domElement);
        this.renderer.render( this.scene, this.camera );
    }

}

/**
 * animate
 */
 SingleSF.prototype.animate = function(){
    // notice here, callback
    window.webkitRequestAnimationFrame(this.animate.bind(this));
    this.renderer.render( this.scene, this.camera );
}

/**
 * init camera, scene, renderer, controls
 */
SingleSF.prototype.init = function(){
    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 0.01, 10 );
    this.camera.position.z = 1.15;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( '#CCCCCC' );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.width, this.height );

    d3.select(this.divId).node().appendChild( this.renderer.domElement);
}

/**
 * render the scalar field
 */
SingleSF.prototype.renderSF = function(scalarField, t){
    if(scalarField == -1){
        return;
    }
    // first remove previous scalarfield
    this.scene.clear();
    this.renderer.clear();

    const geometry = new THREE.PlaneBufferGeometry( 3, 1, this.cols, this.rows );
    const position = geometry.attributes.position;
    const colors = [];

    for ( let i = 0; i < position.count; i ++ ) {
        // find the value at this point in matrix
        let row = parseInt(i/(this.cols+1)), col = i%(this.cols+1);
        let value = scalarField[row][col];
        // convert this value into the color
        let d3Color = scalarFieldColorScale(value);
        // change the color into the THREE color
        const color = new THREE.Color(d3Color);
        colors.push( color.r, color.g, color.b );
    }
		
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.VertexColors } );
    mesh = new THREE.Mesh( geometry, material );
    this.scene.add(mesh);

    this.renderFeatures(t);
    this.animate();
}

/**
 * render all of the features at the time t
 */
SingleSF.prototype.renderFeatures = function(t){
    // clear the last time
    this.features = {};
    this.highlightFeatureIndex = '';

    // find all nodes in this timestamp
    let node_ids = trackingGraphObj.nodesPerT[t];

    for(let i = 0; i < node_ids.length; i++){
        // for each node, record the index, row, and col
        let node_index = node_ids[i]; 
        let node = trackingGraphObj.nodes[node_index];
        let row = node['r'], col = node['c'];
        
        // generate this circle
        let geometry = new THREE.CircleGeometry( 0.01, 32 ).translate(col*3/this.cols-1.5, -(row*1/this.rows-0.5), 0);
        const material = new THREE.MeshBasicMaterial( { color: 'orange' } );
        const circle = new THREE.Mesh( geometry, material );

        // add this node into the features
        this.features[node_index+''] = circle

        // add this node into scene
        this.scene.add( circle );
    }
    this.animate();
}

/**
 * restore previous node, and highlight the current node
 * @param {*} node
 */
SingleSF.prototype.highlightFeatures = function(nodeLst){
    // restore the prrevious one
    for(key in this.features){
        let curNode = trackingGraphObj.nodes[key];
        let row = curNode['r'], col = curNode['c'];
        this.features[key].geometry = new THREE.CircleGeometry( 0.01, 32 ).translate(col*3/this.cols-1.5, -(row*1/this.rows-0.5), 0);
        this.features[key].material = new THREE.MeshBasicMaterial( { color:  'orange'} );   
    }
    
    for(let i = 0; i < nodeLst.length; i++){
        let node = nodeLst[i];
        let index = node['id']+'';
        let row = node['r'], col = node['c'];
        this.features[index].geometry = new THREE.CircleGeometry( 0.02, 32 ).translate(col*3/this.cols-1.5, -(row*1/this.rows-0.5), 0);
        this.features[index].material = new THREE.MeshBasicMaterial( { color:  'red'} );
    }
    
    this.animate();
}

SingleSF.prototype.restore = function(){
    for(key in this.features){
        let curNode = trackingGraphObj.nodes[key];
        let row = curNode['r'], col = curNode['c'];
        this.features[key].geometry = new THREE.CircleGeometry( 0.01, 32 ).translate(col*3/this.cols-1.5, -(row*1/this.rows-0.5), 0);
        this.features[key].material = new THREE.MeshBasicMaterial( { color:  'orange'} );   
    }
}
