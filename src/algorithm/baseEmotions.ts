export const baseEmotions = {
  joy: {
    description: "Ripples of brightness that spread like laughter",
    pattern: (index, t) => {
      const baseWave = Math.sin(t * 0.1);
      const ripple1 = Math.sin(t * 0.15 + index * 0.4);
      const ripple2 = Math.sin(t * 0.15 - index * 0.4);
      const combined = Math.max(0, (ripple1 + ripple2) * 0.5 + baseWave * 0.3);
      return {
        r: 255 * combined,
        g: 220 * combined,
        b: 100 * combined
      };
    },
    embedding: [0.8, 0.9, 0.7, 0.2, -0.3, -0.4, 0.6, 0.8]
  },

  serenity: {
    description: "Deep, slow breathing pattern in calming tones",
    pattern: (index, t) => {
      const breathCycle = Math.sin(t * 0.03) * 0.5 + 0.5; // 4-second breath cycle
      const positionInfluence = Math.sin(index * 0.26) * 0.2 + 0.8; // Subtle variation by position
      const intensity = breathCycle * positionInfluence;
      return {
        r: 130 * intensity,
        g: 180 * intensity,
        b: 210 * intensity
      };
    },
    embedding: [0.1, 0.7, -0.6, 0.8, -0.2, 0.9, 0.4, 0.6]
  },

  anxiety: {
    description: "Erratic, tense pulses that interrupt each other",
    pattern: (index, t) => {
      const rapid = Math.sin(t * 0.4 + index * 0.5);
      const interrupt = Math.sin(t * 0.63 + index * 0.7);
      const jitter = Math.sin(t * 1.1 + index * 0.3);
      const combined = (rapid * 0.6 + interrupt * 0.3 + jitter * 0.1);
      return {
        r: 180 * Math.max(0, combined),
        g: 200 * Math.max(0, combined),
        b: Math.abs(combined) * 30 // Slight blue tinge in the darker moments
      };
    },
    embedding: [-0.4, -0.6, 0.8, -0.7, 0.6, -0.8, -0.3, -0.5]
  },

  love: {
    description: "Warm double-pulse rhythm like a heart beating",
    pattern: (index, t) => {
      const heartbeat = t * 0.1;
      // Create double-bump heartbeat waveform
      const beat = Math.pow(Math.sin(heartbeat), 8) + Math.pow(Math.sin(heartbeat + 0.2), 8) * 0.6;
      const spread = Math.sin(index * 0.3) * 0.3 + 0.7; // Position-based intensity
      const intensity = beat * spread;
      return {
        r: 255 * intensity,
        g: 60 * intensity,
        b: 130 * intensity
      };
    },
    embedding: [0.9, 0.7, 0.2, 0.8, -0.1, 0.6, 0.8, 0.9]
  },

  melancholy: {
    description: "Deep blue-purple with occasional brighter moments that fade",
    pattern: (index, t) => {
      const baseWave = Math.sin(t * 0.03 + index * 0.1) * 0.3 + 0.4;
      const brightMoment = Math.pow(Math.sin(t * 0.047 + index * 0.15), 16); // Rare brighter moments
      const combined = baseWave + brightMoment * 0.3;
      return {
        r: 40 * combined,
        g: 30 * combined,
        b: 180 * combined
      };
    },
    embedding: [-0.7, -0.5, -0.3, 0.4, 0.1, 0.6, -0.4, -0.2]
  },

  energy: {
    description: "Dynamic bursts of power with electric colors",
    pattern: (index, t) => {
      const burst = Math.pow(Math.sin(t * 0.2 + index * 0.4), 2);
      const flow = Math.sin(t * 0.3 + index * 0.5) * 0.5 + 0.5;
      const spark = Math.pow(Math.sin(t * 1.5 + index * 0.2), 8) * 0.3; // Occasional sparks
      const combined = Math.max(0, burst * flow + spark);
      return {
        r: 220 * combined,
        g: 240 * combined,
        b: 255 * combined
      };
    },
    embedding: [0.7, 0.5, 0.8, 0.3, 0.4, 0.2, 0.7, 0.6]
  },

  confidence: {
    description: "Strong, steady golden pulse with purposeful movement",
    pattern: (index, t) => {
      const steady = Math.sin(t * 0.08 + index * 0.2) * 0.3 + 0.7; // Base steady glow
      const pulse = Math.pow(Math.sin(t * 0.1), 4) * 0.3; // Occasional stronger pulses
      const intensity = steady + pulse;
      return {
        r: 255 * intensity,
        g: 190 * intensity,
        b: 30 * intensity
      };
    },
    embedding: [0.8, 0.6, 0.7, 0.4, 0.5, 0.3, 0.8, 0.7]
  },

  contemplation: {
    description: "Deep indigo waves that slowly merge and separate",
    pattern: (index, t) => {
      const wave1 = Math.sin(t * 0.02 + index * 0.2);
      const wave2 = Math.sin(t * 0.03 + index * 0.3);
      const interference = (wave1 + wave2) * 0.5;
      return {
        r: 90 * Math.max(0, interference),
        g: 40 * Math.max(0, interference),
        b: 200 * Math.max(0, interference)
      };
    },
    embedding: [0.1, 0.4, -0.2, 0.9, 0.3, 0.7, 0.5, 0.2]
  },

  peace: {
    description: "Gentle flows between soft natural colors",
    pattern: (index, t) => {
      const flow = Math.sin(t * 0.02 + index * 0.1) * 0.5 + 0.5;
      const secondary = Math.sin(t * 0.015 + index * 0.15) * 0.5 + 0.5;
      return {
        r: 140 * flow * 0.3,
        g: 170 * (flow * 0.7 + secondary * 0.3),
        b: 190 * (secondary * 0.7 + flow * 0.3)
      };
    },
    embedding: [0.2, 0.8, -0.5, 0.9, -0.1, 0.8, 0.6, 0.7]
  },

  wonder: {
    description: "Twinkling stars with occasional shooting stars",
    pattern: (index, t) => {
      const twinkle = Math.pow(Math.sin(t * 0.1 + index * 0.5), 2);
      const shootingStar = Math.pow(Math.sin(t * 0.05 + index * 0.8), 16);
      const combined = Math.max(twinkle * 0.6, shootingStar);
      return {
        r: 220 * combined,
        g: 220 * combined,
        b: 255 * combined
      };
    },
    embedding: [0.6, 0.7, 0.4, 0.8, -0.2, 0.7, 0.9, 0.8]
  },

  sadness: {
    description: "Slow waves of deep blue with moments of lightness",
    pattern: (index, t) => {
      const deepWave = Math.sin(t * 0.04 + index * 0.08) * 0.3 + 0.4;
      const lightMoment = Math.pow(Math.sin(t * 0.02 + index * 0.1), 4) * 0.2;
      const combined = deepWave + lightMoment;
      return {
        r: 20 * combined,
        g: 40 * combined,
        b: 160 * combined
      };
    },
    embedding: [-0.6, -0.8, -0.4, 0.3, 0.2, 0.7, -0.5, -0.3]
  }
};
