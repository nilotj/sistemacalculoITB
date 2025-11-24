import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        // Remove the data URL prefix to get just base64
        const base64 = imageSrc.split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl relative">
        <div className="p-4 bg-gray-900 flex justify-between items-center text-white">
          <h3 className="font-semibold">Escanear Anotação</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black aspect-[3/4] flex items-center justify-center overflow-hidden">
            {error ? (
                <div className="text-white text-center p-6">
                    <p className="mb-2 text-red-400">{error}</p>
                    <p className="text-sm text-gray-400">Tente digitar os valores manualmente.</p>
                </div>
            ) : (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                />
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Guide overlay */}
            <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-white/50 text-xs bg-black/50 px-2 py-1 rounded">Posicione os números aqui</span>
            </div>
        </div>

        <div className="p-6 bg-gray-900 flex justify-center pb-8">
            {!error && (
                <button 
                    onClick={handleCapture}
                    className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/20"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-600"></div>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;