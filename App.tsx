import React, { useState, useEffect } from 'react';
import { Activity, Calculator, Heart, Info, AlertCircle, Camera, Stethoscope, ChevronRight, RefreshCcw, RefreshCw } from 'lucide-react';
import { PressureData, ITBResult } from './types';
import { getInterpretation, INTERPRETATION_RANGES } from './constants';
import InfoTooltip from './components/InfoTooltip';
import CameraModal from './components/CameraModal';
import { analyzeHealthResult, scanHandwrittenNote } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [values, setValues] = useState<PressureData>({
    armSystolic: '',
    ankleSystolic: '',
  });

  const [result, setResult] = useState<ITBResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Load API Key check
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Simple check if API key is present in env
    if (process.env.API_KEY) {
        setHasApiKey(true);
    }
  }, []);

  const handleInputChange = (field: keyof PressureData, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    setValues((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on input change
    setAiAnalysis(null);
    setShowAnalysis(false);
  };

  const calculateITB = () => {
    const arm = parseFloat(values.armSystolic);
    const ankle = parseFloat(values.ankleSystolic);

    if (!arm || !ankle || arm === 0) return;

    const score = ankle / arm;
    const roundedScore = Math.round(score * 100) / 100;
    
    setResult(getInterpretation(roundedScore));
  };

  const handleImageCapture = async (base64: string) => {
    setIsCameraOpen(false);
    setIsScanning(true);
    try {
        const data = await scanHandwrittenNote(base64);
        if (data.armSystolic) handleInputChange('armSystolic', data.armSystolic.toString());
        if (data.ankleSystolic) handleInputChange('ankleSystolic', data.ankleSystolic.toString());
    } catch (e) {
        alert('Não foi possível ler os números da imagem. Tente digitar manualmente.');
    } finally {
        setIsScanning(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!result) return;
    setIsAnalyzing(true);
    setShowAnalysis(true);
    try {
        const analysis = await analyzeHealthResult(result.score, '', '');
        setAiAnalysis(analysis);
    } catch (e) {
        setAiAnalysis('Desculpe, não foi possível conectar à IA no momento.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
      setValues({ armSystolic: '', ankleSystolic: '' });
      setResult(null);
      setAiAnalysis(null);
      setShowAnalysis(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-blue-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-md">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">CalcITB</h1>
              <p className="text-xs text-blue-600 font-medium">Saúde Vascular Inteligente</p>
            </div>
          </div>
          {hasApiKey && (
              <button 
                onClick={() => setIsCameraOpen(true)}
                className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                title="Escanear resultado"
              >
                <Camera size={20} />
              </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-4 space-y-6">
        
        {/* Intro Card */}
        {!result && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="font-semibold text-lg mb-2 text-slate-800">Cálculo de Risco Vascular</h2>
                <p className="text-sm text-slate-500 mb-4">
                    O Índice Tornozelo-Braquial (ITB) é um exame simples que compara a pressão arterial do tornozelo com a do braço para identificar riscos de má circulação ou doença arterial periférica.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <Info size={16} />
                    <span>Dica: Use a pressão sistólica (o valor maior, ex: 120).</span>
                </div>
            </div>
        )}

        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-white relative overflow-hidden">
             {/* Decorative background blob */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 -mr-16 -mt-16"></div>

             {isScanning && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                     <RefreshCw className="animate-spin text-blue-600 mb-2" size={32} />
                     <p className="text-sm font-medium text-blue-800">Lendo imagem...</p>
                 </div>
             )}

            <div className="space-y-6 relative z-0">
                {/* Arm Input */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700">
                        Pressão Braço (Sistólica)
                        <InfoTooltip text="Insira a pressão sistólica (o número maior) do braço. Se mediu nos dois braços, use o valor mais alto." />
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Ex: 120"
                            value={values.armSystolic}
                            onChange={(e) => handleInputChange('armSystolic', e.target.value)}
                            className="w-full pl-4 pr-12 py-4 text-xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">mmHg</span>
                    </div>
                </div>

                {/* Divider with calculation symbol */}
                <div className="relative flex items-center justify-center h-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative bg-white px-2 text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                           <span className="text-lg font-serif italic text-slate-400">÷</span>
                        </div>
                    </div>
                </div>

                {/* Ankle Input */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700">
                        Pressão Tornozelo (Sistólica)
                        <InfoTooltip text="Insira a pressão sistólica medida no tornozelo. Para um exame completo, meça os dois e calcule separadamente, ou use o lado com sintomas." />
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="Ex: 110"
                            value={values.ankleSystolic}
                            onChange={(e) => handleInputChange('ankleSystolic', e.target.value)}
                            className="w-full pl-4 pr-12 py-4 text-xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">mmHg</span>
                    </div>
                </div>

                <button
                    onClick={calculateITB}
                    disabled={!values.armSystolic || !values.ankleSystolic}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                    <Calculator size={20} />
                    Calcular ITB
                </button>
            </div>
        </div>

        {/* Result Section */}
        {result && (
            <div className="animate-fade-in space-y-6">
                {/* Score Card */}
                <div className={`p-6 rounded-2xl border shadow-lg ${result.color} transition-all duration-500`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Resultado do Índice</p>
                            <div className="text-5xl font-black tracking-tight flex items-baseline gap-1">
                                {result.score.toFixed(2)}
                                <span className="text-sm font-medium opacity-60">ITB</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-full bg-white bg-opacity-30`}>
                            {result.score < 0.9 ? <AlertCircle size={32} /> : result.score > 1.4 ? <Activity size={32} /> : <Heart size={32} />}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">{result.message}</h3>
                        <p className="text-sm opacity-90 leading-relaxed">{result.recommendation}</p>
                    </div>
                </div>

                {/* Visual Gauge Scale */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-3 text-center">Escala de Referência</p>
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden flex w-full">
                        {INTERPRETATION_RANGES.map((range, idx) => {
                             // Simple proportional widths for visualization (not exact math scale)
                             const widths = ['30%', '15%', '30%', '25%']; 
                             // Reverse order in map usually because of low->high array but ranges are distinct
                             // Array is: Calcification (>1.4), Normal (1-1.4), Border (0.9-1), PAD (<0.9)
                             // Let's render in visual order: PAD -> Border -> Normal -> Calc
                             // Re-sorting solely for visual bar
                             return null;
                        })}
                        {/* Manual visual construction for better control */}
                        <div className="h-full bg-orange-600 w-[30%]" title="DAP"></div>
                        <div className="h-full bg-yellow-500 w-[10%]" title="Limítrofe"></div>
                        <div className="h-full bg-emerald-500 w-[30%]" title="Normal"></div>
                        <div className="h-full bg-red-600 w-[30%]" title="Calcificação"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium px-1">
                        <span>0.0</span>
                        <span>0.90</span>
                        <span>1.00</span>
                        <span>1.40</span>
                        <span>High</span>
                    </div>
                    
                    {/* Marker */}
                    <div 
                        className="mt-1 text-center font-bold text-xs text-blue-600 transition-all duration-500"
                    >
                        Seu resultado: {result.score.toFixed(2)}
                    </div>
                </div>

                {/* AI Analysis Button */}
                {hasApiKey && (
                    <div className="pt-2">
                        {!showAnalysis ? (
                            <button
                                onClick={handleAIAnalysis}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-md flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">Interpretação Avançada</p>
                                        <p className="text-xs text-indigo-200">Perguntar à IA sobre este resultado</p>
                                    </div>
                                </div>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 relative">
                                <h3 className="flex items-center gap-2 font-bold text-indigo-900 mb-4">
                                    <Stethoscope size={18} className="text-indigo-600"/>
                                    Análise Inteligente
                                </h3>
                                
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                        <p className="text-sm text-indigo-600">O Dr. AI está analisando...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm prose-indigo text-slate-700 max-w-none">
                                        <ReactMarkdown>{aiAnalysis || ''}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                <button onClick={clearAll} className="w-full py-3 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> Calcular novamente
                </button>
            </div>
        )}

      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-xl mx-auto px-6 py-6 text-center">
          <p className="text-[10px] text-slate-400 leading-normal">
              AVISO MÉDICO: Este aplicativo é apenas para fins informativos e educacionais. 
              Os resultados não constituem diagnóstico médico. Se você tem pressão alta ou sente dores nas pernas, consulte um médico.
          </p>
      </footer>

      {isCameraOpen && (
          <CameraModal 
            onClose={() => setIsCameraOpen(false)} 
            onCapture={handleImageCapture}
          />
      )}
    </div>
  );
};

export default App;