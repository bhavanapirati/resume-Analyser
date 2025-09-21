

import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { parsePdf, parseDocx } from '../services/fileParser';
import type { AnalysisMode } from '../types';

interface InputSectionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  resume: string;
  setResume: (value: string) => void;
  mustHaveSkills: string;
  setMustHaveSkills: (value: string) => void;
  goodToHaveSkills: string;
  setGoodToHaveSkills: (value: string) => void;
  jdFileName: string | null;
  setJdFileName: (name: string | null) => void;
  resumeFileName: string | null;
  setResumeFileName: (name: string | null) => void;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

type InputMode = 'text' | 'file';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary rounded-t-md ${
      isActive
        ? 'border-b-2 border-brand-primary text-brand-primary bg-white'
        : 'text-base-content/60 hover:text-base-content'
    }`}
  >
    {label}
  </button>
);

const FileUpload: React.FC<{
  id: string;
  onFileSelect: (file: File) => void;
  fileName: string | null;
  onClear: () => void;
  isParsing: boolean;
  parseError: string | null;
}> = ({ id, onFileSelect, fileName, onClear, isParsing, parseError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  }

  if (fileName) {
    return (
        <div className="w-full p-4 border border-base-300 rounded-xl bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
                <DocumentTextIcon />
                <span className="font-medium text-base-content truncate">{fileName}</span>
            </div>
            <button onClick={onClear} className="text-base-content/50 hover:text-red-600 transition-colors">
                <XCircleIcon />
            </button>
        </div>
    );
  }

  return (
    <div className="relative">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`w-full p-4 h-48 border-2 border-dashed border-base-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'bg-brand-light border-brand-secondary' : 'bg-white hover:bg-base-100/50'}`}
      >
        <input
            ref={fileInputRef}
            id={id}
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileChange}
        />
        {isParsing ? (
             <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm font-semibold text-base-content/80">Parsing Document...</p>
            </div>
        ) : (
            <>
                <UploadIcon />
                <p className="mt-2 font-semibold text-base-content">Click to browse or drag & drop</p>
                <p className="text-sm text-base-content/60">PDF or DOCX file</p>
            </>
        )}
      </div>
       {parseError && <p className="text-red-600 text-sm mt-2">{parseError}</p>}
    </div>
  );
};

const AnalysisModeSelector: React.FC<{
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
}> = ({ mode, setMode }) => {
    const modes: AnalysisMode[] = ['Precise', 'Balanced', 'Creative'];
    const descriptions: Record<AnalysisMode, string> = {
        'Precise': 'Most consistent and factual analysis, ideal for strict keyword matching.',
        'Balanced': 'Default setting, blends accuracy with nuanced understanding.',
        'Creative': 'Offers more imaginative feedback and suggestions for improvement.'
    };

    return (
        <div>
            <label className="block text-lg font-semibold mb-2 text-base-content">
                Analysis Mode
            </label>
            <div className="flex bg-base-200 rounded-lg p-1 space-x-1" role="radiogroup">
                {modes.map(m => (
                    <button 
                        key={m} 
                        onClick={() => setMode(m)}
                        role="radio"
                        aria-checked={mode === m}
                        className={`w-full py-2 px-4 rounded-md text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 ${
                            mode === m ? 'bg-white shadow text-brand-primary' : 'text-base-content/70 hover:bg-base-300/50'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <p className="text-xs text-base-content/60 mt-2 text-center h-4">{descriptions[mode]}</p>
        </div>
    );
}

