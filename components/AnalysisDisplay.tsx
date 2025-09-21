

import React from 'react';
import type { AnalysisResult, HistoryItem } from '../types';
import { Verdict } from '../types';
import ScoreGauge from './ScoreGauge';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  historyItem?: HistoryItem;
  onToggleShortlist: (id: string) => void;
}

const getVerdictPillClass = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.HIGH:
      return 'bg-green-100 text-green-800';
    case Verdict.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case Verdict.LOW:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-base-200 text-base-content';
  }
};

const SectionCard: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode, className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-base-100 p-4 rounded-lg animate-slide-in ${className}`}>
        <div className="flex items-center mb-3">
            <div className="text-brand-primary">{icon}</div>
            <h3 className="text-md font-bold text-base-content ml-2">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const SkillList: React.FC<{ skills: string[]; status: 'met' | 'missing' }> = ({ skills, status }) => {
    if (skills.length === 0) {
        return <p className="text-base-content/60 text-sm">None identified.</p>;
    }
    const icon = status === 'met' 
        ? <span className="text-green-500 mr-2 mt-1 flex-shrink-0">&#10003;</span> 
        : <span className="text-red-500 mr-2 mt-1 flex-shrink-0">&#10007;</span>;

    return (
        <ul className="space-y-1.5 text-base-content/90 text-sm">
            {skills.map((skill, index) => (
                <li key={index} className="flex items-start">
                    {icon}
                    <span>{skill}</span>
                </li>
            ))}
        </ul>
    );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, historyItem, onToggleShortlist }) => {
  const { 
      relevanceScore, 
      verdict, 
      mustHaveSkillsMet,
      mustHaveSkillsMissing,
      goodToHaveSkillsMet,
      goodToHaveSkillsMissing,
      otherMatchingSkills,
      feedback 
    } = result;

  const handleShortlistClick = () => {
    if (historyItem) {
      onToggleShortlist(historyItem.id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center p-6 bg-brand-light rounded-xl relative">
        {historyItem && (
            <button 
                onClick={handleShortlistClick}
                className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-500 transition-transform transform hover:scale-110"
                aria-label={historyItem.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            >
                <StarIcon filled={!!historyItem.isShortlisted} />
            </button>
        )}
        <div className="flex items-center justify-center space-x-4">
          <ScoreGauge score={relevanceScore} />
          <div>
            <h2 className="text-2xl font-bold text-base-content">Relevance Score</h2>
            <p className="text-sm text-base-content/70">Candidate Suitability Verdict</p>
             <span className={`mt-2 inline-block px-4 py-1 text-lg font-bold rounded-full ${getVerdictPillClass(verdict)}`}>
              {verdict}
            </span>
          </div>
        </div>
      </div>
      
      { (mustHaveSkillsMet.length > 0 || mustHaveSkillsMissing.length > 0) &&
        <div className="border-2 border-amber-400 bg-amber-50 p-4 rounded-lg animate-slide-in">
             <div className="flex items-center mb-3">
                <div className="text-amber-600"><AlertIcon /></div>
                <h3 className="text-md font-bold text-amber-900 ml-2">Must-Have Skills Check</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold text-green-700 mb-1">Met ({mustHaveSkillsMet.length})</h4>
                    <SkillList skills={mustHaveSkillsMet} status="met" />
                </div>
                 <div>
                    <h4 className="font-semibold text-red-700 mb-1">Missing ({mustHaveSkillsMissing.length})</h4>
                    <SkillList skills={mustHaveSkillsMissing} status="missing" />
                </div>
            </div>
        </div>
      }
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <SectionCard title="Good-to-Have Skills" icon={<CheckIcon />}>
            <div className="space-y-3">
                 <div>
                    <h4 className="font-semibold text-green-700 text-sm mb-1">Met ({goodToHaveSkillsMet.length})</h4>
                    <SkillList skills={goodToHaveSkillsMet} status="met" />
                </div>
                 <div>
                    <h4 className="font-semibold text-red-700 text-sm mb-1">Missing ({goodToHaveSkillsMissing.length})</h4>
                    <SkillList skills={goodToHaveSkillsMissing} status="missing" />
                </div>
            </div>
        </SectionCard>
        
        <SectionCard title="Other Matching Skills" icon={<PlusIcon />}>
            {otherMatchingSkills.length > 0 
              ? <SkillList skills={otherMatchingSkills} status="met" />
              : <p className="text-base-content/60 text-sm">No other specific skills matched.</p>
            }
        </SectionCard>
      </div>

      <SectionCard title="Personalized Feedback" icon={<FeedbackIcon />}>
          <p className="text-base-content/90 whitespace-pre-wrap">{feedback}</p>
      </SectionCard>
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" stroke="currentColor" fill={filled ? "currentColor" : "none"}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);


export default AnalysisDisplay;
