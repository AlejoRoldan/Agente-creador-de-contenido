
import React, { useState } from 'react';
import { GenerationStep } from '../types';
import { LoaderCircle, Check, RefreshCw } from 'lucide-react';

interface ReviewPanelProps {
  step: GenerationStep;
  isLoading: boolean;
  onRegenerate: (feedback: string) => void;
  onApprovePlan: () => void;
  onApproveContent: () => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({
  step,
  isLoading,
  onRegenerate,
  onApprovePlan,
  onApproveContent,
}) => {
  const [feedback, setFeedback] = useState('');

  const isReviewPlan = step === GenerationStep.REVIEW_PLAN;
  const isReviewContent = step === GenerationStep.REVIEW_CONTENT;

  if (!isReviewPlan && !isReviewContent) {
    return null;
  }
  
  const title = isReviewPlan ? "Revisar Plan" : "Revisar Contenido";
  const description = isReviewPlan 
    ? "Revisa la estructura del curso. Si no te convence, puedes rechazarla con comentarios."
    : "Revisa el contenido generado. Si necesita ajustes, puedes rechazarlo con comentarios.";

  const handleApprove = () => {
    if (isReviewPlan) onApprovePlan();
    if (isReviewContent) onApproveContent();
  };

  const handleRegenerate = () => {
    onRegenerate(feedback);
    setFeedback('');
  };


  return (
    <div className="sticky top-8 bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4 shadow-lg">
      <h3 className="text-xl font-bold text-gray-100">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
      
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
            Comentarios (opcional)
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm"
          placeholder="Ej: Agregar más ejemplos prácticos..."
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            <>
              <Check size={20} className="mr-2" />
              Aprobar
            </>
          )}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isLoading || !isReviewPlan} // Regeneration only for plan for now
          className="w-full flex items-center justify-center bg-red-800/80 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
           {isLoading ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            <>
              <RefreshCw size={20} className="mr-2" />
              Rechazar y Regenerar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewPanel;
