import React from 'react';
import { IsometricCube } from './IsometricCube';

interface CubeConfig {
  id: string | number;
  size: number;
  x: number;
  y: number;
  theme: 'forest' | 'sage' | 'cream' | 'ivory' | 'mixed-green' | 'mixed-light';
  opacity?: number;
}

interface CubeClusterProps {
  cubes: CubeConfig[];
  className?: string;
  style?: React.CSSProperties;
}

export function CubeCluster({ cubes, className = '', style = {} }: CubeClusterProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      {cubes.map((cube) => (
        <IsometricCube
          key={cube.id}
          size={cube.size}
          x={cube.x}
          y={cube.y}
          theme={cube.theme}
          opacity={cube.opacity ?? 1}
        />
      ))}
    </div>
  );
}
