"use client";

interface RegistrarSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}

export default function RegistrarSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
}: RegistrarSearchInputProps) {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#06264A] focus:ring-2 focus:ring-[#06264A]/15"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      >
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path strokeLinecap="round" d="m16 16 4 4" />
      </svg>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={`Clear ${ariaLabel.toLowerCase()}`}
          className="registrar-search-clear absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-3.5"
          >
            <path strokeLinecap="round" d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      )}
    </div>
  );
}
