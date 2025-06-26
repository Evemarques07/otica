// src/services/measurementService.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as FileSystem from 'expo-file-system';
import jpeg from 'jpeg-js';

let model;

export const initializeTensorFlow = async () => {
  if (model) return;

  console.log("Inicializando TensorFlow e carregando modelo...");
  await tf.ready();
  model = await faceLandmarksDetection.load(
  faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
  { maxFaces: 1, runtime: 'tfjs' }
);
  console.log("Modelo carregado com sucesso!");
};

const imageToTensor = async (imageUri) => {
  const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
  const raw = new Uint8Array(imgBuffer);
  const { width, height, data } = jpeg.decode(raw, { useTArray: true });

  const buffer = new Uint8Array(width * height * 3);
  let offset = 0;
  for (let i = 0; i < data.length; i += 4) {
    buffer[offset++] = data[i];     // R
    buffer[offset++] = data[i + 1]; // G
    buffer[offset++] = data[i + 2]; // B
  }

  return tf.tensor3d(buffer, [height, width, 3]);
};

export const processImage = async (imageUri, pixelsPerMm) => {
  try {
    await initializeTensorFlow();

    const imageTensor = await imageToTensor(imageUri);
    const predictions = await model.estimateFaces({ input: imageTensor });

    if (!predictions || predictions.length === 0) {
      throw new Error("Nenhum rosto detectado.");
    }

    const keypoints = predictions[0].keypoints;
    const pLeft = keypoints[473];
    const pRight = keypoints[468];

    if (!pLeft || !pRight) {
      throw new Error("Não foi possível encontrar os pontos das pupilas.");
    }

    const pdInPixels = Math.sqrt(
      Math.pow(pRight.x - pLeft.x, 2) + Math.pow(pRight.y - pLeft.y, 2)
    );

    const pupillaryDistance = pdInPixels / pixelsPerMm;

    tf.dispose(imageTensor);
    tf.disposeVariables();

    return {
      pupillaryDistance: pupillaryDistance.toFixed(2),
    };

  } catch (error) {
    console.error("Erro no processamento da imagem:", error);
    return { error: error.message };
  }
};
