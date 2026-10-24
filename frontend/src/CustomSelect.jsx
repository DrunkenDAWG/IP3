import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Enterprise Custom Select Component
 * 
 * Replaces native OS <select> with a polished, keyboard-accessible,
 * theme-aware dropdown matching Linear & Stripe design standards.
 * 
 * @param {Array} options - Array of items: string[] or { value, label, dotColor, badge, icon }[]
 * @param {string|number} value - Selected value
 * @param {function} onChange - Value change callback: (val) => void
 * @param {string} placeholder - Displayed when no value is selected
 * @param {string} variant - 'filter' | 'form' | 'compact' | 'bulk'
 * @param {React.ReactNode} prefixIcon - Icon rendered before the label
 * @param {string} className - Additional CSS class
 * @param {boolean} disabled - Whether the select is disabled
 * @param {string} style - Inline styles
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  variant = 'filter',
  prefixIcon = null,
  className = '',
  disabled = false,
  style = {},
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options into uniform shape: { value, label, dotColor, badge, icon }
  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.label,
          label: opt.label !== undefined ? opt.label : String(opt.value),
          dotColor: opt.dotColor || null,
          badge: opt.badge || null,
          icon: opt.icon || null,
        };
      }
      return {
        value: opt,
        label: String(opt),
        dotColor: null,
        badge: null,
        icon: null,
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(normalizedOptions.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        onChange(normalizedOptions[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.custom-select-option');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-wrapper variant-${variant} ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <div className="custom-select-trigger-content">
          {prefixIcon && <span className="custom-select-prefix-icon">{prefixIcon}</span>}
          
          {selectedOption?.dotColor && (
            <span
              className="custom-select-dot"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}

          <span className={`custom-select-label ${!selectedOption ? 'is-placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span className="custom-select-badge">{selectedOption.badge}</span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`custom-select-arrow ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown" ref={listRef} role="listbox">
          {normalizedOptions.length === 0 ? (
            <div className="custom-select-empty">No options available</div>
          ) : (
            normalizedOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="custom-select-option-content">
                    {opt.dotColor && (
                      <span
                        className="custom-select-dot"
                        style={{ backgroundColor: opt.dotColor }}
                      />
                    )}
                    {opt.icon && <span className="custom-select-option-icon">{opt.icon}</span>}
                    <span className="custom-select-option-label">{opt.label}</span>
                    {opt.badge && <span className="custom-select-badge">{opt.badge}</span>}
                  </div>

                  {isSelected && <Check size={14} className="custom-select-check" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
