
import React, { useState } from 'react';
import type { CourseInput } from '../types';
import { Lightbulb, Users, SlidersHorizontal, BookPlus, LoaderCircle } from 'lucide-react';

interface LandingScreenProps {
  onFormSubmit: (data: CourseInput) => void;
  isLoading: boolean;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/80">
    <div className="flex items-center gap-4">
      <div className="bg-emerald-900/50 p-2 rounded-lg text-emerald-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
    </div>
    <p className="mt-3 text-gray-400 text-sm">{description}</p>
  </div>
);


const LandingScreen: React.FC<LandingScreenProps> = ({ onFormSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CourseInput>({
    topic: '',
    objective: '',
    audience: '',
    restrictions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.topic && formData.objective && formData.audience) {
      onFormSubmit(formData);
    }
  };

  const isFormValid = formData.topic && formData.objective && formData.audience;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-emerald-900/50 text-emerald-300 text-sm font-medium py-1 px-3 rounded-full mb-4">
          Potenciado por Gemini
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
          Genera cursos completos <span className="text-emerald-400">en minutos</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
          Crea contenido educativo estructurado con IA. Define tu tema, objetivo y audiencia, y deja que la inteligencia artificial haga el resto.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <FeatureCard icon={<Lightbulb size={24} />} title="Plan Inteligente" description="Estructura automática del curso, desde los módulos hasta las subsecciones." />
        <FeatureCard icon={<Users size={24} />} title="Contenido a Medida" description="Material adaptado al nivel y conocimiento de tu audiencia objetivo." />
        <FeatureCard icon={<SlidersHorizontal size={24} />} title="Human-in-the-Loop" description="Tú apruebas cada paso del proceso, asegurando la calidad final." />
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-gray-950/50">
        <div className="flex items-center gap-4">
            <div className="bg-gray-700 p-3 rounded-lg text-emerald-400">
                <BookPlus size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-100">Crear Nuevo Curso</h2>
                <p className="text-gray-400">Completa los campos para comenzar.</p>
            </div>
        </div>
        
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">Tema del curso</label>
          <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange} required placeholder="Ej: CI/CD Pipelines con GitHub Actions" className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
        </div>
        
        <div>
          <label htmlFor="objective" className="block text-sm font-medium text-gray-300 mb-2">Objetivo de aprendizaje</label>
          <textarea name="objective" id="objective" value={formData.objective} onChange={handleChange} required rows={3} placeholder="Ej: Que el estudiante aprenda a crear pipelines automatizados para una aplicación Python." className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"></textarea>
        </div>

        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">Audiencia objetivo</label>
          <input type="text" name="audience" id="audience" value={formData.audience} onChange={handleChange} required placeholder="Ej: Desarrolladores Backend con experiencia intermedia en Python." className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
        </div>
        
        <div>
          <label htmlFor="restrictions" className="block text-sm font-medium text-gray-300 mb-2">Restricciones <span className="text-gray-500">(opcional)</span></label>
          <input type="text" name="restrictions" id="restrictions" value={formData.restrictions} onChange={handleChange} placeholder="Ej: Tono profesional, duración de 6 horas, enfocado en fintech." className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
        </div>

        <button type="submit" disabled={!isFormValid || isLoading} className="w-full flex items-center justify-center bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300">
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin mr-2" size={20} />
              Generando Plan...
            </>
          ) : (
            'Crear Curso'
          )}
        </button>
      </form>
    </div>
  );
};

export default LandingScreen;
