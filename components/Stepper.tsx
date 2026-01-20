
import React from 'react';
import { GenerationStep } from '../types';
import { CheckCircle2, CircleDashed, PenSquare, FileText, Bot, PartyPopper } from 'lucide-react';

interface StepperProps {
  currentStep: GenerationStep;
}

const steps = [
  { id: GenerationStep.GENERATING_PLAN, label: 'Plan', icon: <Bot size={18}/> },
  { id: GenerationStep.REVIEW_PLAN, label: 'Revisar Plan', icon: <FileText size={18}/> },
  { id: GenerationStep.GENERATING_CONTENT, label: 'Escribir', icon: <PenSquare size={18}/> },
  { id: GenerationStep.REVIEW_CONTENT, label: 'Revisar Contenido', icon: <FileText size={18}/> },
  { id: GenerationStep.COMPLETED, label: 'Completado', icon: <PartyPopper size={18}/> },
];

const stepOrder = [
    GenerationStep.CREATE,
    GenerationStep.GENERATING_PLAN,
    GenerationStep.REVIEW_PLAN,
    GenerationStep.GENERATING_CONTENT,
    GenerationStep.REVIEW_CONTENT,
    GenerationStep.COMPLETED
];


const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const currentIndex = stepOrder.indexOf(currentStep);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepIndexInDisplay = stepOrder.indexOf(step.id);
                    const isCompleted = currentIndex > stepIndexInDisplay;
                    const isActive = currentIndex === stepIndexInDisplay;

                    let statusClass = 'text-gray-500';
                    let icon = step.icon;
                    if(isCompleted) {
                        statusClass = 'text-emerald-400';
                        icon = <CheckCircle2 size={18}/>;
                    } else if (isActive) {
                        statusClass = 'text-emerald-400';
                        if (currentStep === GenerationStep.GENERATING_PLAN || currentStep === GenerationStep.GENERATING_CONTENT) {
                            icon = <CircleDashed size={18} className="animate-spin"/>
                        }
                    }

                    return (
                        <React.Fragment key={step.id}>
                            <div className={`flex flex-col sm:flex-row items-center gap-2 ${statusClass} transition-colors duration-500`}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isCompleted || isActive ? 'border-emerald-500/50' : 'border-gray-700'}`}>
                                    {icon}
                                </div>
                                <span className="text-xs sm:text-sm font-medium mt-1 sm:mt-0">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
