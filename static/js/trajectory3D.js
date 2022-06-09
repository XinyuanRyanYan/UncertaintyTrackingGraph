/**
 * This script is used to visualize the 3d Trajectory3D
 */

class Trajectory3D{
    constructor(divId){
        this.divId = divId;
        this.width = parseInt(d3.select(this.divId).style('width'));
        this.height = parseInt(d3.select(this.divId).style('height'));
        this.rows = 149;    // the number of rows, the node num in this row = rows + 1 (150, 450)
        this.cols = 449;
        this.camera = '';
        this.scene = '';
        this.renderer = '';
        this.controls = '';
        this.lines = {};    // {lineId: lineGeometry}
        this.features = {};
        this.highlightFeatureIndex = '';
        this.centerT = '';  // center timestamp
        this.init();
        this.renderer.render( this.scene, this.camera );
    }    
}

/**
 * animate
 */
Trajectory3D.prototype.animate = function(){
    // notice here, callback
    window.webkitRequestAnimationFrame(this.animate.bind(this));
    // requestAnimationFrame( animate );
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
}

/**
 * init camera, scene, renderer, controls
 */
 Trajectory3D.prototype.init = function(){
    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 0.01, 10 );
    this.camera.position.z = 3.5;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( '#888888' );

    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    this.renderer.setSize( this.width, this.height );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement);

    d3.select(this.divId).node().appendChild( this.renderer.domElement);
}

/**
 * render the 3d scalar field regarding the centerT
 * @param {*} SFDict: {'LL-SF': [scalar filed], 'L-SF': [], 'SF': t, []: t+1, 'SF-RR': []} 
 */
Trajectory3D.prototype.rendering = function(SFDict, centerT){
    // reset
    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 0.01, 10 );
    this.camera.position.z = 3.5;
    this.scene.clear();
    this.controls = new OrbitControls( this.camera, this.renderer.domElement);
    this.lines = {};    // {lineId: lineGeometry}
    this.features = {};
    this.highlightFeatureIndex = '';

    // scalar fields 
    let SFLst = [];  
    for(key in SFDict){
        if(SFDict[key]!=-1){
            SFLst.push(SFDict[key]);
        }
    }
    let gap = 3.5/(SFLst.length-1);    // the gap among different layers
    let startZ = -1.7;       // the start Z

    // add each scalar field into the scene 
    for(let i = 0; i < SFLst.length; i++){
        // get the position of Z
        this.addSF(SFLst[i], startZ+gap*i);
    }

    // visualize the lines
    this.centerT = centerT;
    let cnt = 0, i = 0;
    for(key in SFDict){
        if(SFDict[key]!=-1 && i<4){
            this.renderLines(centerT-2+i, startZ+gap*cnt, startZ+gap*(cnt+1));
            cnt += 1;
        }
        i += 1;
    }
    // for(let i = 0; i < t_lst.length-1; i++){
    //     // render the lines between each layer
    //     this.renderLines(t_lst[i], startZ+gap*i, startZ+gap*(i+1));
    // }

    // render the features of this timestamp
    let tIdx = 0;
    if(SFDict['LL-SF']!=-1){
        tIdx += 1;
    }
    if(SFDict['L-SF']!=-1){
        tIdx += 1;
    }
    this.renderFeatures(centerT, startZ+gap*tIdx);

    this.animate();
}

/**
 * add the scalar field at timestamp t into the scene
 * @param {} t: timestamp
 * z: the translation in the z direction
 */
Trajectory3D.prototype.addSF = function(scalarField, z){
    let geometry = new THREE.PlaneBufferGeometry( 3, 1, this.cols, this.rows ).translate(0, 0, z).rotateX(Math.PI/2+Math.PI);
    let position = geometry.attributes.position;
    let colors = [];

    for ( let i = 0; i < position.count; i ++ ) {
        // find the value at this point in matrix
        let row = parseInt(i/(this.cols+1)), col = i%(this.cols+1);
        let value = scalarField[row][col];
        // convert this value into the color
        let d3Color = scalarFieldColorScale(value);
        // change the color into the THREE color
        let color = new THREE.Color(d3Color);
        colors.push( color.r, color.g, color.b );
    }
		
	geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, vertexColors: THREE.VertexColors } );
    mesh = new THREE.Mesh( geometry, material );
    this.scene.add(mesh);
}

/**
 * render lines of the parents of t 
 * @param {*} t; z1 z2 represent the z-value of the layers
 */
