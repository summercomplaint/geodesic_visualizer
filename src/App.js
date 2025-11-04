import React, { useRef, useEffect, useState } from 'react';
import { findEndpoints, findCircle,partialCircle, getTranslates,moveInside,extendPath} from './mathUtils.mjs';
import { complex} from 'mathjs'


const HyperbolicDisk = () => {

      const [shiftLifts, setShiftLifts] = useState(false);
    const [inLifts, setInLifts] = useState(false);
  const canvasRef = useRef(null);
  const [selectedPoints, setSelectedPoints] = useState([]);

  const width = 600;
  const height = 600;
  const center = { x: width / 2, y: height / 2 };
  const radius = 250;

  const grey="#bbbbbbff"
  const l = 2**(-1/4)
  const octVertices= Array.from({length: 8}, (_, i) =>
    complex({abs: l, arg:  i * 2 * Math.PI / 8}))
  

  // Convert canvas coordinates to disk coordinates (-1 to 1)
  const canvasToDisk = (canvasX, canvasY) => {
    const x = (canvasX - center.x) / radius;
    const y = (canvasY - center.y) / radius;
    return complex(x,y);
  };

  // Convert disk coordinates to canvas coordinates
  const diskToCanvas = (z) => {
    const x = z.re * radius + center.x;
    const y = z.im * radius + center.y;
    return { x, y };
  };

  // Check if point is inside unit disk
  const isInDisk = (z) => {
    return z.abs() < 0.99; // Slightly less than 1 for numerical stability
  };

 const drawPoint =(ctx, x,y,color)=> {
    ctx.beginPath();
    ctx.arc(x,y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const drawGeod=(ctx,p1,p2,color, partial=false,thickness=1)=>{

    let circledata=0
    if (partial===false){
    const [e1,e2] = findEndpoints(p1,p2)
    circledata = findCircle(e1,e2)
    }
    else{
    circledata = partialCircle(p1,p2)
    }
      
    const c=diskToCanvas(circledata.circCenter)
      
    const trueRadius=radius*circledata.radius
    ctx.beginPath();
    ctx.arc(c.x,c.y, trueRadius, circledata.phi1, circledata.phi2);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }
  
  //const rainbow=['#1800a1ff', '#0081a1ff','#00a148ff','#91a100ff', '#a17600ff', '#a14000ff', '#a10000ff', '#a1007eff', '#6e00a1ff']
  const rainbow=['#000000ff', '#333333ff','#4f5050ff','#696969ff', '#818181ff', '#b3b3b3ff', '#c9c8c8ff']
  const massGeod=(ctx, coords, color, partial, graded=false,thickness=1)=>{

    coords.forEach((coord, i) => {

        const [p1,p2] = coord 
        if (graded){drawGeod(ctx,p1,p2,rainbow[i%rainbow.length], partial)}
        else{drawGeod(ctx,p1,p2,color, partial,thickness)}
      })
  }

  const basicTranslates=(ctx,p1,p2,color, partial=false,recursive=1)=>{

      let fullCoords=[[p1,p2]]
      for (let r=0;r<recursive;r++){
        let newCoords=getTranslates(fullCoords)
        fullCoords=fullCoords.concat(newCoords)
      }
      massGeod(ctx,fullCoords,color, partial)
  }

  


  // Draw everything
  useEffect(() => {


    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw unit disk
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    //draw center point
    drawPoint(ctx,center.x,center.y,"black")
    
    //drawing the octagonal lattice
    const redLat='#ff5959ff'
    const yellowLat='#ffdd48ff'
    const greenLat= '#66ff47ff'
    const blueLat='#536dffff'
    const latticeCols=[redLat,yellowLat,redLat,yellowLat,greenLat,blueLat,greenLat,blueLat]
    for (let k=0; k<8;k++) {
      const curr=octVertices[k]
      const next=octVertices[(k+1)%8]

      drawGeod(ctx,curr,next,latticeCols[k],true)
      basicTranslates(ctx,curr,next,latticeCols[k], true, 3)
    }


    // endpoints of geodesics
    if (selectedPoints.length === 2) {
      const [p1,p2]=selectedPoints
  
      const endpoints = findEndpoints(p1,p2)
      
      endpoints.forEach((p, ) => {
        const endpt=diskToCanvas(p)
        drawPoint(ctx,endpt.x,endpt.y,'#000000ff')

      });
      
      
      if (shiftLifts){
        basicTranslates(ctx,p1,p2,grey,false,3)
      }
      if (inLifts){
      
      const its=6
      const leftCoords=extendPath(p1,p2,its)
      
      massGeod(ctx,leftCoords,grey, false,2)
      const rightCoords=extendPath(p2,p1,its)
      
      massGeod(ctx,rightCoords,grey, false,true,2)
      
      /*
      const [x1,x2]=moveInside(p1,p2)
      drawGeod(ctx,x1,x2,grey,false,2)
      
      const [y1,y2]=moveInside(p2,p1)
      drawGeod(ctx,y1,y2,grey,false,2)
      */
      }

      drawGeod(ctx,p1,p2,"black",false,2)
      
      
      
      

    }
    
    // Draw points
    selectedPoints.forEach((p, i) => {
      const canvas = diskToCanvas(p);
      drawPoint(ctx,canvas.x,canvas.y, "#0026ff")
    });
    
  }, [selectedPoints,shiftLifts,inLifts]);



  //event handling v


  
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const diskPoint = canvasToDisk(canvasX, canvasY);
    
    if (isInDisk(diskPoint)) {
      if (selectedPoints.length < 2) {
        setSelectedPoints([...selectedPoints, diskPoint]);
      } else {
        // Reset and start with new point
        setSelectedPoints([diskPoint]);
      }
    }
  };

  const handleReset = () => {
    setSelectedPoints([]);
  };


  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Hyperbolic Disk Model</h1>
        <p className="text-gray-600 mb-4">
          Click two points inside the disk to draw a hyperbolic geodesic between them.
        </p>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
          className="border border-gray-300 rounded cursor-crosshair"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reset Points
          </button>
          <div className="flex-1 text-sm text-gray-600 flex items-center">
            {selectedPoints.length === 0 && "Select first point"}
            {selectedPoints.length === 1 && "Select second point"}
            {selectedPoints.length === 2 && "Click to start over"}
          </div>
          <fieldset>
  <legend>Draw which lifts?:</legend>
<div>
<input 
  type="checkbox" 
  id="shiftLifts" 
  checked={shiftLifts}
  onChange={(e) => setShiftLifts(e.target.checked)}
/>
<label htmlFor="shiftLifts"> Shifted Lifts</label>
</div>

<div>
<input 
  type="checkbox" 
  id="inLifts" 
  checked={inLifts}
  onChange={(e) => setInLifts(e.target.checked)}
/>
<label htmlFor="inLifts"> Path Continued Inside</label>

</div>
</fieldset>
        </div>
      </div>
    </div>
  );
};

export default HyperbolicDisk;