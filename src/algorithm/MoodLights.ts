import { baseLEDStates, initializeEmbeddings } from "./baseEmotions";
import { cosineSimilarity, getEmbedding, DEV_MODE } from "./utils";

// Add new type and constant for weighting mechanisms
type WeightingMechanism = 'weighted-mean' | 'normalized' | 'winner-take-all';

const WEIGHTING_MECHANISM: WeightingMechanism = 'weighted-mean';

// Add this near the top of the file, after imports
const INPUT_STYLES = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '3rem',
  textAlign: 'center' as const,
  width: 'auto',
  padding: '20px',
  caretColor: '#fff', // Make cursor white
  caretWidth: '5px',  // Thick caret
  outline: 'none',    // Remove focus outline
} as const;

// Add new types for LED layouts
type Point = { x: number, y: number };
type LayoutGenerator = (totalLEDs: number, dimensions: { width: number, height: number }) => Point[];

// Add layout configurations
const layouts: Record<string, LayoutGenerator> = {
  circle: (totalLEDs, { width, height }) => {
    const points = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    for (let i = 0; i < totalLEDs; i++) {
      const angle = (i / totalLEDs) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return points;
  },

  line: (totalLEDs, { width, height }) => {
    const points = [];
    const startX = width * 0.1;
    const endX = width * 0.9;
    const y = height / 2;

    for (let i = 0; i < totalLEDs; i++) {
      points.push({
        x: startX + (endX - startX) * (i / (totalLEDs - 1)),
        y
      });
    }
    return points;
  },

  concentricCircles: (totalLEDs, { width, height }) => {
    const points = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 3;
    const circles = 4;
    const ledsPerCircle = Math.floor(totalLEDs / circles);

    for (let c = 0; c < circles; c++) {
      const radius = maxRadius * ((c + 1) / circles);
      for (let i = 0; i < ledsPerCircle; i++) {
        const angle = (i / ledsPerCircle) * Math.PI * 2;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
    }
    return points;
  }
};

// Add layout type and state
type LayoutType = keyof typeof layouts;
const DEFAULT_LAYOUT: LayoutType = 'circle';

export class MoodLights {
  private dimensions: { width: number; height: number };
  private time: number = 0;
  private weights: Record<string, number>;
  private totalLEDs: number;
  private layoutType: LayoutType = DEFAULT_LAYOUT;
  private animationFrame: number | null = null;
  private svg: SVGElement;
  private input: HTMLInputElement;

  constructor() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.totalLEDs = 50;
    this.weights = Object.fromEntries(
      Object.keys(baseLEDStates).map(key => [key, 1 / Object.keys(baseLEDStates).length])
    );

    this.svg = document.getElementById('lightCanvas') as SVGElement;
    this.input = document.getElementById('moodInput') as HTMLInputElement;

    this.initialize();
  }

  private async initialize() {
    await initializeEmbeddings();
    
    // Apply INPUT_STYLES to the input element
    Object.assign(this.input.style, INPUT_STYLES);
    
    // Setup event listeners
    window.addEventListener('resize', this.handleResize.bind(this));
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('blur', () => this.input.focus());

    // Keep input focused
    this.input.focus();

    // Start animation
    this.startAnimation();
    
    // Initial render
    this.handleResize();
    this.render();
  }

  private handleResize() {
    const { innerWidth, innerHeight } = window;
    this.dimensions = { width: innerWidth, height: innerHeight };
    const screenSize = Math.min(innerWidth, innerHeight);
    this.totalLEDs = Math.max(30, Math.floor(screenSize / 20));
    
    // Update SVG dimensions
    this.svg.setAttribute('width', String(innerWidth));
    this.svg.setAttribute('height', String(innerHeight));
    
    this.render();
  }

  private async handleInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    await this.updateWeights(text);
  }

  private async updateWeights(text: string) {
    if (!text.trim()) {
      this.weights = Object.fromEntries(
        Object.keys(baseLEDStates).map((key) => [
          key,
          1 / Object.keys(baseLEDStates).length,
        ])
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

      if (DEV_MODE) {
        console.log('Input:', text);
        console.log('Weighting Mechanism:', WEIGHTING_MECHANISM);
        console.log('Raw Similarities:', similarities);
        console.log('Final Weights:', finalWeights);
      }

      this.weights = finalWeights;
    } catch (error) {
      console.error('Error updating weights:', error);
    }
  }

  private generatePoints() {
    return layouts[this.layoutType](this.totalLEDs, this.dimensions);
  }

  private calculateColor(index: number, t: number) {
    const colors = Object.entries(baseLEDStates).map(([emotion, data]) => {
      const pattern = data.pattern(index, t, this.totalLEDs);
      const weight = this.weights[emotion];
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
  }

  private startAnimation() {
    const animate = () => {
      this.time++;
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private render() {
    const points = this.generatePoints();

    // Instead of resetting the entire innerHTML, select or create a group for the points
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <filter id="blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id="coreBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      `;
      this.svg.appendChild(defs);
    }

    // Select or create a group to hold the points
    let pointsGroup = this.svg.querySelector('#pointsGroup') as SVGGElement;
    if (!pointsGroup) {
      pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      pointsGroup.setAttribute('id', 'pointsGroup');
      this.svg.appendChild(pointsGroup);
    } else {
      // Clear existing points
      while (pointsGroup.firstChild) {
        pointsGroup.removeChild(pointsGroup.firstChild);
      }
    }

    // Render points
    points.forEach((point, i) => {
      const color = this.calculateColor(i, this.time);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Outer Glow
      const outerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      outerGlow.setAttribute('cx', String(point.x));
      outerGlow.setAttribute('cy', String(point.y));
      outerGlow.setAttribute('r', '60');
      outerGlow.setAttribute('fill', `rgb(${color.r}, ${color.g}, ${color.b})`);
      outerGlow.setAttribute('filter', 'url(#blur)');
      outerGlow.setAttribute('opacity', '0.4');
      
      // Inner Glow
      const innerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      innerGlow.setAttribute('cx', String(point.x));
      innerGlow.setAttribute('cy', String(point.y));
      innerGlow.setAttribute('r', '40');
      innerGlow.setAttribute('fill', `rgb(${color.r}, ${color.g}, ${color.b})`);
      innerGlow.setAttribute('filter', 'url(#coreBlur)');
      innerGlow.setAttribute('opacity', '0.6');
      
      // Core
      const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      core.setAttribute('cx', String(point.x));
      core.setAttribute('cy', String(point.y));
      core.setAttribute('r', '16');
      core.setAttribute('fill', `rgb(${Math.min(255, color.r + 50)}, ${Math.min(255, color.g + 50)}, ${Math.min(255, color.b + 50)})`);
      
      group.appendChild(outerGlow);
      group.appendChild(innerGlow);
      group.appendChild(core);
      pointsGroup.appendChild(group);
    });
  }

  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}