Trajectory3D.prototype.renderLines = function(t, z1, z2){
    // nodes at this layer
    let nodeIds = trackingGraphObj.nodesPerT[t];

    // for each node find its parentnode and link
    for(let i = 0; i < nodeIds.length; i++){
        let node = trackingGraphObj.nodes[nodeIds[i]];
        let nodeX = node['c']*3/this.cols-1.5, nodeY = -(node['r']*1/this.rows-0.5);
    
        // find all parents node
        let parents = node['children'];
        for(let j = 0; j < parents.length; j++){
            // for each node, find the position of this node
            let parent = parents[j];
            let parentNode = parent['node'];
            let pro = parent['p'];
            let linkId = parent['link']['id'];
            let pNodeX = parentNode['c']*3/this.cols-1.5, pNodeY = -(parentNode['r']*1/this.rows-0.5);
            this.addLine([nodeX, nodeY, z1], [pNodeX, pNodeY, z2], pro, linkId);
        }

    }

    // render the line
}


/**
 * add one line into the scene
 * @param {*} pos1  [x, y, z]
 * @param {*} pos2  [x, y, z]
 * @param {*} pro 
 */
Trajectory3D.prototype.addLine = function(pos1, pos2, pro, linkId){
    // add a link
    let points = [];
    points.push( new THREE.Vector3( pos1[0], pos1[1], pos1[2] ) );
    points.push( new THREE.Vector3( pos2[0], pos2[1], pos2[2] ) );
    let geometryLine = new THREE.BufferGeometry().setFromPoints( points ).rotateX(Math.PI/2+Math.PI);

    // get the color of this line
    let color = visTrackingGraphObj.lineColorScale(pro);

    let materialLine = new THREE.LineBasicMaterial( { color: new THREE.Color(color), linewidth: 300});
    let line = new THREE.Line( geometryLine, materialLine );
    this.scene.add(line);
    this.lines[linkId+''] = line;
}

/**
 * render all of the features at the time t, z means the z value
 */
Trajectory3D.prototype.renderFeatures = function(t, z){
    // find all nodes in this timestamp
    let node_ids = trackingGraphObj.nodesPerT[t];
    for(let i = 0; i < node_ids.length; i++){
        // for each node, record the index, row, and col
        let node_index = node_ids[i]; 
        let node = trackingGraphObj.nodes[node_index];
        let row = node['r'], col = node['c'];
        
        // generate this circle
        let geometry = new THREE.CircleGeometry( 0.02, 32 ).translate(col*3/this.cols-1.5, -(row*1/this.rows-0.5),z).rotateX(Math.PI/2+Math.PI);
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
 * hightlight this node and the relevant path 
 * @param {*} node 
 */
Trajectory3D.prototype.highlightPath = function(node){
    this.restorePath();

    // highlight this node
    let index = node['id']+'';
    this.features[index].material = new THREE.MeshBasicMaterial( { color:  'red'} );

    // highlight path
    let selectedLinks = [];
    let ct = this.centerT;
    findParents(node);
    findChildren(node);

    for(let j = 0; j < selectedLinks.length; j++){
        let link = selectedLinks[j];
        // get the color of this line
        let color = visTrackingGraphObj.highlightColorScale(link['p']);
        this.lines[link['id']].material = new THREE.LineBasicMaterial( { color: new THREE.Color(color), linewidth: 1} );
    }

    this.animate();

    // find all parents
    function findParents(node_){
        let t = parseInt(node_['t']);
        if(Math.abs(t-ct)<2){
            let parents = node_['parents'];
            for(let i = 0; i < parents.length; i++){
                let parent = parents[i]['node'];
                let link = parents[i]['link'];
                selectedLinks.push(link);
                findParents(parent);
            }
        }
        
    }
    // find all descents
    function findChildren(node_){
        let t = parseInt(node_['t']);
        if(Math.abs(t-ct)<2){
            let children = node_['children'];
            for(let i = 0; i < children.length; i++){
                let child = children[i]['node'];
                let link = children[i]['link'];
                selectedLinks.push(link);
                findChildren(child);
            }
        }
        
    }

}

/**
 * restore the previous highlighted path
 */
Trajectory3D.prototype.restorePath = function(opa = 0){
    // restore all feature
    for(key in this.features){
        this.features[key].material = new THREE.MeshBasicMaterial( { color:  'orange'} );   
    }
    // restore all lines
    for(key in this.lines){
        let link = trackingGraphObj.links[parseInt(key)];
         // get the color of this line
        let color = visTrackingGraphObj.lineColorScale(link['p']);
        // color = '#888888';
        // this.lines[key].material = new THREE.LineBasicMaterial( { transparent: true, opacity: opa } );
        this.lines[key].material.opacity = opa;
        this.lines[key].material.transparent = true;
        this.lines[key].material.color = new THREE.Color(color);
    }

}