import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export type Detection = {
  class: string;
  score: number;
  bbox: [number, number, number, number];
};

let cachedModel: cocoSsd.ObjectDetection | null = null;

export async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (cachedModel) return cachedModel;
  cachedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  return cachedModel;
}

export async function detectMainObject(
  image: HTMLImageElement
): Promise<Detection | null> {
  const model = await loadModel();
  const predictions = (await model.detect(image)) as Detection[];
  if (!predictions.length) return null;
  predictions.sort((a, b) => b.score - a.score);
  const top = predictions[0];
  return top || null;
}
