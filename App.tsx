

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { AnalysisResult, HistoryItem, AnalysisMode } from './types';
import { analyzeResume } from './services/geminiService';
import Header from './components/Header';
import InputSection from './components/InputSection';
import AnalysisDisplay from './components/AnalysisDisplay';
import Welcome from './components/Welcome';
import ErrorDisplay from './components/ErrorDisplay';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resume, setResume] = useState<string>('');
  const [mustHaveSkills, setMustHaveSkills] = useState<string>('');
  const [goodToHaveSkills, setGoodToHaveSkills] = useState<string>('');
  const [jdFileName, setJdFileName] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('Balanced');


  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('analysisHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  }, [history]);

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      setError('Please provide both a job description and a resume.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSelectedHistoryId(null);

    try {
      const temperatureMap: Record<AnalysisMode, number> = {
        'Precise': 0.1,
        'Balanced': 0.5,
        'Creative': 0.9,
      };
      const temperature = temperatureMap[analysisMode];
      const result = await analyzeResume(jobDescription, resume, mustHaveSkills, goodToHaveSkills, temperature);
      setAnalysisResult(result);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        jobDescriptionTitle: jobDescription.split('\n')[0].substring(0, 50) + '...',
        resumeIdentifier: resumeFileName || 'Pasted Resume',
        result: result,
        timestamp: new Date().toISOString(),
        isShortlisted: false,
      };

      const newHistory = [newHistoryItem, ...history];
      setHistory(newHistory);
      setSelectedHistoryId(newHistoryItem.id);

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`An error occurred during analysis: ${e.message}`);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, resume, history, resumeFileName, analysisMode, mustHaveSkills, goodToHaveSkills]);

  const handleSelectHistory = (id: string) => {
    const selectedItem = history.find(item => item.id === id);
    if (selectedItem) {
      setAnalysisResult(selectedItem.result);
      setSelectedHistoryId(id);
      setError(null);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setAnalysisResult(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setSelectedHistoryId(null);
    setAnalysisResult(null);
  };
  
  const handleToggleShortlist = (id: string) => {
    setHistory(prevHistory => 
        prevHistory.map(item => 
            item.id === id ? { ...item, isShortlisted: !item.isShortlisted } : item
        )
    );
  };

  const filteredHistory = useMemo(() => {
    if (showShortlistedOnly) {
      return history.filter(item => item.isShortlisted);
    }
    return history;
  }, [history, showShortlistedOnly]);

  const currentHistoryItem = useMemo(() => {
    return history.find(item => item.id === selectedHistoryId);
  }, [history, selectedHistoryId]);


  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resume={resume}
          setResume={setResume}
          mustHaveSkills={mustHaveSkills}
          setMustHaveSkills={setMustHaveSkills}
          goodToHaveSkills={goodToHaveSkills}
          setGoodToHaveSkills={setGoodToHaveSkills}
          jdFileName={jdFileName}
          setJdFileName={setJdFileName}
          resumeFileName={resumeFileName}
          setResumeFileName={setResumeFileName}
          analysisMode={analysisMode}
          setAnalysisMode={setAnalysisMode}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />
        <div className="bg-white rounded-2xl shadow-lg border border-base-200 flex flex-col min-h-[70vh] overflow-hidden">
          <div className="flex-grow p-6">
            {error && <ErrorDisplay message={error} />}
            {!isLoading && !analysisResult && !error && <Welcome />}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                    <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg text-base-content/80 font-semibold">Analyzing... a detailed report is being generated.</p>
                </div>
            )}
            {analysisResult && !isLoading && (
              <AnalysisDisplay 
                result={analysisResult} 
                historyItem={currentHistoryItem}
                onToggleShortlist={handleToggleShortlist}
              />
            )}
          </div>
          <div className="flex-shrink-0 border-t border-base-200 bg-base-100/50">
             <HistoryPanel 
                history={filteredHistory}
                selectedId={selectedHistoryId}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
                onToggleShortlist={handleToggleShortlist}
                isFilterActive={showShortlistedOnly}
                onToggleFilter={() => setShowShortlistedOnly(prev => !prev)}
             />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
