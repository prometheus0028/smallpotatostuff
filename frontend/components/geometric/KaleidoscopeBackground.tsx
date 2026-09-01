import React from 'react';
import { CubeCluster } from './CubeCluster';

interface KaleidoscopeBackgroundProps {
  variant: 'dashboard' | 'hero';
}

export function KaleidoscopeBackground({ variant }: KaleidoscopeBackgroundProps) {
  if (variant === 'dashboard') {
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        
        {/* MASSIVE RIGHT WALL CLUSTER */}
        <CubeCluster
          className="absolute"
          style={{ right: '-5%', top: '-10%', bottom: '-10%', width: '400px' }}
          cubes={[
            // Base massive background cubes
            { id: 'dr-bg1', size: 380, x: 200, y: 100, theme: 'mixed-light', opacity: 0.4 },
            { id: 'dr-bg2', size: 400, x: 150, y: 500, theme: 'ivory', opacity: 0.6 },
            
            // Large structural cubes
            { id: 'dr-l1', size: 280, x: 120, y: -50, theme: 'mixed-green', opacity: 0.9 },
            { id: 'dr-l2', size: 240, x: 60, y: 180, theme: 'forest', opacity: 0.8 },
            { id: 'dr-l3', size: 260, x: 160, y: 350, theme: 'cream', opacity: 1 },
            { id: 'dr-l4', size: 220, x: 80, y: 550, theme: 'sage', opacity: 0.9 },
            { id: 'dr-l5', size: 250, x: 180, y: 700, theme: 'mixed-green', opacity: 0.85 },
            
            // Medium connecting cubes
            { id: 'dr-m1', size: 160, x: 0, y: 120, theme: 'ivory', opacity: 1 },
            { id: 'dr-m2', size: 140, x: 220, y: 280, theme: 'forest', opacity: 0.7 },
            { id: 'dr-m3', size: 150, x: -40, y: 400, theme: 'mixed-light', opacity: 0.9 },
            { id: 'dr-m4', size: 130, x: 100, y: 480, theme: 'ivory', opacity: 0.8 },
            { id: 'dr-m5', size: 180, x: 240, y: 600, theme: 'cream', opacity: 1 },
            { id: 'dr-m6', size: 140, x: -20, y: 700, theme: 'sage', opacity: 0.7 },
            
            // Small detail cubes
            { id: 'dr-s1', size: 90, x: -60, y: 220, theme: 'sage', opacity: 0.8 },
            { id: 'dr-s2', size: 80, x: 280, y: 150, theme: 'mixed-green', opacity: 0.6 },
            { id: 'dr-s3', size: 100, x: -80, y: 550, theme: 'forest', opacity: 0.5 },
            { id: 'dr-s4', size: 70, x: 150, y: 420, theme: 'ivory', opacity: 0.9 },
            { id: 'dr-s5', size: 85, x: -40, y: 820, theme: 'mixed-light', opacity: 0.8 },
          ]}
        />
        
        {/* DENSE BOTTOM LEFT CLUSTER */}
        <CubeCluster
          className="absolute"
          style={{ left: '-5%', bottom: '-10%', width: '400px', height: '400px' }}
          cubes={[
            { id: 'dbl-l1', size: 300, x: -50, y: 100, theme: 'mixed-green', opacity: 0.7 },
            { id: 'dbl-l2', size: 240, x: 100, y: 200, theme: 'cream', opacity: 0.9 },
            { id: 'dbl-m1', size: 180, x: 40, y: 40, theme: 'sage', opacity: 0.8 },
            { id: 'dbl-m2', size: 150, x: 200, y: 150, theme: 'forest', opacity: 0.6 },
            { id: 'dbl-m3', size: 160, x: -20, y: 280, theme: 'ivory', opacity: 1 },
            { id: 'dbl-s1', size: 100, x: 160, y: 80, theme: 'mixed-light', opacity: 0.9 },
            { id: 'dbl-s2', size: 80, x: 280, y: 250, theme: 'sage', opacity: 0.5 },
            { id: 'dbl-s3', size: 90, x: 80, y: 320, theme: 'forest', opacity: 0.7 },
          ]}
        />

        {/* TOP LEFT ACCENT */}
        <CubeCluster
          className="absolute"
          style={{ left: '-2%', top: '-5%' }}
          cubes={[
            { id: 'dtl-1', size: 200, x: 0, y: -50, theme: 'ivory', opacity: 0.6 },
            { id: 'dtl-2', size: 140, x: 100, y: 40, theme: 'sage', opacity: 0.4 },
            { id: 'dtl-3', size: 80, x: 160, y: -20, theme: 'forest', opacity: 0.3 },
          ]}
        />
      </div>
    );
  }

  // Hero Variant
  return (
    <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* HERO MASSIVE RIGHT SIDE KALEIDOSCOPE */}
      <CubeCluster
        className="absolute"
        style={{ right: '-5%', top: '-5%', bottom: '-5%', width: '600px' }}
        cubes={[
          // Massive backdrop
          { id: 'hr-bg1', size: 500, x: 200, y: 100, theme: 'mixed-light', opacity: 0.4 },
          { id: 'hr-bg2', size: 450, x: 300, y: 400, theme: 'ivory', opacity: 0.5 },
          
          // Large structural
          { id: 'hr-l1', size: 320, x: 100, y: 50, theme: 'mixed-green', opacity: 0.95 },
          { id: 'hr-l2', size: 280, x: -20, y: 250, theme: 'cream', opacity: 1 },
          { id: 'hr-l3', size: 340, x: 180, y: 400, theme: 'forest', opacity: 0.85 },
          { id: 'hr-l4', size: 260, x: 60, y: 600, theme: 'sage', opacity: 0.9 },
          
          // Medium connectors
          { id: 'hr-m1', size: 180, x: -100, y: 150, theme: 'ivory', opacity: 0.9 },
          { id: 'hr-m2', size: 200, x: 300, y: -20, theme: 'sage', opacity: 0.7 },
          { id: 'hr-m3', size: 160, x: 140, y: 280, theme: 'mixed-light', opacity: 0.8 },
          { id: 'hr-m4', size: 220, x: -60, y: 480, theme: 'mixed-green', opacity: 0.95 },
          { id: 'hr-m5', size: 190, x: 280, y: 650, theme: 'cream', opacity: 1 },
          
          // Small details
          { id: 'hr-s1', size: 120, x: -150, y: 300, theme: 'forest', opacity: 0.6 },
          { id: 'hr-s2', size: 100, x: 40, y: 120, theme: 'sage', opacity: 0.8 },
          { id: 'hr-s3', size: 140, x: 220, y: 550, theme: 'ivory', opacity: 0.9 },
          { id: 'hr-s4', size: 90, x: -120, y: 650, theme: 'mixed-light', opacity: 0.7 },
          { id: 'hr-s5', size: 110, x: 350, y: 250, theme: 'forest', opacity: 0.5 },
        ]}
      />
      
      {/* HERO DENSE LEFT ACCENT */}
      <CubeCluster
        className="absolute"
        style={{ left: '-10%', bottom: '-10%', width: '300px' }}
        cubes={[
          { id: 'hl-1', size: 260, x: -50, y: 100, theme: 'mixed-green', opacity: 0.3 },
          { id: 'hl-2', size: 180, x: 80, y: 180, theme: 'cream', opacity: 0.4 },
          { id: 'hl-3', size: 140, x: 20, y: 50, theme: 'sage', opacity: 0.5 },
          { id: 'hl-4', size: 100, x: 160, y: 120, theme: 'forest', opacity: 0.2 },
        ]}
      />
    </div>
  );
}
