import { hslToRgb } from "./utils";

// Add type for pattern function
type PatternFunction = (index: number, t: number, totalLEDs: number) => { r: number, g: number, b: number };

export const baseLEDStates: Record<string, {
  description: string;
  pattern: PatternFunction;
  embedding: number[];
  matchWeight: number;
}> = {
  breathing: {
    description: "Gentle pulsing light that mimics a calming breath",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const breathCycle = (Math.sin(t * 0.05) + 1) / 2; // Slow sine wave between 0 and 1
      const intensity = breathCycle * (Math.sin(index * 0.2) * 0.1 + 0.9); // Slight variation across LEDs
      return {
        r: 100 * intensity,
        g: 180 * intensity,
        b: 220 * intensity
      };
    },
    embedding: [0.2, 0.8, -0.4, 0.7, -0.1, 0.9, 0.5, 0.6],
    matchWeight: 1.0
  },

  rainfall: {
    description: "Cascading blue lights that simulate rainfall",
    pattern: (index, t, totalLEDs) => {
      const speed = 0.3;
      const drop = Math.abs((index - (t * speed) % 10)) < 0.5 ? 1 : 0;
      const intensity = drop * (Math.random() * 0.5 + 0.5); // Randomize brightness for each drop
      return {
        r: 50 * intensity,
        g: 100 * intensity,
        b: 255 * intensity
      };
    },
    embedding: [0.1, 0.5, -0.3, 0.6, 0.0, 0.7, 0.4, 0.5],
    matchWeight: 1.0
  },

  heartbeat: {
    description: "Double-peak pulse resembling a heartbeat",
    pattern: (index, t, totalLEDs) => {
      const heartbeat = (t % 2) / 2; // 2-second heartbeat cycle
      const beat = Math.pow(Math.sin(heartbeat * Math.PI), 8);
      const intensity = beat * (Math.sin(index * 0.5) * 0.1 + 0.9);
      return {
        r: 255 * intensity,
        g: 50 * intensity,
        b: 70 * intensity
      };
    },
    embedding: [0.7, 0.3, 0.5, 0.2, 0.6, 0.4, 0.7, 0.5],
    matchWeight: 1.0
  },

  sunrise: {
    description: "Gradual color shift from red to yellow like a sunrise",
    pattern: (index, t, totalLEDs) => {
      const cycle = (t % 20) / 20; // 20-second full sunrise cycle
      const intensity = Math.sin(cycle * Math.PI);
      return {
        r: (255 * intensity),
        g: (150 * intensity * cycle),
        b: (50 * intensity * (1 - cycle))
      };
    },
    embedding: [0.8, 0.7, 0.3, 0.8, 0.1, 0.6, 0.7, 0.8],
    matchWeight: 1.0
  },

  oceanWaves: {
    description: "Flowing blue-green waves like the ocean",
    pattern: (index, t, totalLEDs) => {
      const wave1 = Math.sin(t * 0.05 + index * 0.1);
      const wave2 = Math.sin(t * 0.03 + index * 0.15);
      const combined = (wave1 + wave2) * 0.25 + 0.5;
      return {
        r: 30 * combined,
        g: 160 * combined,
        b: 200 * combined
      };
    },
    embedding: [0.3, 0.9, -0.5, 0.6, -0.2, 0.8, 0.5, 0.4],
    matchWeight: 1.0
  },

  fireflies: {
    description: "Random twinkling lights like fireflies",
    pattern: (index, t, totalLEDs) => {
      const flicker = Math.random() > 0.98 ? 1 : 0; // 2% chance to flicker
      const intensity = flicker * (Math.random() * 0.5 + 0.5); // Random brightness
      return {
        r: 255 * intensity,
        g: 255 * intensity,
        b: 100 * intensity
      };
    },
    embedding: [0.6, 0.7, 0.1, 0.9, -0.3, 0.5, 0.8, 0.7],
    matchWeight: 1.0
  },

  northernLights: {
    description: "Shimmering, colorful waves like the Aurora Borealis",
    pattern: (index, t, totalLEDs) => {
      const phase = t * 0.02 + index * 0.2;
      const intensity = Math.sin(phase) * 0.5 + 0.5;
      const hue = (Math.sin(t * 0.01 + index * 0.05) * 0.5 + 0.5) * 360; // Hue between 0 and 360
      const rgb = hslToRgb(hue, 1, 0.5 * intensity); // Convert HSL to RGB
      return {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b
      };
    },
    embedding: [0.5, 0.8, 0.2, 0.7, -0.1, 0.6, 0.6, 0.5],
    matchWeight: 1.0
  },

  pulseWave: {
    description: "A smooth pulse of light moving across the LEDs",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const speed = 0.1;
      const position = (t * speed) % totalLEDs;
      const distance = Math.abs(index - position);
      const intensity = Math.exp(-Math.pow(distance, 2) / 20);
      return {
        r: 200 * intensity,
        g: 100 * intensity,
        b: 150 * intensity
      };
    },
    embedding: [0.7, 0.6, 0.5, 0.4, 0.6, 0.3, 0.7, 0.6],
    matchWeight: 1.0
  },

  galaxySwirl: {
    description: "Rotating swirl of lights like a galaxy",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const angle = (index / totalLEDs) * Math.PI * 2 + t * 0.02;
      const intensity = (Math.sin(angle) * 0.5 + 0.5) * (Math.sin(t * 0.05) * 0.5 + 0.5);
      return {
        r: 180 * intensity,
        g: 100 * intensity,
        b: 220 * intensity
      };
    },
    embedding: [0.6, 0.7, 0.4, 0.5, 0.2, 0.6, 0.7, 0.5],
    matchWeight: 1.0
  },

  binaryFlow: {
    description: "Flowing binary patterns representing data streams",
    pattern: (index, t, totalLEDs) => {
      const isOne = Math.floor((index + t * 5) % 2) === 0;
      const intensity = isOne ? 1 : 0;
      return {
        r: 0,
        g: 255 * intensity,
        b: 0
      };
    },
    embedding: [0.4, 0.5, 0.6, 0.7, -0.2, 0.4, 0.6, 0.5],
    matchWeight: 1.0
  },

  joy: {
    description: "Ripples of brightness that spread like laughter",
    pattern: (index: number, t: number, totalLEDs: number) => {
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
    embedding: [0.8, 0.9, 0.7, 0.2, -0.3, -0.4, 0.6, 0.8],
    matchWeight: 0.5
  },

  serenity: {
    description: "Deep, slow breathing pattern in calming tones",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const breathCycle = Math.sin(t * 0.03) * 0.5 + 0.5; // 4-second breath cycle
      const positionInfluence = Math.sin(index * 0.26) * 0.2 + 0.8; // Subtle variation by position
      const intensity = breathCycle * positionInfluence;
      return {
        r: 130 * intensity,
        g: 180 * intensity,
        b: 210 * intensity
      };
    },
    embedding: [0.1, 0.7, -0.6, 0.8, -0.2, 0.9, 0.4, 0.6],
    matchWeight: 0.5
  },

  anxiety: {
    description: "Erratic, tense pulses that interrupt each other",
    pattern: (index: number, t: number, totalLEDs: number) => {
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
    embedding: [-0.4, -0.6, 0.8, -0.7, 0.6, -0.8, -0.3, -0.5],
    matchWeight: 0.5
  },

  love: {
    description: "Warm double-pulse rhythm like a heart beating",
    pattern: (index: number, t: number, totalLEDs: number) => {
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
    embedding: [0.9, 0.7, 0.2, 0.8, -0.1, 0.6, 0.8, 0.9],
    matchWeight: 0.5
  },

  melancholy: {
    description: "Deep blue-purple with occasional brighter moments that fade",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const baseWave = Math.sin(t * 0.03 + index * 0.1) * 0.3 + 0.4;
      const brightMoment = Math.pow(Math.sin(t * 0.047 + index * 0.15), 16); // Rare brighter moments
      const combined = baseWave + brightMoment * 0.3;
      return {
        r: 40 * combined,
        g: 30 * combined,
        b: 180 * combined
      };
    },
    embedding: [-0.7, -0.5, -0.3, 0.4, 0.1, 0.6, -0.4, -0.2],
    matchWeight: 0.5
  },

  energy: {
    description: "Dynamic bursts of power with electric colors",
    pattern: (index: number, t: number, totalLEDs: number) => {
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
    embedding: [0.7, 0.5, 0.8, 0.3, 0.4, 0.2, 0.7, 0.6],
    matchWeight: 0.5
  },

  confidence: {
    description: "Strong, steady golden pulse with purposeful movement",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const steady = Math.sin(t * 0.08 + index * 0.2) * 0.3 + 0.7; // Base steady glow
      const pulse = Math.pow(Math.sin(t * 0.1), 4) * 0.3; // Occasional stronger pulses
      const intensity = steady + pulse;
      return {
        r: 255 * intensity,
        g: 190 * intensity,
        b: 30 * intensity
      };
    },
    embedding: [0.8, 0.6, 0.7, 0.4, 0.5, 0.3, 0.8, 0.7],
    matchWeight: 0.5
  },

  contemplation: {
    description: "Deep indigo waves that slowly merge and separate",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const wave1 = Math.sin(t * 0.02 + index * 0.2);
      const wave2 = Math.sin(t * 0.03 + index * 0.3);
      const interference = (wave1 + wave2) * 0.5;
      return {
        r: 90 * Math.max(0, interference),
        g: 40 * Math.max(0, interference),
        b: 200 * Math.max(0, interference)
      };
    },
    embedding: [0.1, 0.4, -0.2, 0.9, 0.3, 0.7, 0.5, 0.2],
    matchWeight: 0.5
  },

  peace: {
    description: "Gentle flows between soft natural colors",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const flow = Math.sin(t * 0.02 + index * 0.1) * 0.5 + 0.5;
      const secondary = Math.sin(t * 0.015 + index * 0.15) * 0.5 + 0.5;
      return {
        r: 140 * flow * 0.3,
        g: 170 * (flow * 0.7 + secondary * 0.3),
        b: 190 * (secondary * 0.7 + flow * 0.3)
      };
    },
    embedding: [0.2, 0.8, -0.5, 0.9, -0.1, 0.8, 0.6, 0.7],
    matchWeight: 0.5
  },

  wonder: {
    description: "Twinkling stars with occasional shooting stars",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const twinkle = Math.pow(Math.sin(t * 0.1 + index * 0.5), 2);
      const shootingStar = Math.pow(Math.sin(t * 0.05 + index * 0.8), 16);
      const combined = Math.max(twinkle * 0.6, shootingStar);
      return {
        r: 220 * combined,
        g: 220 * combined,
        b: 255 * combined
      };
    },
    embedding: [0.6, 0.7, 0.4, 0.8, -0.2, 0.7, 0.9, 0.8],
    matchWeight: 0.5
  },

  sadness: {
    description: "Slow waves of deep blue with moments of lightness",
    pattern: (index: number, t: number, totalLEDs: number) => {
      const deepWave = Math.sin(t * 0.04 + index * 0.08) * 0.3 + 0.4;
      const lightMoment = Math.pow(Math.sin(t * 0.02 + index * 0.1), 4) * 0.2;
      const combined = deepWave + lightMoment;
      return {
        r: 20 * combined,
        g: 40 * combined,
        b: 160 * combined
      };
    },
    embedding: [-0.6, -0.8, -0.4, 0.3, 0.2, 0.7, -0.5, -0.3],
    matchWeight: 0.5
  }
};
