
import React, { useState, useCallback } from 'react';
import { CourseInput, CoursePlan, GenerationStep } from './types';
import LandingScreen from './components/LandingScreen';
import CourseGenerationScreen from './components/CourseGenerationScreen';
import { generateCoursePlan, regenerateCoursePlan, generateContentForSection } from './services/geminiService';
import { BookText } from 'lucide-react';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [step, setStep] = useState<GenerationStep>(GenerationStep.CREATE);
  const [courseInput, setCourseInput] = useState<CourseInput | null>(null);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [courseContents, setCourseContents] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCourse = useCallback(async (input: CourseInput) => {
    setIsLoading(true);
    setError(null);
    setCourseInput(input);
    setStep(GenerationStep.GENERATING_PLAN);
    try {
      const plan = await generateCoursePlan(input);
      setCoursePlan(plan);
      setStep(GenerationStep.REVIEW_PLAN);
    } catch (e) {
      setError('Failed to generate course plan. Please try again.');
      setStep(GenerationStep.CREATE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegeneratePlan = useCallback(async (feedback: string) => {
    if (!courseInput || !coursePlan) return;
    setIsLoading(true);
    setError(null);
    setStep(GenerationStep.GENERATING_PLAN);
    try {
      const newPlan = await regenerateCoursePlan(courseInput, coursePlan, feedback);
      setCoursePlan(newPlan);
      setStep(GenerationStep.REVIEW_PLAN);
    } catch (e) {
      setError('Failed to regenerate plan. Please try again.');
      setStep(GenerationStep.REVIEW_PLAN);
    } finally {
      setIsLoading(false);
    }
  }, [courseInput, coursePlan]);

  const handleApprovePlan = useCallback(async () => {
    if (!coursePlan || !courseInput) return;
    setIsLoading(true);
    setError(null);
    setStep(GenerationStep.GENERATING_CONTENT);
    try {
      const contentPromises = coursePlan.sections.map(section => 
        generateContentForSection(courseInput, coursePlan, section.id)
      );
      const contents = await Promise.all(contentPromises);
      const newCourseContents: Record<string, string> = {};
      coursePlan.sections.forEach((section, index) => {
        newCourseContents[section.id] = contents[index];
      });
      setCourseContents(newCourseContents);
      setStep(GenerationStep.REVIEW_CONTENT);
    } catch (e) {
      setError('Failed to generate content. Please try again.');
      setStep(GenerationStep.REVIEW_PLAN);
    } finally {
      setIsLoading(false);
    }
  }, [courseInput, coursePlan]);

  const handleApproveContent = useCallback(() => {
    setStep(GenerationStep.COMPLETED);
  }, []);

  const handleReset = () => {
    setStep(GenerationStep.CREATE);
    setCourseInput(null);
    setCoursePlan(null);
    setCourseContents({});
    setIsLoading(false);
    setError(null);
  };
  
  const renderContent = () => {
    if (step === GenerationStep.CREATE) {
      return <LandingScreen onFormSubmit={handleCreateCourse} isLoading={isLoading} />;
    }
    if (courseInput && coursePlan) {
       return (
        <CourseGenerationScreen
          step={step}
          courseInput={courseInput}
          coursePlan={coursePlan}
          courseContents={courseContents}
          isLoading={isLoading}
          onRegeneratePlan={handleRegeneratePlan}
          onApprovePlan={handleApprovePlan}
          onApproveContent={handleApproveContent}
        />
      );
    }
    return <LandingScreen onFormSubmit={handleCreateCourse} isLoading={isLoading} />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="border-b border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookText className="text-emerald-400 h-8 w-8" />
            <h1 className="text-xl font-bold tracking-tight text-gray-100">Gemini Course Architect</h1>
          </div>
          <button
            onClick={handleReset}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Nuevo Curso
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {renderContent()}
      </main>
      <ChatBot />
    </div>
  );
};

export default App;
