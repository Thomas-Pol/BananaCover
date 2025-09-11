import React, { useRef } from 'react';
import SingleBananaImg from '/img/banana.png';
import MultipleBananasImg from '/img/multiple_bananas.png';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
//   const canvasContainer = document.getElementById('canvas-container');
  
//   const canvasWidthStart = canvasContainer?.scrollWidth || '80%';
//   const canvasHeightStart = canvasContainer?.scrollHeight || '60%';
  
// const canvasRef.current.width = canvasWidthStart as number;
// const canvasRef.current.height = canvasHeightStart as number;


  const handleImageReset = () => {
    const canvas = canvasRef.current;
    
    if (canvas) {

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleImageDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'canvas_image.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (!file) return;
    const reader = new FileReader();
    console.log(reader);
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        console.log('Image dimensions:', img.width, 'x', img.height);
        
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            
            const aspectRatio = img.width / img.height;
            
            if (img.width < img.height) {
              
              canvas.width = Math.min(400, img.width);
              canvas.height = canvas.width / aspectRatio;
            } else {
            
                canvas.width = img.width;
                canvas.height = img.height;
              
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Banana rain config
  const BANANA_COUNT = 10;
  let randomImg = 0; 
  const [bananas, setBananas] = React.useState(() =>
    Array.from({ length: BANANA_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      randomImg: Math.random(),
      srcImg: randomImg < 0.95 ? SingleBananaImg : MultipleBananasImg,
      speedY: 0.5 + Math.random(),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size: 40 + Math.random() * 60,
    }))
  );

  

  React.useEffect(() => {
    const animate = () => {
      setBananas((prev) =>
        prev.map((b) => {
          let newY = b.y + b.speedY;
          let newX = b.x + b.speedX;
          let newRot = b.rotation + b.rotationSpeed;
          let randomNewImg = Math.random();
          let newSrcImg = b.srcImg;
          if (newY > window.innerHeight) {
            newY = -b.size;
            newX = Math.random() * window.innerWidth;
            newRot = Math.random() * 360;
            newSrcImg = randomNewImg < 0.95 ? SingleBananaImg : MultipleBananasImg;
          }
          if (newX < -b.size) newX = window.innerWidth;
          if (newX > window.innerWidth) newX = -b.size;
          return {
            ...b,
            y: newY,
            x: newX,
            srcImg: newSrcImg,
            rotation: newRot,
          };
        })
      );
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div id="main-container" className="w-screen p-10 flex flex-col items-center justify-center">
    <div className="fixed w-screen h-screen bg-[#EA454C] -z-2 top-0 left-0">
      {bananas.map((b, i) => (
        <img
          key={i}
          src={b.srcImg}
          alt="banana"
          className="banana-rain"
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.size,
            transform: `rotate(${b.rotation}deg)`,
            pointerEvents: 'none',
            zIndex: -1,
            userSelect: 'none',
          }}
        />
      ))}
      </div>
      <div className="w-full flex flex-col items-center justify-center z-10 bg-white">
          <div className="w-full min-h-screen flex flex-col justify-center items-center pt-10">
            <h1 className="pb-10 text-4xl font-sans font-bold">Banana For Scale</h1>
            <div className="pb-10 w-full flex justify-center gap-5 font-sans">
              <label htmlFor="image-upload" className="cursor-pointer bg-[#EA454C] hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded">
                  Upload Image
              </label>
              <input id="image-upload" className="hidden" type="file" accept="image/*" name="image" onChange={handleImageUpload} />
              <input id="image-reset" type="submit" className="bg-[#EA454C] hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded" value="Reset Image" onClick={handleImageReset}/>
              <input id="image-download" className="bg-[#EA454C] hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded" type="button" value="Download Image" onClick={handleImageDownload}/>

            </div>
            <div id="canvas-container" className="w-8/10 min-h-8/10 flex justify-center items-center">
              <canvas ref={canvasRef}  className="border border-gray-300" />
            </div>
              
          </div>
          <div className="w-full h-screen">a</div>
          
      </div>
    </div>
  );
}

export default App