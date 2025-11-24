import { ITBCategory, ITBResult } from './types';

export const INTERPRETATION_RANGES = [
  {
    min: 1.41,
    max: 999,
    category: ITBCategory.CALCIFICATION,
    color: 'text-red-600 bg-red-50 border-red-200',
    barColor: '#dc2626',
    label: 'Artérias Não Compressíveis',
    message: 'ALERTA: Rigidez Arterial / Calcificação',
    recommendation: 'Valores acima de 1,4 sugerem artérias endurecidas. Consulte um cardiologista vascular.',
  },
  {
    min: 1.00, // Adjusted slightly to match standard clinical guidelines closer to image
    max: 1.40,
    category: ITBCategory.NORMAL,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: '#059669',
    label: 'Circulação Normal',
    message: 'CIRC OK: Fluxo sanguíneo adequado',
    recommendation: 'Sua circulação periférica aparenta estar saudável. Continue com hábitos saudáveis.',
  },
  {
    min: 0.91,
    max: 0.99,
    category: ITBCategory.BORDERLINE,
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    barColor: '#d97706',
    label: 'Limítrofe',
    message: 'ATENÇÃO: Início de alteração',
    recommendation: 'Valor limítrofe. Recomendado monitorar e controlar fatores de risco como pressão e colesterol.',
  },
  {
    min: 0.00,
    max: 0.90,
    category: ITBCategory.MILD_PAD, // Broad bucket for < 0.9 based on image
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    barColor: '#ea580c',
    label: 'Doença Arterial Periférica',
    message: '! PERNAS: Atenção à circulação',
    recommendation: 'Indica possível Doença Arterial Obstrutiva Periférica (DAOP). Procure um médico.',
  }
];

export const getInterpretation = (score: number): ITBResult => {
  const match = INTERPRETATION_RANGES.find((r) => score >= r.min && score <= r.max);
  
  // Default fallback if something goes wrong, though ranges should cover all valid positives
  if (!match) {
     return {
        score,
        category: ITBCategory.NORMAL,
        color: 'text-gray-700',
        message: 'Valor fora do padrão',
        recommendation: 'Consulte um médico.',
     };
  }

  return {
    score,
    category: match.category,
    color: match.color,
    message: match.message,
    recommendation: match.recommendation
  };
};