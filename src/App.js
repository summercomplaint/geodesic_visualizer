import React, { useRef, useEffect, useState } from 'react';

const HyperbolicDisk = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);

  const width = 600;
  const height = 600;
  const center = { x: width / 2, y: height / 2 };
  const radius = 250;

  // Convert canvas coordinates to disk coordinates (-1 to 1)
  const canvasToDisk = (canvasX, canvasY) => {
    const x = (canvasX - center.x) / radius;
    const y = (canvasY - center.y) / radius;
    return { x, y };
  };

  // Convert disk coordinates to canvas coordinates
  const diskToCanvas = (diskX, diskY) => {
    const x = diskX * radius + center.x;
    const y = diskY * radius + center.y;
    return { x, y };
  };

  // Check if point is inside unit disk
  const isInDisk = (x, y) => {
    return x * x + y * y < 0.99; // Slightly less than 1 for numerical stability
  };

  // Compute hyperbolic geodesic between two points in the disk
  // Returns null for diameter (straight line through origin), 
  // or circle parameters {cx, cy, r} for the orthogonal circle
  const computeGeodesic = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Check if points are approximately collinear with origin
    const det = p1.x * p2.y - p1.y * p2.x;
    if (Math.abs(det) < 0.001) {
      return null; // Straight line through origin
    }

    // The geodesic is part of a circle orthogonal to the unit circle
    // We need to find the center and radius of this circle
    
    // Using the formula for orthogonal circle
    const p1Sq = p1.x * p1.x + p1.y * p1.y;
    const p2Sq = p2.x * p2.x + p2.y * p2.y;
    
    const cx = ((p2.y - p1.y) * (p1Sq - p2Sq) + 2 * (p1.y * p2Sq - p2.y * p1Sq)) / (2 * det);
    const cy = ((p1.x - p2.x) * (p1Sq - p2Sq) + 2 * (p2.x * p1Sq - p1.x * p2Sq)) / (2 * det);
    
    const r = Math.sqrt(cx * cx + cy * cy - 1);
    
    return { cx, cy, r };
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
    
    // Draw geodesics between selected points
    if (selectedPoints.length === 2) {
      const [p1, p2] = selectedPoints;
      const geodesic = computeGeodesic(p1, p2);
      
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      if (geodesic === null) {
        // Straight line through origin
        const canvas1 = diskToCanvas(p1.x, p1.y);
        const canvas2 = diskToCanvas(p2.x, p2.y);
        ctx.moveTo(canvas1.x, canvas1.y);
        ctx.lineTo(canvas2.x, canvas2.y);
      } else {
        // Arc of circle
        const canvasCenter = diskToCanvas(geodesic.cx, geodesic.cy);
        const canvasRadius = geodesic.r * radius;
        
        // Calculate angles
        const angle1 = Math.atan2(p1.y - geodesic.cy, p1.x - geodesic.cx);
        const angle2 = Math.atan2(p2.y - geodesic.cy, p2.x - geodesic.cx);
        
        // Draw the arc (need to determine which arc to draw)
        let startAngle = angle1;
        let endAngle = angle2;
        
        // Ensure we draw the arc that stays inside the disk
        const midAngle = (angle1 + angle2) / 2;
        const testPoint = {
          x: geodesic.cx + Math.cos(midAngle) * geodesic.r,
          y: geodesic.cy + Math.sin(midAngle) * geodesic.r
        };
        
        if (!isInDisk(testPoint.x, testPoint.y)) {
          // Draw the other arc
          if (endAngle > startAngle) {
            endAngle -= 2 * Math.PI;
          } else {
            endAngle += 2 * Math.PI;
          }
        }
        
        ctx.arc(canvasCenter.x, canvasCenter.y, canvasRadius, startAngle, endAngle);
      }
      
      ctx.stroke();
    }
    
    // Draw points
    selectedPoints.forEach((p, i) => {
      const canvas = diskToCanvas(p.x, p.y);
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
    
    if (isInDisk(diskPoint.x, diskPoint.y)) {
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