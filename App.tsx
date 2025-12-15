import React, { useState, useCallback, useEffect } from 'react';
import { AgentStatus, Shot, ShotParameters } from './types';
import { DEFAULT_SHOT_PARAMS, PRESETS } from './constants';
import { generateShotParams, generateFiboImage } from './services/geminiService';
import SliderControl from './components/SliderControl';
import JSONEditor from './components/JSONEditor';

// --- Icons ---
const CameraIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const LightIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ColorIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const GridIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const MagicIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const RefreshIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const EyeIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const SplitIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const CodeIcon = () => <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

function App() {
  // --- State ---
  const [intent, setIntent] = useState("");
  const [params, setParams] = useState<ShotParameters>(DEFAULT_SHOT_PARAMS);
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [shotHistory, setShotHistory] = useState<Shot[]>([]);
  
  // TABS
  const [viewTab, setViewTab] = useState<'visual' | 'compare' | 'code'>('visual');
  const [controlTab, setControlTab] = useState<'camera' | 'lighting' | 'color' | 'composition'>('camera');
  const [isHDR, setIsHDR] = useState(true);

  // --- Handlers ---

  // 1. Intent -> JSON (Agents)
  const handleTranslate = useCallback(async () => {
    if (!intent.trim()) return;
    
    setStatus(AgentStatus.ANALYZING);
    try {
      setTimeout(() => setStatus(AgentStatus.CALCULATING), 1000);
      
      const newParams = await generateShotParams(intent);
      setParams(newParams);
      setStatus(AgentStatus.IDLE);
      triggerRender(newParams);
    } catch (e) {
      console.error(e);
      setStatus(AgentStatus.ERROR);
    }
  }, [intent]);

  // 2. JSON -> Image (FIBO Render)
  const triggerRender = useCallback(async (renderParams: ShotParameters) => {
    setStatus(AgentStatus.GENERATING);
    try {
      const base64Img = await generateFiboImage(renderParams);
      setCurrentImage(base64Img);
      
      const newShot: Shot = {
        id: Date.now().toString(),
        name: `Shot ${shotHistory.length + 1}`,
        intent: intent || "Manual Adjustment",
        params: renderParams,
        imageUrl: base64Img,
        timestamp: Date.now()
      };
      
      setShotHistory(prev => [newShot, ...prev]);
      setStatus(AgentStatus.COMPLETE);
    } catch (e) {
      console.error(e);
      setStatus(AgentStatus.ERROR);
    }
  }, [intent, shotHistory.length]);

  // 3. Manual Parameter Updates
  const handleParamUpdate = useCallback((newParams: ShotParameters) => {
    setParams(newParams);
  }, []);

  const updateCamera = (key: keyof ShotParameters['camera'], value: number | string) => {
    handleParamUpdate({
      ...params,
      camera: { ...params.camera, [key]: value }
    });
  };

  const updateLighting = (light: 'key' | 'fill' | 'rim', key: 'intensity' | 'angle_deg', value: number) => {
    handleParamUpdate({
      ...params,
      lighting: {
        ...params.lighting,
        [light]: { ...params.lighting[light], [key]: value }
      }
    });
  };

  const updateColor = (key: keyof ShotParameters['color'], value: any) => {
    handleParamUpdate({
      ...params,
      color: { ...params.color, [key]: value }
    });
  };

  const updateComposition = (key: keyof ShotParameters['composition'], value: any) => {
    handleParamUpdate({
      ...params,
      composition: { ...params.composition, [key]: value }
    });
  };

  const renderVisualContent = () => {
    if (viewTab === 'code') {
      return (
        <div className="w-full h-full p-6 bg-[#0d1117] overflow-auto">
          <JSONEditor data={params} onChange={handleParamUpdate} />
        </div>
      );
    }

    if (viewTab === 'compare') {
      const previousShot = shotHistory.length > 1 ? shotHistory[1] : null;
      return (
        <div className="flex w-full h-full">
           {/* Current */}
           <div className="flex-1 border-r border-slate-700 relative bg-black flex flex-col">
              <div className="absolute top-2 left-2 bg-black/60 text-cyan-400 text-xs px-2 py-1 rounded z-10 font-bold border border-cyan-500/30">CURRENT</div>
              {currentImage ? (
                <img src={currentImage} className="w-full h-full object-contain" alt="Current" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Waiting for Render</div>
              )}
           </div>
           {/* Previous */}
           <div className="flex-1 relative bg-black flex flex-col">
              <div className="absolute top-2 left-2 bg-black/60 text-slate-400 text-xs px-2 py-1 rounded z-10 font-bold border border-slate-700">PREVIOUS</div>
              {previousShot?.imageUrl ? (
                <img src={previousShot.imageUrl} className="w-full h-full object-contain opacity-80 grayscale-[30%]" alt="Previous" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs italic">No history yet</div>
              )}
           </div>
        </div>
      );
    }

    // Default 'visual'
    return currentImage ? (
      <div className="relative shadow-2xl group max-w-[95%] max-h-[95%]">
        <img src={currentImage} alt="Generated Shot" className="rounded-sm max-w-full max-h-full border border-slate-800" />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-3 py-1.5 rounded backdrop-blur border border-white/10">
          <div className="font-bold text-cyan-400">{params.camera.lens_mm}mm</div>
          <div className="text-[10px] text-slate-300">f/2.8 • {params.camera.angle}</div>
        </div>
      </div>
    ) : (
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-600 rounded-full animate-spin mb-4 mx-auto opacity-50"></div>
        <p className="text-slate-600 uppercase tracking-widest text-xs">Waiting for Render...</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-sm">
      
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-600 rounded-md flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">ShotSmith AI</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest">FIBO Native Architecture</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center transition-colors ${status === AgentStatus.IDLE || status === AgentStatus.COMPLETE ? 'bg-slate-800 text-slate-400' : 'bg-amber-900/50 text-amber-400 border border-amber-500/20'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${status === AgentStatus.IDLE || status === AgentStatus.COMPLETE ? 'bg-slate-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {status}
           </div>
           <button 
             onClick={() => triggerRender(params)}
             disabled={status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETE}
             className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-cyan-900/20"
           >
             <RefreshIcon />
             Re-Render Shot
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Narrative & Intent */}
        <section className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20 shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mr-2 text-[10px]">1</span>
              Creative Intent
            </h2>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-slate-600 mb-3 text-xs leading-relaxed"
              rows={6}
              placeholder="Describe your scene... e.g. 'Cyberpunk detective standing in rain, neon lights reflect on trench coat, 50mm lens'"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            />
            <button 
              onClick={handleTranslate}
              disabled={!intent || (status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETE)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-900/30 hover:border-cyan-500/50 py-2 rounded-md font-medium transition-all flex items-center justify-center text-xs uppercase tracking-wide"
            >
              <MagicIcon />
              Generate Parameters
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Quick Presets</h3>
            <div className="space-y-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setIntent(preset.prompt)}
                  className="w-full text-left p-3 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all group"
                >
                  <div className="text-slate-300 font-medium text-xs group-hover:text-cyan-400 transition-colors">{preset.label}</div>
                  <div className="text-[10px] text-slate-600 mt-1 truncate group-hover:text-slate-500">{preset.prompt}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Shot History */}
          <div className="h-48 border-t border-slate-800 p-3 overflow-y-auto bg-[#0b1120] custom-scrollbar">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-[#0b1120] py-1 z-10">Shot History</h3>
             <div className="grid grid-cols-2 gap-2">
                {shotHistory.map((shot, i) => (
                   <div 
                      key={shot.id} 
                      onClick={() => { setParams(shot.params); setCurrentImage(shot.imageUrl || null); setIntent(shot.intent); }} 
                      className={`cursor-pointer group relative aspect-video bg-slate-800 rounded overflow-hidden border transition-all ${currentImage === shot.imageUrl ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-700 hover:border-slate-500'}`}
                   >
                      {shot.imageUrl ? (
                        <img src={shot.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">Pending</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <span className="text-[10px] text-white font-bold truncate">Shot {shotHistory.length - i}</span>
                        <span className="text-[9px] text-slate-400 truncate">{shot.params.camera.lens_mm}mm</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </section>

        {/* CENTER PANEL: Preview */}
        <section className="flex-1 bg-black flex flex-col relative z-0">
          {/* Viewport Tabs */}
          <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
             <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-white/10 pointer-events-auto flex shadow-xl">
                <button 
                  onClick={() => setViewTab('visual')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'visual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <EyeIcon /> Viewport
                </button>
                <button 
                  onClick={() => setViewTab('compare')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'compare' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <SplitIcon /> Compare
                </button>
                <button 
                  onClick={() => setViewTab('code')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <CodeIcon /> JSON
                </button>
             </div>
          </div>

          {/* HDR Toggle (Right aligned) */}
          <div className="absolute top-4 right-4 z-20 pointer-events-auto">
             <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex items-center space-x-2 px-3 shadow-xl cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsHDR(!isHDR)}>
               <div className={`w-2 h-2 rounded-full ${isHDR ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-600'}`}></div>
               <span className={`text-[10px] font-bold ${isHDR ? 'text-cyan-400' : 'text-slate-500'}`}>ACEScg / {isHDR ? '16-bit' : '8-bit'}</span>
             </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] overflow-hidden">
             {renderVisualContent()}
          </div>
          
          {/* Timeline Bar */}
          <div className="h-8 bg-slate-900 border-t border-slate-800 flex items-center px-4 space-x-1 shrink-0 overflow-hidden">
            {Array.from({length: 40}).map((_, i) => (
               <div key={i} className={`w-[2px] rounded-full ${i % 5 === 0 ? 'bg-slate-500 h-3' : 'bg-slate-800 h-1.5'}`}></div>
            ))}
            <div className="ml-auto text-[10px] font-mono text-cyan-500/80">TIMECODE: 01:04:22:15</div>
          </div>
        </section>

        {/* RIGHT PANEL: Controls */}
        <section className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
               <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mr-2 text-[10px]">2</span>
               Control Panel
            </h2>
          </div>

          {/* Control Tabs */}
          <div className="flex bg-slate-950 border-b border-slate-800">
            {[
              { id: 'camera', icon: CameraIcon, label: 'Cam' },
              { id: 'lighting', icon: LightIcon, label: 'Light' },
              { id: 'color', icon: ColorIcon, label: 'Color' },
              { id: 'composition', icon: GridIcon, label: 'Comp' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setControlTab(tab.id as any)}
                className={`flex-1 py-3 flex flex-col items-center justify-center border-b-2 transition-colors ${controlTab === tab.id ? 'border-cyan-500 text-cyan-400 bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
              >
                <tab.icon />
                <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/50">
            
            {/* CAMERA TAB */}
            {controlTab === 'camera' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-cyan-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-cyan-900/30 pb-2">Camera Physics</h3>
                <SliderControl label="Focal Length" value={params.camera.lens_mm} min={12} max={200} unit="mm" onChange={(v) => updateCamera('lens_mm', v)} />
                <SliderControl label="Field of View" value={params.camera.fov_deg} min={10} max={120} unit="°" onChange={(v) => updateCamera('fov_deg', v)} />
                <SliderControl label="Camera Height" value={params.camera.camera_height_m} min={0.1} max={5} step={0.1} unit="m" onChange={(v) => updateCamera('camera_height_m', v)} />
                
                <div className="pt-2">
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Shot Type</label>
                   <div className="grid grid-cols-2 gap-2">
                     {['extreme_wide', 'wide', 'medium', 'close_up', 'extreme_close_up'].map(type => (
                       <button 
                         key={type}
                         onClick={() => updateCamera('shot_type', type)}
                         className={`text-[9px] uppercase py-2 px-2 border rounded transition-all ${params.camera.shot_type === type ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                       >
                         {type.replace(/_/g, ' ')}
                       </button>
                     ))}
                   </div>
                </div>

                 <div className="pt-2">
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Angle</label>
                   <select 
                     value={params.camera.angle}
                     onChange={(e) => updateCamera('angle', e.target.value)}
                     className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-cyan-500"
                   >
                     <option value="eye_level">Eye Level</option>
                     <option value="low_angle">Low Angle</option>
                     <option value="high_angle">High Angle</option>
                     <option value="bird_eye">Bird's Eye</option>
                     <option value="dutch_angle">Dutch Angle</option>
                     <option value="worm_eye">Worm's Eye</option>
                   </select>
                </div>
              </div>
            )}

            {/* LIGHTING TAB */}
            {controlTab === 'lighting' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-amber-900/30 pb-2">Studio Lighting</h3>
                
                <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Key Light</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_orange]"></span>
                  </div>
                  <SliderControl label="Intensity" value={params.lighting.key.intensity} min={0} max={2} step={0.1} onChange={(v) => updateLighting('key', 'intensity', v)} />
                  <SliderControl label="Angle" value={params.lighting.key.angle_deg} min={-180} max={180} unit="°" onChange={(v) => updateLighting('key', 'angle_deg', v)} />
                </div>
                
                <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Fill Light</span>
                     <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]"></span>
                  </div>
                  <SliderControl label="Intensity" value={params.lighting.fill.intensity} min={0} max={1} step={0.05} onChange={(v) => updateLighting('fill', 'intensity', v)} />
                  <SliderControl label="Angle" value={params.lighting.fill.angle_deg} min={-180} max={180} unit="°" onChange={(v) => updateLighting('fill', 'angle_deg', v)} />
                </div>

                <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Rim Light</span>
                     <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_purple]"></span>
                   </div>
                  <SliderControl label="Intensity" value={params.lighting.rim.intensity} min={0} max={2} step={0.1} onChange={(v) => updateLighting('rim', 'intensity', v)} />
                  <SliderControl label="Angle" value={params.lighting.rim.angle_deg} min={-180} max={180} unit="°" onChange={(v) => updateLighting('rim', 'angle_deg', v)} />
                </div>
              </div>
            )}

            {/* COLOR TAB */}
            {controlTab === 'color' && (
              <div className="space-y-6 animate-fadeIn">
                 <h3 className="text-pink-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-pink-900/30 pb-2">Color Grading</h3>
                 
                 <div>
                    <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Working Space</label>
                    <select 
                      value={params.color.space}
                      onChange={(e) => updateColor('space', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-pink-500"
                    >
                      <option value="ACEScg">ACEScg (Cinema)</option>
                      <option value="Rec.2020">Rec.2020 (HDR)</option>
                      <option value="sRGB">sRGB (Web)</option>
                      <option value="P3-D65">Display P3</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Bit Depth</label>
                    <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                      {[8, 16, 32].map(bit => (
                        <button
                          key={bit}
                          onClick={() => updateColor('bit_depth', bit)}
                          className={`flex-1 text-[10px] py-1 rounded transition-all ${params.color.bit_depth === bit ? 'bg-slate-700 text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {bit}-bit
                        </button>
                      ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Palette Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {params.color.palette.map((color, i) => (
                         <span key={i} className="text-[10px] bg-slate-800 text-pink-300 px-2 py-1 rounded border border-pink-500/20 flex items-center">
                           {color}
                           <button onClick={() => {
                             const newPalette = params.color.palette.filter((_, idx) => idx !== i);
                             updateColor('palette', newPalette);
                           }} className="ml-1 text-pink-500 hover:text-white">×</button>
                         </span>
                       ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="+ Add tag (press enter)"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-pink-500 placeholder-slate-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                             updateColor('palette', [...params.color.palette, val]);
                             e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                 </div>
              </div>
            )}

            {/* COMPOSITION TAB */}
            {controlTab === 'composition' && (
               <div className="space-y-6 animate-fadeIn">
                <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-emerald-900/30 pb-2">Framing & Layout</h3>
                
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-800">
                  <label className="text-xs text-slate-400 uppercase font-bold">Rule of Thirds</label>
                  <button 
                    onClick={() => updateComposition('rule_of_thirds', !params.composition.rule_of_thirds)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${params.composition.rule_of_thirds ? 'bg-emerald-600' : 'bg-slate-700'}`}
                  >
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-1 left-1 transition-transform ${params.composition.rule_of_thirds ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                <div>
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Subject Position</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['left_third', 'center', 'right_third'].map(pos => (
                         <button 
                           key={pos}
                           onClick={() => updateComposition('subject_position', pos)}
                           className={`h-20 border rounded flex items-center justify-center relative transition-all ${params.composition.subject_position === pos ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-700 bg-slate-950 hover:bg-slate-900'}`}
                         >
                            <div className={`w-1 h-full absolute top-0 bottom-0 bg-slate-800 ${pos === 'left_third' ? 'left-1/3' : 'hidden'}`}></div>
                            <div className={`w-1 h-full absolute top-0 bottom-0 bg-slate-800 ${pos === 'right_third' ? 'right-1/3' : 'hidden'}`}></div>
                            
                            {/* The subject dot */}
                            <div className={`w-3 h-3 rounded-full ${params.composition.subject_position === pos ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`}></div>
                         </button>
                      ))}
                   </div>
                   <div className="flex justify-between text-[9px] text-slate-500 mt-1 px-2">
                      <span>Left</span>
                      <span>Center</span>
                      <span>Right</span>
                   </div>
                </div>

                <div>
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Negative Space</label>
                   <select 
                     value={params.composition.negative_space}
                     onChange={(e) => updateComposition('negative_space', e.target.value)}
                     className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-emerald-500"
                   >
                     <option value="none">Balanced (None)</option>
                     <option value="left">Left Side</option>
                     <option value="right">Right Side</option>
                     <option value="top">Top (Headroom)</option>
                   </select>
                </div>

              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}

export default App;