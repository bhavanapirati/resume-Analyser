
import React, { useState, useEffect } from 'react';

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = 50;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    
    useEffect(() => {
        const animation = requestAnimationFrame(() => {
            setAnimatedScore(score);
        });
        return () => cancelAnimationFrame(animation);
    }, [score]);

    const offset = circumference - (animatedScore / 100) * circumference;
    
    const getColor = (s: number) => {
        if (s >= 75) return 'text-green-500';
        if (s >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle
                    className="text-base-200"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${getColor(score)} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <span className={`absolute text-3xl font-bold ${getColor(score)}`}>
                {score}
            </span>
        </div>
    );
};

export default ScoreGauge;
