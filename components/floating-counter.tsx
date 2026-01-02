'use client';

import { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';

export function FloatingCounter() {
    const [count, setCount] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await fetch('/api/portfolio/count');
                const data = await response.json();
                setCount(data.count ?? 0);
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to fetch portfolio count:', error);
                setCount(0);
                setIsLoaded(true);
            }
        };

        fetchCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isLoaded) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center gap-2 px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full shadow-lg">
                <FaUsers className="w-4 h-4 text-white/70" />
                <span className="text-white/80 font-medium text-sm">
                    Portfolios Generated
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {count.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

