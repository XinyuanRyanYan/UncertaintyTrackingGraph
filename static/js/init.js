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

let greenScale = d3.scaleSequential([0,1], d3.interpolateGreens);     // the color range of the line
let greenStartColor = greenScale(0.05);
let greenStopColor = greenScale(0.75);

// focused node or timestamp
let focusT =  '';
let focusNode = '';
let highlightNodes = [];    // the node id list of highlighted nodes
let highlightLinks = [];    // the link id list of highlighted links

// the attrs of scalar fields
let SFAttr = {rows: '', cols: '', rotateAngle: '', h: '', w: ''};

// color map for the scalar fields
// let scalarFieldColorScale = d3.scaleSequential([-0.05, 0.8], d3.interpolateGnBu); 
let scalarFieldColorScale = d3.scaleSequential([8000, 0], d3.interpolateGnBu); 

// five scalar fields
let singleSFMiddle = '';
let singleSFLeft = '';
let singleSFRight = '';
let singleSFLeftL = '';
let singleSFRightR = '';
// 3D scalar fields
let trajectorySF = '';

// color map for the scalar fields
let colorMapTemp = ['rgb(45, 0, 75)',
'rgb(69, 24, 113)',
'rgb(95, 58, 145)',
'rgb(122, 106, 167)',
'rgb(153, 143, 191)',
'rgb(183, 177, 213)',
'rgb(207, 206, 229)',
'rgb(228, 229, 239)',
'rgb(247, 246, 245)',
'rgb(251, 232, 204)',
'rgb(253, 213, 159)',
'rgb(253, 188, 107)',
'rgb(237, 155, 57)',
'rgb(217, 123, 18)',
'rgb(189, 97, 9)',
'rgb(158, 76, 7)'];
// transform the rgb to hex
let colorMap = [];
colorMapTemp.forEach(ele=>{
    colorMap.push(d3.color(ele).formatHex());
});

// 1. get the Json file of tracking graph
axios.post('/getTGData', {
    type: 'name'
    })
    .then((result) => {
        let TGData = result['data'];
        trackingGraphObj = new TrackingGraph(TGData);
        visTrackingGraphObj = new VisTrackingGraph();
        initSFAttr();
        initSF();
        lineColorScale = d3.scaleLinear()
            .domain(trackingGraphObj.pRange)
            .range([startColor, stopColor]);
        // scalarFieldColorScale = d3.scaleSequential(TGData.SFRange, d3.interpolateGnBu); 
        // split the values into 15 
        let vLst = [];
        let vGap = (TGData.SFRange[1]-TGData.SFRange[0])/15;
        for(let i = 0; i < 16; i++){
            vLst.push(TGData.SFRange[0]+vGap*i);
        }
        console.log('vLst', vLst);
        console.log('colorMap', colorMap);
        scalarFieldColorScale = d3.scaleLinear().domain(vLst).range(colorMap); 
    }).catch((err) => {
        console.log(err);
    });


function changeDataset(event){
    // trigger this when change the dataset
    const dataName = event.target.value;
    console.log('result,', dataName);
    axios.post('/changeData', {
            data: dataName
        })
        .then((result) => {
            let TGData = result['data'];
            trackingGraphObj = new TrackingGraph(TGData);
            visTrackingGraphObj = new VisTrackingGraph();
            initSFAttr();
            initSF();
            lineColorScale = d3.scaleLinear()
                .domain(trackingGraphObj.pRange)
                .range([startColor, stopColor]);
            // scalarFieldColorScale = d3.scaleSequential(TGData.SFRange, d3.interpolateGnBu); 
            let vLst = [];
            let vGap = (TGData.SFRange[1]-TGData.SFRange[0])/15;
            for(let i = 0; i < 16; i++){
                vLst.push(TGData.SFRange[0]+vGap*i);
            }
            scalarFieldColorScale = d3.scaleLinear().domain(vLst).range(colorMap); 
        }).catch((err) => {
            console.log(err);
        });
    

}

function initSFAttr(){
    SFAttr.rows = trackingGraphObj.SFDim[0]-1;    // the number of rows, the node num in this row = rows + 1   (150, 450) (600, 248)
    SFAttr.cols = trackingGraphObj.SFDim[1]-1;
    // when row > col, rotation is needec
    SFAttr.rotateAngle = SFAttr.rows>SFAttr.cols? -Math.PI/2 : 0;
    SFAttr.h = 1.2;  // the width and height of the scalar fields in this scalar fields
    SFAttr.w = (d3.max([SFAttr.rows+1, SFAttr.cols+1])/d3.min([SFAttr.rows+1, SFAttr.cols+1]))*SFAttr.h; 
    if(SFAttr.rows>SFAttr.cols){
        let temp = SFAttr.h;
        SFAttr.h = SFAttr.w;
        SFAttr.w = temp;
    }
    console.log(SFAttr);
}

function initSF(){
    /**
     * reset the width of time div
     * init the 2d and 3d Saclar fields
     */
    let height = parseInt(d3.select('#timeAnalysisDiv').style('height'));
    let width = SFAttr.w / SFAttr.h > 1?  height * SFAttr.w / SFAttr.h*5 : height * SFAttr.h / SFAttr.w*5 
    console.log(width);
    d3.select('#timeAnalysisDiv').style('width', width+'px');

    // five scalar fields
    singleSFMiddle = new SingleSF('#SFT');
    singleSFLeft = new SingleSF('#SFLastT');
    singleSFRight = new SingleSF('#SFNextT');
    singleSFLeftL = new SingleSF('#SFLastTT');
    singleSFRightR = new SingleSF('#SFNextTT');
    // 3D scalar fields
    trajectorySF = new Trajectory3D('#threeDPathDiv');
}

function visScalarFields(t, nodeD =''){
    /**
     * visualize the five scalar feilds down below the tracking graph
     * 
     * Args:
     *  t: the focused timestamp
     *  nodeD: the focus feature
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
            singleSFLeftL.renderSF(scalarFields['LL-SF'], t-2, 0xF9CB9C); 
            singleSFLeft.renderSF(scalarFields['L-SF'], t-1, 0xF9CB9C);
            singleSFMiddle.renderSF(scalarFields['SF'], t, greenStopColor); 
            singleSFRight.renderSF(scalarFields['SF-R'], t+1, 0xA4C2F4); 
            singleSFRightR.renderSF(scalarFields['SF-RR'], t+2, 0xA4C2F4);
            trajectorySF.rendering(scalarFields, t);
            // console.log('render all featuresß');

            if(nodeD){
                // five scalar feilds
                // console.log('render features');
                higlightNodesSSF(nodeD);
                trajectorySF.highlightPath(nodeD); // 3D scalar feilds
            }

        })
        .catch((err)=>{
            console.log(err);
        });
}

// clear all scalar fields
function clearScalarFields(){
    if(trajectorySF){
        trajectorySF.reset();
        singleSFMiddle.reset();
        singleSFLeft.reset();
        singleSFRight.reset();
        singleSFLeftL.reset();
        singleSFRightR.reset();
    }
}