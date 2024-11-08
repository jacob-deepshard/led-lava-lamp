import { baseLEDStates } from "./baseEmotions";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cosineSimilarity, getEmbedding } from "./utils";

// Add new type and constant for weighting mechanisms
type WeightingMechanism = 'weighted-mean' | 'normalized' | 'winner-take-all';

const WEIGHTING_MECHANISM: WeightingMechanism = 'weighted-mean';
const DEBUG_MODE = true;

const MoodLights = () => {
  const [time, setTime] = useState(0);
  const [inputText, setInputText] = useState("");
  const [weights, setWeights] = useState(
    Object.fromEntries(
      Object.keys(baseLEDStates).map(key => [key, 1 / Object.keys(baseLEDStates).length])
    )
  );

  // Add totalLEDs state
  const [totalLEDs, setTotalLEDs] = useState(50); // Default to 50 LEDs

  // Update weights based on input text
  const updateWeights = async (text: string) => {
    if (!text.trim()) {
      setWeights(
        Object.fromEntries(
          Object.keys(baseLEDStates).map((key) => [
            key,
            1 / Object.keys(baseLEDStates).length,
          ])
        )
      );
      return;
    }

    try {
      const inputEmbedding = await getEmbedding(text);
      const similarities = Object.entries(baseLEDStates).map(([emotion, data]) => ({
        emotion,
        similarity: cosineSimilarity(inputEmbedding, data.embedding) * data.matchWeight,
      }));

      let finalWeights;
      switch (WEIGHTING_MECHANISM) {
        case 'weighted-mean':
          // Current implementation
          const minSim = Math.min(...similarities.map((s) => s.similarity));
          const shiftedSims = similarities.map((s) => ({
            ...s,
            similarity: s.similarity - minSim + 0.1,
          }));
          const total = shiftedSims.reduce((sum, s) => sum + s.similarity, 0);
          finalWeights = Object.fromEntries(
            shiftedSims.map((s) => [s.emotion, s.similarity / total])
          );
          break;

        case 'normalized':
          // Simple normalization between 0 and 1
          const maxSim = Math.max(...similarities.map((s) => s.similarity));
          const normalizedSims = similarities.map((s) => ({
            ...s,
            similarity: s.similarity / maxSim,
          }));
          finalWeights = Object.fromEntries(
            normalizedSims.map((s) => [s.emotion, s.similarity])
          );
          break;

        case 'winner-take-all':
          const winner = similarities.reduce((prev, current) => 
            prev.similarity > current.similarity ? prev : current
          );
          finalWeights = Object.fromEntries(
            similarities.map((s) => [
              s.emotion,
              s.emotion === winner.emotion ? 1 : 0
            ])
          );
          break;
      }

      if (DEBUG_MODE) {
        console.log('Input:', text);
        console.log('Weighting Mechanism:', WEIGHTING_MECHANISM);
        console.log('Raw Similarities:', similarities);
        console.log('Final Weights:', finalWeights);
      }

      setWeights(finalWeights);
    } catch (error) {
      console.error('Error updating weights:', error);
    }
  };

  // Generate points in a circle filling the window
  const generatePath = () => {
    const points = [];
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    for (let i = 0; i < totalLEDs; i++) {
      const angle = (i / totalLEDs) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }
    return points;
  };

  // Calculate final color by combining all emotion patterns
  const calculateColor = (index: number, t: number) => {
    const colors = Object.entries(baseLEDStates).map(([emotion, data]) => {
      const pattern = data.pattern(index, t, totalLEDs);
      const weight = weights[emotion];
      return {
        r: pattern.r * weight,
        g: pattern.g * weight,
        b: pattern.b * weight
      };
    });

    return {
      r: Math.floor(colors.reduce((sum, c) => sum + c.r, 0)),
      g: Math.floor(colors.reduce((sum, c) => sum + c.g, 0)),
      b: Math.floor(colors.reduce((sum, c) => sum + c.b, 0))
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Handle window resize
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      setDimensions({
        width: innerWidth,
        height: innerHeight,
      });
      // Optionally adjust number of LEDs based on screen size
      const screenSize = Math.min(innerWidth, innerHeight);
      setTotalLEDs(Math.max(30, Math.floor(screenSize / 20))); // Adjust divisor to control LED density
    };
    
    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const points = generatePath();

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Emotion Input */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
        <Input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            updateWeights(e.target.value).catch(console.error);
          }}
          placeholder="How are you feeling?"
          style={{
            width: '300px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid #555',
          }}
        />
      </div>

      {/* SVG Container */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="coreBlur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>

        {/* Glowing Orbs */}
        {points.map((point, i) => {
          const color = calculateColor(i, time);
          return (
            <g key={i}>
              {/* Outer Glow */}
              <circle
                cx={point.x}
                cy={point.y}
                r={60}
                fill={`rgb(${color.r}, ${color.g}, ${color.b})`}
                filter="url(#blur)"
                opacity={0.4}
              />
              {/* Inner Glow */}
              <circle
                cx={point.x}
                cy={point.y}
                r={40}
                fill={`rgb(${color.r}, ${color.g}, ${color.b})`}
                filter="url(#coreBlur)"
                opacity={0.6}
              />
              {/* Core */}
              <circle
                cx={point.x}
                cy={point.y}
                r={16}
                fill={`rgb(${Math.min(255, color.r + 50)}, ${Math.min(255, color.g + 50)}, ${Math.min(255, color.b + 50)})`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MoodLights;