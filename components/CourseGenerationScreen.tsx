
import React, { useState } from 'react';
// Fix: Import GenerationStep as a value for runtime access, while keeping interfaces as type-only imports.
import { type CourseInput, type CoursePlan, GenerationStep } from '../types';
import Stepper from './Stepper';
import CoursePlanDisplay from './CoursePlanDisplay';
import ReviewPanel from './ReviewPanel';
import CompletionDisplay from './CompletionDisplay';

interface CourseGenerationScreenProps {
  step: GenerationStep;
  courseInput: CourseInput;
  coursePlan: CoursePlan;
  courseContents: Record<string, string>;
  isLoading: boolean;
  onRegeneratePlan: (feedback: string) => void;
  onApprovePlan: () => void;
  onApproveContent: () => void;
}

const CourseGenerationScreen: React.FC<CourseGenerationScreenProps> = ({
  step,
  courseInput,
  coursePlan,
  courseContents,
  isLoading,
  onRegeneratePlan,
  onApprovePlan,
  onApproveContent,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
     coursePlan.sections.length > 0 ? coursePlan.sections[0].id : null
  );

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };
  
  if (step === GenerationStep.COMPLETED) {
     return (
        <div>
            <Stepper currentStep={step} />
            <CompletionDisplay coursePlan={coursePlan} courseContents={courseContents} />
        </div>
     );
  }

  return (
    <div>
      <Stepper currentStep={step} />
      <div className="mt-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-100">{coursePlan.title}</h2>
        <p className="mt-2 text-gray-400">ID del curso: <span className="font-mono text-xs bg-gray-800 p-1 rounded">2d1187a5-c253-488c-82fa-582a9f53d13f</span></p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <CoursePlanDisplay 
                coursePlan={coursePlan}
                courseContents={courseContents}
                currentStep={step}
                selectedSectionId={selectedSectionId}
                onSelectSection={handleSelectSection}
            />
        </div>
        <div className="lg:col-span-1">
            <ReviewPanel
                step={step}
                isLoading={isLoading}
                onRegenerate={onRegeneratePlan}
                onApprovePlan={onApprovePlan}
                onApproveContent={onApproveContent}
            />
        </div>
      </div>
    </div>
  );
};

export default CourseGenerationScreen;