const InputSection: React.FC<InputSectionProps> = ({
  jobDescription,
  setJobDescription,
  resume,
  setResume,
  mustHaveSkills,
  setMustHaveSkills,
  goodToHaveSkills,
  setGoodToHaveSkills,
  jdFileName,
  setJdFileName,
  resumeFileName,
  setResumeFileName,
  analysisMode,
  setAnalysisMode,
  onAnalyze,
  isLoading,
}) => {
  const [jdInputMode, setJdInputMode] = useState<InputMode>('text');
  const [resumeInputMode, setResumeInputMode] = useState<InputMode>('text');
  const [showStructuredSkills, setShowStructuredSkills] = useState(false);

  const [isParsingJd, setIsParsingJd] = useState<boolean>(false);
  const [jdParseError, setJdParseError] = useState<string | null>(null);
  
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);


  const handleFileSelect = useCallback(async (file: File, type: 'jd' | 'resume') => {
      const setFileName = type === 'jd' ? setJdFileName : setResumeFileName;
      const setIsParsing = type === 'jd' ? setIsParsingJd : setIsParsingResume;
      const setParseError = type === 'jd' ? setJdParseError : setResumeParseError;
      const setContent = type === 'jd' ? setJobDescription : setResume;
      
      setIsParsing(true);
      setParseError(null);
      setFileName(file.name);
      
      try {
        let text = '';
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            text = await parsePdf(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            text = await parseDocx(file);
        } else {
            throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
        }
        setContent(text);
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred during parsing.';
        setParseError(`Failed to parse file: ${error}`);
        setContent('');
        setFileName(null);
      } finally {
        setIsParsing(false);
      }
  }, [setJobDescription, setResume, setJdFileName, setResumeFileName]);

  const handleClearFile = (type: 'jd' | 'resume') => {
      if (type === 'jd') {
          setJdFileName(null);
          setJdParseError(null);
          setJobDescription('');
      } else {
          setResumeFileName(null);
          setResumeParseError(null);
          setResume('');
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-semibold mb-2 text-base-content">
          Job Description
        </label>
        <div className="flex border-b border-base-300">
            <TabButton label="Paste Text" isActive={jdInputMode === 'text'} onClick={() => setJdInputMode('text')} />
            <TabButton label="Upload File" isActive={jdInputMode === 'file'} onClick={() => setJdInputMode('file')} />
        </div>
        <div className="mt-4">
            {jdInputMode === 'text' ? (
                <textarea
                  id="job-description"
                  rows={8}
                  className="w-full p-4 border border-base-300 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 bg-white"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setJdFileName(null);
                  }}
                />
            ) : (
                <FileUpload 
                  id="jd-upload"
                  onFileSelect={(file) => handleFileSelect(file, 'jd')}
                  fileName={jdFileName}
                  onClear={() => handleClearFile('jd')}
                  isParsing={isParsingJd}
                  parseError={jdParseError}
                />
            )}
        </div>
        <div className="mt-2 border border-base-200 rounded-xl">
            <button 
                onClick={() => setShowStructuredSkills(!showStructuredSkills)}
                className="w-full flex justify-between items-center p-3 bg-base-100/50 hover:bg-base-200/50 rounded-t-xl"
                aria-expanded={showStructuredSkills}
            >
                <span className="font-semibold text-sm text-base-content">Add Structured Skills (Optional)</span>
                <ChevronIcon open={showStructuredSkills} />
            </button>
            {showStructuredSkills && (
                 <div className="p-4 space-y-4 bg-white rounded-b-xl border-t">
                    <div>
                        <label htmlFor="must-have" className="text-sm font-medium text-base-content/80">Must-Have Skills</label>
                        <input 
                            id="must-have"
                            type="text"
                            value={mustHaveSkills}
                            onChange={(e) => setMustHaveSkills(e.target.value)}
                            placeholder="e.g., React, Node.js, SQL"
                            className="w-full mt-1 p-2 border border-base-300 rounded-lg focus:ring-1 focus:ring-brand-secondary"
                        />
                         <p className="text-xs text-base-content/60 mt-1">Enter skills separated by commas.</p>
                    </div>
                     <div>
                        <label htmlFor="good-to-have" className="text-sm font-medium text-base-content/80">Good-to-Have Skills</label>
                        <input 
                            id="good-to-have"
                            type="text"
                            value={goodToHaveSkills}
                            onChange={(e) => setGoodToHaveSkills(e.target.value)}
                            placeholder="e.g., Docker, AWS, TypeScript"
                            className="w-full mt-1 p-2 border border-base-300 rounded-lg focus:ring-1 focus:ring-brand-secondary"
                        />
                         <p className="text-xs text-base-content/60 mt-1">Enter skills separated by commas.</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2 text-base-content">
          Resume
        </label>
        <div className="flex border-b border-base-300">
            <TabButton label="Paste Text" isActive={resumeInputMode === 'text'} onClick={() => setResumeInputMode('text')} />
            <TabButton label="Upload File" isActive={resumeInputMode === 'file'} onClick={() => setResumeInputMode('file')} />
        </div>
        <div className="mt-4">
            {resumeInputMode === 'text' ? (
                 <textarea
                  id="resume"
                  rows={10}
                  className="w-full p-4 border border-base-300 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 bg-white"
                  placeholder="Paste the full resume text here..."
                  value={resume}
                  onChange={(e) => {
                    setResume(e.target.value)
                    setResumeFileName(null);
                  }}
                />
            ) : (
                <FileUpload 
                  id="resume-upload"
                  onFileSelect={(file) => handleFileSelect(file, 'resume')}
                  fileName={resumeFileName}
                  onClear={() => handleClearFile('resume')}
                  isParsing={isParsingResume}
                  parseError={resumeParseError}
                />
            )}
        </div>
      </div>
      
      <AnalysisModeSelector mode={analysisMode} setMode={setAnalysisMode} />
      
      <button
        onClick={onAnalyze}
        disabled={isLoading || isParsingJd || isParsingResume || !jobDescription || !resume}
        className="w-full flex items-center justify-center bg-brand-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-brand-dark transition-transform transform hover:scale-105 duration-300 disabled:bg-base-300 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Check Relevance'
        )}
      </button>
    </div>
  );
};

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
);
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);


export default InputSection;
