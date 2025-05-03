import { useMemo } from 'react';

export default function NixieDisplay({ digits }) {

  const flickerClasses = ['flicker-soft', 'flicker-medium', 'flicker-hard', 'flicker-none'];

  const tubes = useMemo(() => 
    digits.split('').map((digit, index) => {
      const randomClass = flickerClasses[Math.floor(Math.random() * flickerClasses.length)];
      return (
        <div className="tube" key={index}>
          <div className={`digit active ${randomClass}`}>
            {digit}
          </div>
        </div>
      );
    }), [digits]
  );

  return (
    <div className="nixie-container">
      {tubes}
    </div>
  );
}
