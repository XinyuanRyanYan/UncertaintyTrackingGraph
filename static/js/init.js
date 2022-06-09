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
let lineColorScale;     // scalar feilds

// selected node color
let orangeScale = d3.scaleSequential([0,1], d3.interpolateOranges);     // the color range of the line
let orangeStartColor = orangeScale(0.05);
let orangeStopColor = orangeScale(0.9);

// focused node or timestamp
let focusT =  '';
let focusNode = '';
let highlightNodes = [];    // the node id list of highlighted nodes
let highlightLinks = [];    // the link id list of highlighted links

// color map for the scalar fields
// let scalarFieldColorScale = d3.scaleSequential([-0.05, 0.8], d3.interpolateGnBu); 
let scalarFieldColorScale = d3.scaleSequential([8000, 0], d3.interpolateGnBu); 

// five scalar fields
let singleSFMiddle = new SingleSF('#SFT');
let singleSFLeft = new SingleSF('#SFLastT');
let singleSFRight = new SingleSF('#SFNextT');
let singleSFLeftL = new SingleSF('#SFLastTT');
let singleSFRightR = new SingleSF('#SFNextTT');
// 3D scalar fields
let trajectorySF = new Trajectory3D('#threeDPathDiv');

// 1. get the Json file of tracking graph
axios.post('/getTGData', {
    type: 'name'
    })
    .then((result) => {
        let TGData = result['data'];
        trackingGraphObj = new TrackingGraph(TGData);
        visTrackingGraphObj = new VisTrackingGraph();
        // console.log(visTrackingGraphObj);
        lineColorScale = d3.scaleLinear()
            .domain(trackingGraphObj.pRange)
            .range([startColor, stopColor]);
    }).catch((err) => {
        console.log(err);
    });

function visScalarFields(t){
    /**
     * visualize the five scalar feilds down below the tracking graph
     * 
     * Args:
     *  t: the focused timestamp
     */
    let getTDict = (t)=>{
        /* {'LL-SF': t-2, 'L-SF': t-1, 'SF': t, 'SF-R': t+1, 'SF-RR': t+2} */
        let tDict = {'LL-SF': -1, 'L-SF': -1, 'SF': -1, 'SF-R': -1, 'SF-RR': -1};
        function islegalT(t, T=trackingGraphObj.timestamps){
            return t>=0&&t<T? true:false;
        }
        tDict['LL-SF'] = islegalT(t-2)? t-2:-1;
        tDict['L-SF'] = islegalT(t-1)? t-1:-1;
        tDict['SF'] = islegalT(t)? t:-1;
        tDict['SF-R'] = islegalT(t+1)? t+1:-1;
        tDict['SF-RR'] = islegalT(t+2)? t+2:-1;
        return tDict;
    }


    axios.post('/getScalarFields', getTDict(t))
        .then((result) => {
            let scalarFields = result['data'];
            singleSFMiddle.renderSF(scalarFields['LL-SF'], t);
            singleSFLeft.renderSF(scalarFields['L-SF'], t-1);
            singleSFRight.renderSF(scalarFields['SF'], t+1);
            singleSFLeftL.renderSF(scalarFields['SF-R'], t-2);
            singleSFRightR.renderSF(scalarFields['SF-RR'], t+2);
            trajectorySF.rendering(scalarFields, t);
        })
        .catch((err)=>{
            console.log(err);
        });
}
