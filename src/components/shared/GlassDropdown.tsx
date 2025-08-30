'use client';

import React, { useRef, useState } from 'react';

type Option = { value: string | number; label: string };

type GlassDropdownProps = {
  options: Option[];
  value?: string | number;
  onChange: (v: string | number) => void;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
};

export default function GlassDropdown({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  className = '',
}: GlassDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        className="w-full pl-9 pr-8 py-2 text-left border border-input rounded-[var(--radius-sm)] bg-card/40 backdrop-blur-xl shadow-[0_0_6px_var(--ring)] text-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
        onClick={() => setOpen((o) => !o)}
      >
        {Icon && (
          <Icon
            className="absolute left-3 top-3 w-5 h-5 pointer-events-none"
            style={{ color: 'var(--primary)' }}
          />
        )}
        <span>
          {selected ? (
            selected.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          ▼
        </span>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-[var(--radius-sm)] border border-border bg-card/60 backdrop-blur-xl shadow-lg">
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`px-4 py-2 cursor-pointer text-sm text-foreground hover:bg-primary/10 transition ${
                  value === opt.value ? 'bg-primary/20 font-semibold' : ''
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}