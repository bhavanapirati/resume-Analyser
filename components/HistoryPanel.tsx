
import React from 'react';
import type { HistoryItem } from '../types';
import { Verdict } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onToggleShortlist: (id: string) => void;
  isFilterActive: boolean;
  onToggleFilter: () => void;
}

const getVerdictChipClass = (verdict: Verdict) => {
  switch (verdict) {
    case Verdict.HIGH: return 'bg-green-200 text-green-800';
    case Verdict.MEDIUM: return 'bg-yellow-200 text-yellow-800';
    case Verdict.LOW: return 'bg-red-200 text-red-800';
  }
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, selectedId, onSelect, onDelete, onClear, onToggleShortlist, isFilterActive, onToggleFilter }) => {
  
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent onSelect from firing
    action();
  }

  return (
    <div className="p-4 h-64 flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-lg font-bold text-base-content">Analysis History</h3>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isFilterActive ? 'text-brand-primary' : 'text-base-content/60'}`}>
                    Show Shortlisted
                </span>
                <button
                    onClick={onToggleFilter}
                    role="switch"
                    aria-checked={isFilterActive}
                    className={`${isFilterActive ? 'bg-brand-primary' : 'bg-base-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                    <span className={`${isFilterActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            {history.length > 0 && !isFilterActive && (
                <button 
                  onClick={onClear}
                  className="text-sm font-semibold text-brand-secondary hover:text-brand-dark transition-colors"
                >
                  Clear All
                </button>
            )}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-1">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-base-content/60 text-center">
            {isFilterActive 
                ? <p>No shortlisted candidates found.</p>
                : <p>No history yet. Your analyses will appear here.</p>
            }
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${selectedId === item.id ? 'bg-brand-light' : 'hover:bg-base-200'}`}
                >
                  <div className="flex-grow overflow-hidden flex items-center space-x-3">
                     <button 
                       onClick={(e) => handleActionClick(e, () => onToggleShortlist(item.id))}
                       className="text-yellow-400 hover:text-yellow-500 transition-transform transform hover:scale-110 flex-shrink-0"
                       aria-label={item.isShortlisted ? `Remove ${item.resumeIdentifier} from shortlist` : `Add ${item.resumeIdentifier} to shortlist`}
                     >
                        <StarIcon filled={!!item.isShortlisted} />
                     </button>
                    <div className="flex-grow overflow-hidden">
                        <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerdictChipClass(item.result.verdict)}`}>
                                {item.result.verdict.toUpperCase()}
                            </span>
                            <p className="font-semibold text-base-content truncate">{item.resumeIdentifier}</p>
                        </div>
                         <p className="text-xs text-base-content/60 truncate mt-1">vs: {item.jobDescriptionTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-4">
                     <span className="font-bold text-lg text-brand-primary">{item.result.relevanceScore}</span>
                     <button 
                       onClick={(e) => handleActionClick(e, () => onDelete(item.id))}
                       className="ml-4 text-base-content/40 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                       aria-label={`Delete analysis for ${item.resumeIdentifier}`}
                     >
                        <TrashIcon />
                     </button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill={filled ? "currentColor" : "none"}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);


export default HistoryPanel;