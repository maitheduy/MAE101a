import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`${block ? 'block my-2 overflow-x-auto py-1 text-center' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * TextWithMath helper: automatically parses text containing $math$ and $$math$$ and renders them
 */
export const TextWithMath: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    if (!text) return [];
    
    // Split by $$...$$ or $...$
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const splitParts = text.split(regex);

    return splitParts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        return <MathView key={index} math={formula} block={true} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim();
        return <MathView key={index} math={formula} block={false} />;
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }, [text]);

  return <div className={`leading-relaxed ${className}`}>{parts}</div>;
};
