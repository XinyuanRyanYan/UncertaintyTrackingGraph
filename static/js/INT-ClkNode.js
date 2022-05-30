/**Interaction: click on a node, then highlight nodes */

function clickNode(nodeD){
    let id = nodeD.id;
    let t = nodeD.t;

    // 1. if node is focused, then restore
    if(id == focusNode){
        restoreNode();
        return;
    }
    // 2. else
    if(focusNode != ''){
        if(focusT == t){
            restoreNode();
        }
        else if(focusT != ''){
            restoreNode();
            fishEyeLayoutHandler(t);
            focusT = t;
        }
    }
    else{
        if(focusT == ''){
            fishEyeLayoutHandler(t);
            focusT = t;
        }
    }

    focusNode = id;

    // 3. store and highlight current node, parent nodes, child nodes/ and links 
    let parentData = getPorCInfo(nodeD, 'parents');
    let childData = getPorCInfo(nodeD, 'children');
    highlightNodes = parentData[0].concat(childData[0]);  
    highlightNodes.push(nodeD);     // curNode + parents + children
    highlightLinks = parentData[1].concat(childData[1]);
   
    // 4. highlight thses nodes and links
    styleNodesLinks();
}

function styleNodesLinks(highlight = true){
    /** highlight or restore the nodes and links
     */
    let colorScale = visTrackingGraphObj.highlightColorScale;
    // nodes
    // highlightNodes.forEach((ele)=>{
    //     d3.select('#node-'+ele['id'])
    //         .style('fill', ()=>highlight? 'red':null);
    // });
    // links
    highlightLinks.forEach((ele)=>{
        d3.select('#link-'+ele['id'])
            .style('stroke', (d)=>highlight? colorScale(d.p):null)
            .style('stroke-width', ()=>highlight? '2.3': null);
    });
    d3.select('#node-'+focusNode)
        .style('fill', ()=>highlight? orangeStopColor:null)
        .style('r', ()=>highlight? '4':null)
        .style('fill-opacity', ()=>highlight? 1 : null);
}

function restoreNode(){
    /** 
     * 1. restore the highlighted node/link
     * 2. set the focus node to be null
     */
    styleNodesLinks(false);
    focusNode = '';
    highlightNodes = [];
    highlightLinks = [];
}

function getPorCInfo(node, drt, dis=10000000){
    /* get the parent or child nodes and links of a node, within dis distance
    Args:
        node: the object of node
        drt(str): 'parents' or 'children'
        dis(int): with in dis steps 
    
    Res:
        (nodesList, linksList) 
    */
    let focusNodes = [];
    let focusLinks = [];
    
    let waitingNodes = [node];  // nodes to be find parents/children
    let curDis = 0;     // the current distance
    
    while(waitingNodes.length!=0 && curDis <= dis){
        let newWaitNodes = [];
        waitingNodes.forEach((ele)=>{
            let pNodeList = ele[drt];
            pNodeList.forEach((e)=>{    // for each parent/children
                // add a link
                focusLinks.push(e.link);
                // add this node if it isn't in the newWaitNodes
                let pNode = e.node;
                if(!newWaitNodes.includes(pNode)){
                    newWaitNodes.push(pNode);
                    focusNodes.push(pNode);
                }
            });
        });
        waitingNodes = newWaitNodes;
        curDis += 1;
    }

    return [focusNodes, focusLinks];
}

