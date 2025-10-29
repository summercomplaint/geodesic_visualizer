import React, { useRef, useEffect, useState } from 'react';
import { findEndpoints, findCircle,partialCircle, slideMap, geodToGeod} from './mathUtils.mjs';
import { complex} from 'mathjs'


const HyperbolicDisk = () => {
  const canvasRef = useRef(null);
  const [selectedPoints, setSelectedPoints] = useState([]);

  const width = 600;
  const height = 600;
  const center = { x: width / 2, y: height / 2 };
  const radius = 250;

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

  const drawGeod=(ctx,p1,p2,color, partial=false)=>{

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
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  
  const getTranslates=(coords)=>{
      const indices=[0,1,4,5]
      const newCoords=[]
      for (const coord of coords){
        const [p1,p2]=coord

        for (let k=0; k<4;k++) {
          
          let i=indices[k]
          
          const v1=octVertices[i]
          const v2=octVertices[(i+1)%8]
          const q1=octVertices[(i+2)%8]
          const q2=octVertices[(i+3)%8]
          
          newCoords.push([geodToGeod(v1,v2,q2,q1,p1),geodToGeod(v1,v2,q2,q1,p2)])
          newCoords.push([geodToGeod(q2,q1,v1,v2,p1),geodToGeod(q2,q1,v1,v2,p2)])

        }
      }
      return newCoords
  }
  const basicTranslates=(ctx,p1,p2,color, partial=false,recursive=2)=>{

      let fullCoords=[[p1,p2]]
      for (let r=0;r<recursive;r++){
        let newCoords=getTranslates(fullCoords)
        fullCoords=fullCoords.concat(newCoords)
      }
      for (const coord of fullCoords){
        const [p1,p2] = coord 
        drawGeod(ctx,p1,p2,color, partial)
      }
  }

  const grey="#bbbbbbff"
  const l = 2**(-1/4)
  const octVertices= Array.from({length: 8}, (_, i) =>
    complex({abs: l, arg:  i * 2 * Math.PI / 8}))
  
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
    
    /*
    octVertices.forEach((p, i) => {
      const canvas = diskToCanvas(p);
      drawPoint(ctx,canvas.x,canvas.y, "#818181ff")
    });
    */

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
      const [e1,e2]=endpoints
      endpoints.forEach((p, i) => {
        const endpt=diskToCanvas(p)
        drawPoint(ctx,endpt.x,endpt.y,'#000000ff')

      });
      
      drawGeod(ctx,p1,p2,"black",false)
      //basicTranslates(ctx,p1,p2,false)

    }
    
    // Draw points
    selectedPoints.forEach((p, i) => {
      const canvas = diskToCanvas(p);
      drawPoint(ctx,canvas.x,canvas.y, "#0026ff")
    });
    
  }, [selectedPoints]);



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
        </div>
      </div>
    </div>
  );
};

export default HyperbolicDisk;