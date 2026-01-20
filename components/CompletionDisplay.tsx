
import React, { useState } from 'react';
import { CoursePlan } from '../types';
import { CheckCircle2, FileText, BookCopy, Download, LoaderCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';


interface CompletionDisplayProps {
    coursePlan: CoursePlan;
    courseContents: Record<string, string>;
}

// Helper component to render the course content into a clean HTML structure for PDF conversion.
const CourseExportDocument: React.FC<CompletionDisplayProps> = ({ coursePlan, courseContents }) => {
    const styles = `
        body { font-family: Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        h1, h2, h3, h4, h5, h6 { color: #000; margin-top: 1.2em; margin-bottom: 0.5em; }
        h1 { font-size: 28px; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 22px; margin-top: 30px; border-bottom: 1px solid #eaeaea; }
        h3 { font-size: 18px; }
        p { margin-bottom: 12px; }
        ul, ol { padding-left: 25px; margin-bottom: 12px; }
        li { margin-bottom: 5px; }
        code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 0.9em;}
        pre { background-color: #f0f0f0; padding: 12px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
        pre code { background-color: transparent; padding: 0; }
        blockquote { border-left: 3px solid #ccc; padding-left: 15px; margin-left: 0; font-style: italic; color: #666; }
    `;

    return (
        <html lang="es">
            <head>
                <meta charSet="UTF-8" />
                <style>{styles}</style>
            </head>
            <body>
                <h1>{coursePlan.title}</h1>
                <p><strong>Audiencia Objetivo:</strong> {coursePlan.audience}</p>
                <p><strong>Duración Estimada:</strong> {coursePlan.duration}</p>
                
                {coursePlan.sections.map((section, index) => (
                    <div key={section.id} className="section-container">
                        <h2>Sección {index + 1}: {section.title}</h2>
                        <ReactMarkdown>{courseContents[section.id] || 'Contenido no disponible.'}</ReactMarkdown>
                    </div>
                ))}
            </body>
        </html>
    );
};


const CompletionDisplay: React.FC<CompletionDisplayProps> = ({ coursePlan, courseContents }) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
    
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.width = '800px';
        exportContainer.style.padding = '40px';
        exportContainer.style.backgroundColor = 'white';
        exportContainer.style.fontSize = '16px';
    
        const staticMarkup = ReactDOMServer.renderToStaticMarkup(
            <CourseExportDocument coursePlan={coursePlan} courseContents={courseContents} />
        );
        exportContainer.innerHTML = staticMarkup;
        document.body.appendChild(exportContainer);
    
        try {
            const canvas = await html2canvas(exportContainer, {
                scale: 2,
                useCORS: true,
                windowWidth: exportContainer.scrollWidth,
                windowHeight: exportContainer.scrollHeight,
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const scaledHeight = canvasHeight / ratio;
    
            let heightLeft = scaledHeight;
            let position = 0;
    
            // Add image to first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
    
            // Add new pages if content overflows
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }
    
            pdf.save(`${coursePlan.title.replace(/ /g, '_').toLowerCase()}.pdf`);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
        } finally {
            document.body.removeChild(exportContainer);
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto text-center py-16">
            <div className="flex justify-center mb-6">
                <CheckCircle2 className="text-emerald-400 h-20 w-20" />
            </div>
            <h2 className="text-4xl font-extrabold text-white">¡Curso Completado!</h2>
            <p className="mt-3 text-lg text-gray-400">El curso ha sido generado exitosamente.</p>

            <div className="mt-12 bg-gray-800/60 border border-gray-700/80 rounded-2xl p-8 text-left">
                <div className="border-b border-gray-700 pb-4 mb-4">
                     <h3 className="text-2xl font-bold text-gray-100">{coursePlan.title}</h3>
                     <p className="text-sm mt-1 text-emerald-300 bg-emerald-900/50 inline-block px-2 py-1 rounded">Plan del Curso Aprobado</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Resumen</h4>
                         <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                            <FileText className="text-emerald-400" />
                            <div>
                                <p className="font-bold text-white">{coursePlan.sections.length}</p>
                                <p className="text-xs text-gray-400">Secciones</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg mt-3">
                            <BookCopy className="text-emerald-400" />
                             <div>
                                <p className="font-bold text-white">{Object.keys(courseContents).length}</p>
                                <p className="text-xs text-gray-400">Contenidos generados</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Detalles</h4>
                        <div className="text-sm space-y-2 text-gray-300">
                             <p><strong>Audiencia:</strong> {coursePlan.audience}</p>
                             <p><strong>Duración:</strong> {coursePlan.duration}</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-8">
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isExporting ? (
                            <><LoaderCircle className="animate-spin mr-2" size={20}/> Exportando...</>
                        ) : (
                            <><Download className="mr-2" size={20}/> Exportar a PDF</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompletionDisplay;
