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
