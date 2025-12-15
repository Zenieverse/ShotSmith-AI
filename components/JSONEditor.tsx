import React, { useState, useEffect } from 'react';
import { ShotParameters } from '../types';

interface JSONEditorProps {
  data: ShotParameters;
  onChange: (newData: ShotParameters) => void;
  readOnly?: boolean;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ data, onChange, readOnly }) => {
  const [text, setText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Sync internal text when prop data changes externally (e.g. from sliders or agents)
  useEffect(() => {
    setText(JSON.stringify(data, null, 2));
    setError(null);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    
    try {
      const parsed = JSON.parse(newVal);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex justify-between items-center bg-slate-800 p-2 border-b border-slate-700">
        <span className="text-slate-300">shot_params.json</span>
        {error && <span className="text-red-400 font-bold">{error}</span>}
        {!error && <span className="text-green-500">VALID</span>}
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        className={`flex-1 w-full bg-[#0b1120] text-slate-300 p-4 outline-none resize-none border-l-4 ${error ? 'border-red-500' : 'border-cyan-500/50'}`}
      />
    </div>
  );
};

export default JSONEditor;