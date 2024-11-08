import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Initialize TensorFlow.js
await tf.ready();

// Store the model instance
let modelInstance: use.UniversalSentenceEncoder | null = null;

// Add development flag at the top
export const DEV_MODE = true; // Set this to false for production

// Initialize the model
export const initializeModel = async () => {
  if (DEV_MODE) {
    console.log('DEV MODE: Skipping model initialization');
    return null;
  }

  if (!modelInstance) {
    await tf.ready();
    modelInstance = await use.load();
  }
  return modelInstance;
};

export const getEmbedding = async (text: string) => {
  console.log('Getting embedding for text:', text);
  
  // Add development mode shortcut
  if (DEV_MODE) {
    console.log('DEV MODE: Returning random embedding vector');
    return Array.from({ length: 512 }, () => Math.random() - 0.5);
  }
  
  if (!modelInstance) {
    console.log('Initializing model...');
    await initializeModel();
  }
  
  // Generate embeddings
  console.log('Generating embeddings...');
  const embeddings = await modelInstance!.embed([text]);
  
  // Convert to array and dispose the tensor
  console.log('Converting embeddings to array...');
  const embeddingArray = Array.from(await embeddings.data());
  console.log('Embedding array:', embeddingArray);
  embeddings.dispose();
  
  return embeddingArray;
};

// Calculate cosine similarity between embeddings
export const cosineSimilarity = (a: number[], b: number[]) => {
  console.log('Calculating cosine similarity between vectors of length:', {
    vectorALength: a.length,
    vectorBLength: b.length
  });

  // Use the shorter length for calculations
  const length = Math.min(a.length, b.length);
  const truncatedA = a.slice(0, length);
  const truncatedB = b.slice(0, length);

  console.log('Using truncated vectors of length:', length);

  const dotProduct = truncatedA.reduce((sum, ai, i) => sum + ai * truncatedB[i], 0);
  console.log('Dot product:', dotProduct);

  const magnitudeA = Math.sqrt(truncatedA.reduce((sum, ai) => sum + ai * ai, 0));
  console.log('Magnitude A:', magnitudeA);

  const magnitudeB = Math.sqrt(truncatedB.reduce((sum, bi) => sum + bi * bi, 0));
  console.log('Magnitude B:', magnitudeB);

  const similarity = dotProduct / (magnitudeA * magnitudeB);
  console.log('Final similarity:', similarity);

  return similarity;
};

export const hslToRgb = (h: number, s: number, l: number) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    return { r: m + c, g: m + x, b: m };
}
