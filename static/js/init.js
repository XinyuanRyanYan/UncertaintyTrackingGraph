/**the start script*/

let trackingGraphObj;   // the data structure object of the tracking graph
let visTrackingGraphObj;    // the visualization object of the tracking graph


// the probability threshould for the lines
let pThreshould = 0;

// color of the line
let blueScale = d3.scaleSequential([0,1], d3.interpolateBlues);     
let startColor = blueScale(0.1);
let stopColor = blueScale(0.75);
let nodeColor = '#888888';

// selected node color
let orangeScale = d3.scaleSequential([0,1], d3.interpolateOranges);     // the color range of the line
let orangeStartColor = orangeScale(0.05);
let orangeStopColor = orangeScale(0.9);

// focused node or timestamp
let focusT =  '';
let focusNode = '';
let highlightNodes = [];    // the node id list of highlighted nodes
let highlightLinks = [];    // the link id list of highlighted links

// 1. get the Json file of tracking graph
axios.post('/getTGData', {
    type: 'name'
    })
    .then((result) => {
        let TGData = result['data'];
        trackingGraphObj = new TrackingGraph(TGData);
        visTrackingGraphObj = new VisTrackingGraph();
        console.log(visTrackingGraphObj);
    }).catch((err) => {
        console.log(err);
    });

// 2. init the data structure object of tracking graph 

// 3. init the visualization object of tracking graph
