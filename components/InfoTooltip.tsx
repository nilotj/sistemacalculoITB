import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Info size={16} />
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-3 mt-2 -ml-32 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-100 transition-opacity">
          {text}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -top-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;