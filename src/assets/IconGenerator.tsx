
import { useEffect, useState } from 'react';

// Updated color to match the new logo's blue
const generateIconSVG = (size: number, color: string = '#0D47A1'): string => {
  const strokeWidth = size / 24;
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size / 5}" fill="${color}" />
      <path 
        d="M${size/6} ${size/3} L${size/3} ${size*2/3} L${size/2} ${size/3} L${size*2/3} ${size*2/3} L${size*5/6} ${size/3}" 
        stroke="white" 
        stroke-width="${strokeWidth}" 
        fill="none" 
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
};

// Funktion zum erneuten Erzeugen und Download der Icons, falls benötigt
export const generateAndDownloadIcons = () => {
  const sizes = [16, 48, 128];
  const color = '#1E40AF'; // neues Blau
  
  sizes.forEach(size => {
    const svg = generateIconSVG(size, color);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `icon${size}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  });
};

// Component für das SVG-Icon im App-Header
interface IconProps {
  size: number;
  color?: string;
}

export const WebhookWhispererIcon = ({ size, color = '#1E40AF' }: IconProps) => {
  const [svgContent, setSvgContent] = useState('');
  
  useEffect(() => {
    setSvgContent(generateIconSVG(size, color));
  }, [size, color]);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
  );
};

