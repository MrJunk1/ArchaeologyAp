import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, Pattern, Rect } from 'react-native-svg';

interface BlueprintGridProps {
  opacity?: number;
  gridSize?: number;
}

export const BlueprintGrid: React.FC<BlueprintGridProps> = ({ 
  opacity = 0.05, 
  gridSize = 40 
}) => {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#1A3A4A"
              strokeWidth="0.5"
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" opacity={opacity} />
      </Svg>
    </View>
  );
};
