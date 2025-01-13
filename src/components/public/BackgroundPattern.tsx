import React from 'react';

const BackgroundPattern: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <svg
                className="absolute w-full h-full opacity-[0.15] dark:opacity-[0.1]"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Main Pattern Group */}
                <g className="text-gray-900 dark:text-white">
                    {/* Concentric Diamonds */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const size = 100 + i * 150; // Increasing size for each diamond
                        return (
                            <path
                                key={`diamond-${i}`}
                                d={`M500,${500 - size} L${500 + size},500 L500,${500 + size} L${500 - size},500 Z`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                opacity={0.2 + (5 - i) * 0.05} // Decreasing opacity for outer diamonds
                            />
                        );
                    })}

                    {/* Simple Grid Pattern */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <g key={`grid-${i}`}>
                            <line
                                x1={i * 125}
                                y1="0"
                                x2={i * 125}
                                y2="1000"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                opacity="0.1"
                            />
                            <line
                                x1="0"
                                y1={i * 125}
                                x2="1000"
                                y2={i * 125}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                opacity="0.1"
                            />
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default BackgroundPattern;
