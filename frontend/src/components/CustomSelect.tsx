import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function CustomSelect({ value, onChange, options, label, placeholder, className, variant = 'light' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`form-group ${className}`} style={{ position: 'relative' }} ref={containerRef}>
      {label && <label>{label}</label>}
      <div 
        className="modern-select" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: variant === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
          color: variant === 'dark' ? 'white' : 'var(--text-main)',
          borderColor: variant === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--border-light)'
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder || 'Selecione...'}</span>
        <svg 
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className={`suggestions-dropdown ${variant === 'light' ? 'light' : ''}`} style={{ top: '100%', width: '100%', left: 0 }}>
          {options.map(opt => (
            <div 
              key={opt.value} 
              className="suggestion-item" 
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <span className="suggestion-name">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
