import { baseEmotions } from "./baseEmotions";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

const MoodLights = () => {
  const [time, setTime] = useState(0);
  const [inputText, setInputText] = useState("");
  const [weights, setWeights] = useState(
    Object.fromEntries(
      Object.keys(baseEmotions).map(key => [key, 1 / Object.keys(baseEmotions).length])
    )
  );

  // Simple embedding function
  const getEmbedding = (text: string) => {
    // Placeholder embedding
    return Array(8).fill(0).map(() => Math.random() * 2 - 1);
  };

  // Calculate cosine similarity between embeddings
  const cosineSimilarity = (a: number[], b: number[]) => {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  // Update weights based on input text
  const updateWeights = (text: string) => {
    if (!text.trim()) {
      setWeights(Object.fromEntries(
        Object.keys(baseEmotions).map(key => [key, 1 / Object.keys(baseEmotions).length])
      ));
      return;
    }

    const inputEmbedding = getEmbedding(text);
    const similarities = Object.entries(baseEmotions).map(([emotion, data]) => ({
      emotion,
      similarity: cosineSimilarity(inputEmbedding, data.embedding)
    }));

    // Convert similarities to non-negative values and normalize
    const minSim = Math.min(...similarities.map(s => s.similarity));
    const shiftedSims = similarities.map(s => ({
      ...s,
      similarity: s.similarity - minSim + 0.1 // Add small constant to avoid zeros
    }));
    const total = shiftedSims.reduce((sum, s) => sum + s.similarity, 0);

    setWeights(Object.fromEntries(
      shiftedSims.map(s => [s.emotion, s.similarity / total])
    ));
  };

  // Generate points in a circle filling the window
  const generatePath = (numPoints = 50) => {
    const points = [];
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }
    return points;
  };

  // Calculate final color by combining all emotion patterns
  const calculateColor = (index: number, t: number) => {
    const colors = Object.entries(baseEmotions).map(([emotion, data]) => {
      const pattern = data.pattern(index, t);
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
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
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
            updateWeights(e.target.value);
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