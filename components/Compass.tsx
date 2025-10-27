
import React from 'react';

interface CompassProps {
    angle: number;
}

const Compass: React.FC<CompassProps> = ({ angle }) => {
    return (
        <div className="relative w-[150px] h-[150px] rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-700 border-3 border-indigo-500">
            <div
                className="absolute top-1/2 left-1/2 w-1 h-[60px] bg-gradient-to-t from-red-500 to-amber-400 transform-origin-bottom rounded-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)` }}
            ></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">N</div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">S</div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">W</div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">E</div>
        </div>
    );
};

export default Compass;
