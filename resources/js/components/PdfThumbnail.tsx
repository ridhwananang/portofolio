import { useEffect, useRef, useState } from 'react';

interface PdfThumbnailProps {
    fileUrl: string;
    title: string;
}

export default function PdfThumbnail({ fileUrl, title }: PdfThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const renderPdf = async () => {
            try {
                // @ts-expect-error - Global pdfjsLib loaded dynamically
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

                const loadingTask = pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);

                const canvas = canvasRef.current;

                if (!canvas || !isMounted) {
                    return;
                }

                const context = canvas.getContext('2d');

                if (!context) {
                    return;
                }

                // Render at higher resolution for sharpness
                const scale = 2.0;
                const scaledViewport = page.getViewport({ scale });

                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                };

                await page.render(renderContext).promise;

                if (isMounted) {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error rendering PDF thumbnail:', error);

                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Check if PDF.js is already loaded globally
        // @ts-expect-error - Global pdfjsLib loaded dynamically
        if (window['pdfjs-dist/build/pdf']) {
            renderPdf();

            return;
        }

        // Dynamically load PDF.js script
        const scriptId = 'pdfjs-script-loader';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
            document.body.appendChild(script);
        }

        const handleScriptLoad = () => {
            if (isMounted) {
                renderPdf();
            }
        };

        script.addEventListener('load', handleScriptLoad);

        // If the script is already loaded but window variable isn't fully ready yet, poll for it
        if (script.dataset.loaded === 'true') {
            renderPdf();
        }

        return () => {
            isMounted = false;
            script.removeEventListener('load', handleScriptLoad);
        };
    }, [fileUrl]);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden" title={title}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
                    <span className="text-[10px] text-slate-400">Rendering...</span>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="w-full h-full object-cover object-top"
                style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
                title={`Thumbnail: ${title}`}
            />
        </div>
    );
}
