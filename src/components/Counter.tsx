import React, { useEffect, useRef } from 'react';

interface CounterProps {
  value: number;
  fontSize?: number;
  gap?: number;
  textColor?: string;
  fontWeight?: string | number;
  borderRadius?: number;
  horizontalPadding?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientHeight?: number;
  places?: number[];
  containerStyle?: React.CSSProperties;
  spinSpeed?: number; // Add this prop to control spinning speed (in ms)
}

const Counter: React.FC<CounterProps> = ({
  value,
  fontSize = 80,
  gap = 2,
  textColor = '#ffffff',
  fontWeight = 'bold',
  borderRadius = 6,
  horizontalPadding = 8,
  gradientFrom = '#15191f',
  gradientTo = 'transparent',
  gradientHeight = 15,
  places = [1],
  containerStyle = {},
  spinSpeed = 50, // Default to 50ms for faster spinning
}) => {
  const [displayValue, setDisplayValue] = React.useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (value !== displayValue) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(value);
      }, spinSpeed); // Use the spinSpeed prop
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, displayValue, spinSpeed]); // Add spinSpeed to dependencies

  const digitHeight = fontSize * 1.2;
  const digitWidth = fontSize * 1;

  const containerBaseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${gap}px`,
    ...containerStyle,
  };

  const getDigitStyle = (): React.CSSProperties => ({
    position: 'relative',
    width: `${digitWidth}px`,
    height: `${digitHeight}px`,
    fontSize: `${fontSize}px`,
    fontWeight,
    color: textColor,
    textAlign: 'center',
    lineHeight: `${digitHeight}px`,
    backgroundColor: '#0a0c10',
    borderRadius: `${borderRadius}px`,
    padding: `0 ${horizontalPadding}px`,
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  });

  const gradientStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: `${gradientHeight}px`,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
    pointerEvents: 'none',
    zIndex: 1,
  };

  return (
    <div style={containerBaseStyle}>
      {places.map((_, index) => {
        const digit = Math.floor(displayValue / Math.pow(10, places.length - 1 - index)) % 10;
        
        return (
          <div key={index} style={getDigitStyle()}>
            <div style={gradientStyle} />
            {digit}
          </div>
        );
      })}
    </div>
  );
};

export default Counter;