import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { setCandidateDetails } from '@/features/interviewSlice.js';
import { Loader2, UploadCloud } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import TestimonialSlider from './TestimonialSlider';

// --- THE DEFINITIVE FIX for the PDF Worker ---
// This modern approach uses a dynamic import to load the worker script,
// which is fully compatible with Vite and avoids all previous CORS/404 errors.
if (typeof window !== 'undefined') {
  import('pdfjs-dist/build/pdf.worker.mjs').then(pdfjsWorker => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  });
}



const ResumeUpload = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setLoadingMessage('Reading your resume...');

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            try {
                let fullText = '';
                
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
                    fullText = result.value;
                } else if (file.type === 'application/pdf') {
                    const pdf = await pdfjsLib.getDocument(event.target.result).promise;
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(' ');
                    }
                } else {
                    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
                }

                if (!fullText) {
                    throw new Error("Could not extract any text from the document.");
                }

                setLoadingMessage('Analyzing details with AI...');
                const response = await fetch('/api/parseResume', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeText: fullText }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to parse resume.');
                }

                const data = await response.json();
                dispatch(setCandidateDetails(data));

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        reader.onerror = () => {
             setError('Failed to read the file.');
             setLoading(false);
        };
    }, [dispatch]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
    });

    return (
        <div className="w-full">
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center p-8">
                {loading ? (
                    <div className="text-center h-[244px] flex flex-col justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                        <p className="mt-4 text-lg font-medium text-gray-700">{loadingMessage}</p>
                        <p className="text-gray-500">This may take a moment.</p>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center">
                            <UploadCloud className="h-16 w-16 text-slate-400 mb-4" />
                            <p className="text-xl font-semibold text-slate-700">
                                {isDragActive ? 'Drop your file here ...' : 'Drag & drop your resume here'}
                            </p>
                            <p className="text-slate-500">or click to upload (PDF or DOCX)</p>
                            {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
                        </div>
                    </div>
                )}
            </div>
            <TestimonialSlider />
        </div>
    );
};

export default ResumeUpload;

