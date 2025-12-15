import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const SliderControl: React.FC<SliderControlProps> = ({ 
  label, value, min, max, step = 1, unit = "", onChange, disabled = false 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-wider text-slate-400 font-mono">
        <label>{label}</label>
        <span className="text-cyan-400">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 disabled:opacity-50"
      />
    </div>
  );
};

export default SliderControl;