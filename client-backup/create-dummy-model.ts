import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as fs from 'fs/promises';

async function createAndSaveDummyModel() {
  // Define a simple model: a single dense layer
  // Define a more complex model for supplier matching simulation
  // Input: RFQ features (e.g., category_embedding, budget, urgency)
  // Output: Match score for a hypothetical seller
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }), // 3 input features
      tf.layers.dense({ units: 5, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Output a match score between 0 and 1
    ]
  });

  // Compile the model
  model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] });

  // Define the path to save the model
  const modelSavePath = path.join(__dirname, 'model-data', 'dummy-tfjs-model');

  // Create the directory if it doesn't exist
  await fs.mkdir(modelSavePath, { recursive: true });

  // Save the model
  await model.save(`file://${modelSavePath}`);
  console.log(`Dummy TensorFlow.js model saved to: ${modelSavePath}`);
}

createAndSaveDummyModel().catch(console.error);
