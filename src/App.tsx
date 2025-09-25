import React, { useRef, useState, useEffect } from 'react';
import '@tensorflow/tfjs';
import SingleBananaImg from '/img/banana.png';
import './App.css';
import { bananafyBox, centralFallbackBox } from './lib/bananafy';
import { loadModel } from './lib/detection';
import { pickRandomFacts } from './data/funfacts';
import { FactCard } from './components/FactCard';

type AnalysisState = 'idle' | 'analyzing' | 'done';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uiState, setUiState] = useState<AnalysisState>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Detecting objects...');
  const [result, setResult] = useState<{
    objectName: string;
    bananas: number;
    confidence: number; 
  } | null>(null);
  const [facts, setFacts] = useState<Array<{ label: string; text: string }>>([]);
  const [model, setModel] = useState<any | null>(null);
  const bananaSpriteRef = useRef<HTMLImageElement | null>(null);

  // Load the detection model once & preload banana sprite
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setProgressLabel('Loading model...');
        const loaded = await loadModel();
        if (mounted) setModel(loaded);
      } catch (e) {
        console.error('Model load failed', e);
      }
    })();
    const sprite = new Image();
    sprite.src = SingleBananaImg;
    sprite.onload = () => {
      bananaSpriteRef.current = sprite;
    };
    return () => { mounted = false; };
  }, []);

  const handleImageReset = () => {
    setUploadedUrl(null);
    setUiState('idle');
    setResult(null);
    setProgress(0);
    setFacts([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageDownload = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.width && canvas.height) {
      const link = document.createElement('a');
      link.download = 'banana-cover-image.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const drawToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const aspectRatio = img.width / img.height;
    const maxW = Math.min(900, window.innerWidth * 0.8);
    const width = Math.min(maxW, img.width);
    const height = Math.round(width / aspectRatio);
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  };

  const runAnalysis = async (imgEl: HTMLImageElement) => {
    if (!model) setProgressLabel('Loading model...');
    setUiState('analyzing');
    setProgress(10);
    setProgressLabel('Detecting object...');
    try {
      const workingCanvas = canvasRef.current;
      const detections = await model?.detect(workingCanvas ?? imgEl, 20, 0.5);
      setProgress(55);
      setProgressLabel('Selecting main object...');
      const banana = detections?.find((d: any) => d.class === 'banana');
      const others = detections?.filter((d: any) => d.class !== 'banana') ?? [];
      const subject = others.sort((a: any, b: any) => boxArea(b.bbox) - boxArea(a.bbox))[0];
      setProgress(80);
      setProgressLabel('Banana-fying object...');
      const objectName = subject?.class ?? banana?.class ?? 'Object';
      const confidence = subject?.score ?? banana?.score ?? 0.9;
      const targetBox = subject?.bbox || banana?.bbox || centralFallbackBox(canvasRef.current);
      const bananasUsed = bananafyBox(targetBox as [number, number, number, number], canvasRef.current, bananaSpriteRef.current);
      const exportCanvas = canvasRef.current;
      if (exportCanvas) {
        try { setUploadedUrl(exportCanvas.toDataURL('image/png')); } catch {}
      }
      setProgress(100);
      setProgressLabel('Finishing up...');
      setResult({ objectName: prettyLabel(objectName), bananas: bananasUsed, confidence });
      setFacts(pickRandomFacts(6));
      setUiState('done');
    } catch (e) {
      console.error('Detection failed', e);
      const fallback = bananafyBox(centralFallbackBox(canvasRef.current), canvasRef.current, bananaSpriteRef.current);
      const exportCanvas = canvasRef.current;
      if (exportCanvas) {
        try { setUploadedUrl(exportCanvas.toDataURL('image/png')); } catch {}
      }
      setResult({ objectName: 'Object', bananas: fallback, confidence: 0.9 });
      setFacts(pickRandomFacts(6));
      setUiState('done');
    }
  };

  const boxArea = (bbox: [number, number, number, number]) => bbox[2] * bbox[3];
  const prettyLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        drawToCanvas(img);
        setUploadedUrl(e.target?.result as string);
        runAnalysis(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div id="main-container" className="min-h-screen w-full flex flex-col items-center bg-[#FFF7E6] font-sans">
      {/* Hero header */}
      <div className="w-full bg-[#FFF6BF] text-[#6B3A00] flex flex-col items-center py-10 shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold">Banana Cover</h1>
  <p className="mt-2 text-center max-w-2xl">Transform any detected object into a bunch of bananas!</p>
      
      </div>

      {/* Controls */}
  <div className="w-full max-w-5xl px-4 mt-8 flex flex-col items-center">
        {/* hidden canvas used for drawing and downloads */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        <div className="flex gap-3 flex-wrap justify-center">
          <label htmlFor="image-upload" className="cursor-pointer bg-[#FFF6BF] hover:bg-[#ffcd38] text-[#6B3A00] font-semibold py-2 px-4 rounded shadow border border-[#FFC107]">
            Upload Image
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} ref={fileInputRef} />
          <button onClick={handleImageReset} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded shadow-sm">
            Clear Image
          </button>
          <button onClick={handleImageDownload} disabled={!uploadedUrl} className={`font-medium py-2 px-4 rounded shadow-sm ${uploadedUrl ? 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Download Image
          </button>
        </div>

        {/* Content area */}
        <div className="w-full mt-6">
          {uiState === 'idle' && (
            <div className="mx-auto max-w-4xl border-2 border-dashed border-[#FFC107] bg-[#FFF9E8] rounded-xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFE082] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V4" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 9l5-5 5 5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20h16" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#6B3A00]">Upload an image to cover in banana's</h3>
              <p className="text-gray-600 mt-2">We will detect the main object and rebuild it out of banana sprites. 🍌</p>
            </div>
          )}

          {uiState === 'analyzing' && (
            <div className="flex flex-col items-center gap-6">
              {uploadedUrl && (
                <img src={uploadedUrl} alt="uploaded" className="max-h-[420px] rounded-lg shadow border bg-white" />
              )}
              <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6">
                <h3 className="text-2xl font-semibold text-[#A36500] flex items-center gap-2">🍌 Banana-fication In Progress</h3>
                <p className="text-gray-600 mt-4">Analyzing your image...</p>
                <div className="mt-4 w-full h-2 rounded bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#AEB0B5]" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-3">{progressLabel}</p>
              </div>
            </div>
          )}

          {uiState === 'done' && result && (
            <div className="flex flex-col items-center gap-6">
              {uploadedUrl && (
                <img src={uploadedUrl} alt="uploaded" className="max-h-[420px] rounded-lg shadow border bg-white" />
              )}
              <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6">
                <h3 className="text-2xl font-semibold text-[#A36500]">🍌 Banana-Fication Complete</h3>
                <div className="mt-5 rounded-xl bg-[#FFF6BF] p-6 text-center">
                  <div className="flex items-center justify-center gap-4 text-[#A36500]">
                    <div className="w-12 h-12 rounded-lg bg-white grid place-items-center shadow">🍌</div>
                    <span className="text-4xl font-bold">{result.bananas}</span>
                  </div>
                  <p className="mt-4 text-xl text-[#6B3A00]">Your {result.objectName} has been banana-fied!</p>
                  <p className="mt-1 text-3xl md:text-4xl font-bold text-[#6B3A00]">Made of {result.bananas} bananas 🍌</p>
                  <div className="inline-block mt-4 text-xs bg-[#E8EEFF] text-[#1F3A93] px-3 py-1 rounded-full shadow-sm">
                    {Math.round(result.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              {/* Banana Fun Facts section */}
              <div className="w-full max-w-5xl">
                <h3 className="text-center text-2xl font-semibold text-[#A36500] mb-2">🍌 Banana Fun Facts!</h3>
                <p className="text-center text-gray-600 mb-6">While you're here, enjoy some interesting banana trivia!</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {facts.map((f, idx) => (
                    <FactCard key={`${f.label}-${idx}`} label={f.label} text={f.text} />
                  ))}
                </div>

                <div className="mt-8 bg-[#FFF6BF] border border-[#FFE082] text-[#6B3A00] rounded-xl p-6 text-center">
                  <h4 className="font-semibold text-lg">🎯 Banana Cover Challenge!</h4>
                  <p className="mt-2">Try covering different objects around your house with bananas, And see what object fits the most bananas!</p>
                  <p className="mt-2 text-sm">Remember: The average banana is 18cm long</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full max-w-5xl text-center text-[#6B3A00] mt-12 mb-10">
          <p className="text-sm">Made with 🍌 and ❤️</p>
          <p className="text-xs text-gray-600 mt-2">Disclaimer: Results are simulated for entertainment purposes. For actual measurements, please use a real ruler!</p>
        </div>
      </div>
    </div>
  );
}

export default App;

// (Old in-file helpers removed in favor of lib utilities)