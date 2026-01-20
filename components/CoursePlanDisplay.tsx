
import React, { useState } from 'react';
// Fix: Import GenerationStep as a value for runtime access, while keeping CoursePlan as a type-only import.
import { type CoursePlan, GenerationStep } from '../types';
import { ChevronDown, CheckCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface CoursePlanDisplayProps {
  coursePlan: CoursePlan;
  courseContents: Record<string, string>;
  currentStep: GenerationStep;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

const CoursePlanDisplay: React.FC<CoursePlanDisplayProps> = ({
  coursePlan,
  courseContents,
  currentStep,
  selectedSectionId,
  onSelectSection
}) => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(selectedSectionId);

  const toggleSection = (sectionId: string) => {
    const newOpenSectionId = openSectionId === sectionId ? null : sectionId;
    setOpenSectionId(newOpenSectionId);
    if(currentStep === GenerationStep.REVIEW_CONTENT) {
        onSelectSection(sectionId)
    }
  };

  return (
    <div className="space-y-4">
       <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-6">
            <p className="text-gray-100 font-semibold mb-4">Detalles del Curso</p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <strong>Audiencia:</strong>
                    <span>{coursePlan.audience}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="text-emerald-400" size={16} />
                    <strong>Duración:</strong>
                    <span>{coursePlan.duration}</span>
                </div>
            </div>
        </div>

      {coursePlan.sections.map((section, index) => {
        const isOpen = openSectionId === section.id;
        const isContentGenerated = !!courseContents[section.id];
        
        return (
          <div key={section.id} className="bg-gray-800/60 border border-gray-700/80 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-emerald-400 font-bold">{index + 1}</span>
                <span className="font-semibold text-lg text-gray-100">{section.title}</span>
                {currentStep !== GenerationStep.REVIEW_PLAN && isContentGenerated && (
                    <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-full">Contenido listo</span>
                )}
              </div>
              <ChevronDown
                size={24}
                className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 border-t border-gray-700/80">
                {currentStep === GenerationStep.REVIEW_CONTENT && courseContents[section.id] ? (
                  <div className="prose prose-invert prose-sm max-w-none mt-4 text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-code:text-emerald-300 prose-code:bg-gray-900/50 prose-code:p-1 prose-code:rounded-md prose-blockquote:border-l-emerald-500">
                    <ReactMarkdown>{courseContents[section.id]}</ReactMarkdown>
                  </div>
                ) : (
                  <>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-200 mb-2">Objetivos:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
                        {section.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-200 mb-2">Subsecciones:</h4>
                      <ul className="space-y-2 text-gray-400 text-sm">
                        {section.subsections.map((sub, i) => (
                          <li key={i} className="pl-4 border-l-2 border-gray-700">
                            <strong className="text-gray-300">{sub.title}</strong>: {sub.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CoursePlanDisplay;
