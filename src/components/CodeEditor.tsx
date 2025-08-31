import { useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Import the languages we want to support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  placeholder = "Start writing your code..." 
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (highlightRef.current && language !== 'plaintext') {
      // Clear previous content
      highlightRef.current.innerHTML = '';
      
      // Highlight the code
      const highlighted = Prism.highlight(
        value || ' ', 
        Prism.languages[language] || Prism.languages.plaintext,
        language
      );
      
      highlightRef.current.innerHTML = highlighted;
    }
  }, [value, language]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative h-full w-full bg-editor-bg rounded-lg overflow-hidden border border-border">
      {/* Syntax highlighted background */}
      <pre
        ref={highlightRef}
        className={`absolute inset-0 m-0 pointer-events-none overflow-hidden font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pl-14 pt-4 pr-4 pb-4 ${
          language === 'plaintext' ? 'hidden' : ''
        }`}
        style={{
          color: 'transparent',
          background: 'transparent',
          tabSize: 2,
        }}
        aria-hidden="true"
      />
      
      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        className={`
          relative z-10 w-full h-full resize-none
          bg-transparent text-foreground font-mono text-sm leading-relaxed
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0
          ${language === 'plaintext' ? 'text-foreground pl-14' : 'text-transparent caret-foreground pl-14'}
          whitespace-pre-wrap break-words
        `}
        style={{
          tabSize: 2,
          minHeight: '100%',
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      
      {/* Line numbers overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-editor-line border-r border-border pointer-events-none z-20">
        <div className="pt-4">
          {value.split('\n').map((_, index) => (
            <div
              key={index}
              className="h-6 text-xs text-muted-foreground text-center"
              style={{ lineHeight: '1.5rem' }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}