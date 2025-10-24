import React, { useRef, useEffect, useState } from 'react';
import { findEndpoints } from './mathUtils.mjs';
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
    
    // endpoints of geodesics
    if (selectedPoints.length === 2) {
      const [p1,p2]=selectedPoints
  
      const endpoints = findEndpoints(p1,p2)
      console.log("endpoints", endpoints)
    
      endpoints.forEach((p, i) => {
        const canvas = diskToCanvas(p);
        ctx.beginPath();
        ctx.arc(canvas.x, canvas.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? '#a200ffff' : '#1f16a3ff';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
    
    // Draw points
    selectedPoints.forEach((p, i) => {
      const canvas = diskToCanvas(p);
      ctx.beginPath();
      ctx.arc(canvas.x, canvas.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = i === 0 ? '#dc2626' : '#16a34a';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
  }, [selectedPoints]);

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