import React from 'react';

type CubeTheme = 'forest' | 'sage' | 'cream' | 'ivory' | 'mixed-green' | 'mixed-light';

interface IsometricCubeProps {
  size: number;
  x: number;
  y: number;
  theme?: CubeTheme;
  opacity?: number;
  className?: string;
}

export function IsometricCube({ size, x, y, theme = 'forest', opacity = 1, className = '' }: IsometricCubeProps) {
  // SVG paths for an isometric cube centered at (0,0) with given size (which is the width of the cube)
  // The height of a perfect isometric cube is size * (sqrt(3)/2) approx size * 0.866
  // But we can use simple exact proportions:
  // W = size, H = size * 0.866
  // Center is (size/2, size*0.433)
  
  const w = size;
  const h = size * 0.866;
  const cx = w / 2;
  const cy = h / 2;
  
  // Coordinates for the 3 faces
  // Top face
  const topPath = `M ${cx} 0 L ${w} ${h/3} L ${cx} ${h * 2/3} L 0 ${h/3} Z`;
  // Left face
  const leftPath = `M 0 ${h/3} L ${cx} ${h * 2/3} L ${cx} ${h} L 0 ${h * 2/3} Z`;
  // Right face
  const rightPath = `M ${cx} ${h * 2/3} L ${w} ${h/3} L ${w} ${h * 2/3} L ${cx} ${h} Z`;

  // Color mapping based on theme to provide solid face colors
  const colors = {
    forest: {
      top: '#74A78A', // sage
      left: '#2D6A4F', // forest-light
      right: '#1B4332' // forest
    },
    sage: {
      top: '#E5E0D8', // border-subtle
      left: '#A5C9B4', // light sage
      right: '#74A78A' // sage
    },
    cream: {
      top: '#FFFFFF', // white
      left: '#FDFBF7', // cream
      right: '#E5E0D8' // border-subtle
    },
    ivory: {
      top: '#FDFBF7', // cream
      left: '#F5F2EB', // ivory
      right: '#E5E0D8' // border-subtle
    },
    'mixed-green': {
      top: '#E5E0D8',
      left: '#74A78A',
      right: '#1B4332'
    },
    'mixed-light': {
      top: '#FFFFFF',
      left: '#F5F2EB',
      right: '#74A78A'
    }
  };

  const themeColors = colors[theme] || colors.forest;

  return (
    <div 
      className={`absolute ${className}`} 
      style={{ 
        left: x, 
        top: y, 
        width: w, 
        height: h,
        opacity: opacity
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
        <path d={topPath} fill={themeColors.top} />
        <path d={leftPath} fill={themeColors.left} />
        <path d={rightPath} fill={themeColors.right} />
      </svg>
    </div>
  );
}
