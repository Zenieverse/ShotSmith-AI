import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AgentStatus, Shot, ShotParameters } from './types';
import { DEFAULT_SHOT_PARAMS, PRESETS } from './constants';
import { generateShotParams, generateFiboImage, generateVeoVideo, editImageWithPrompt, LiveSession, ensureApiKey } from './services/geminiService';
import SliderControl from './components/SliderControl';
import JSONEditor from './components/JSONEditor';
import { ChatInterface } from './components/ChatInterface';

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
const VideoIcon = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const MicIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const ChatIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

function App() {
  // --- State ---
  const [intent, setIntent] = useState("");
  const [params, setParams] = useState<ShotParameters>(DEFAULT_SHOT_PARAMS);
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [shotHistory, setShotHistory] = useState<Shot[]>([]);
  
  // Tabs & Modes
  const [viewTab, setViewTab] = useState<'visual' | 'compare' | 'code'>('visual');
  const [controlTab, setControlTab] = useState<'camera' | 'lighting' | 'color' | 'composition'>('camera');
  const [isHDR, setIsHDR] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Live Session
  const liveSession = useRef<LiveSession | null>(null);

  // --- Handlers ---
  const handleServiceError = async (e: any) => {
    console.error(e);
    setStatus(AgentStatus.ERROR);
    if (e.message?.includes('403') || e.status === 403 || e.message?.includes('permission')) {
       // Force key re-selection
       await ensureApiKey(true);
       alert("Permission denied or API Key invalid. Please select a valid paid API Key and try again.");
    } else {
       alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  // Live API Toggle
  const toggleLive = useCallback(async () => {
    if (isLive) {
       liveSession.current?.disconnect();
       setIsLive(false);
    } else {
       liveSession.current = new LiveSession(
         (text) => console.log(text),
         (status) => console.log(status)
       );
       try {
         await liveSession.current.connect();
         setIsLive(true);
       } catch (e: any) {
         handleServiceError(e);
         setIsLive(false);
       }
    }
  }, [isLive]);

  // 1. Intent -> JSON
  const handleTranslate = useCallback(async () => {
    if (!intent.trim()) return;
    setStatus(AgentStatus.ANALYZING);
    try {
      const newParams = await generateShotParams(intent);
      setParams(newParams);
      setStatus(AgentStatus.IDLE);
      triggerRender(newParams);
    } catch (e) {
      handleServiceError(e);
    }
  }, [intent]);

  // 2. Render Image (Gemini 3 Pro)
  const triggerRender = useCallback(async (renderParams: ShotParameters) => {
    setStatus(AgentStatus.GENERATING);
    setCurrentVideo(null); // Clear video when rendering new still
    try {
      const base64Img = await generateFiboImage(renderParams);
      setCurrentImage(base64Img);
      
      const newShot: Shot = {
        id: Date.now().toString(),
        name: `Shot ${shotHistory.length + 1}`,
        intent: intent || "Manual Adjustment",
        params: renderParams,
        imageUrl: base64Img,
        timestamp: Date.now(),
        type: 'image'
      };
      
      setShotHistory(prev => [newShot, ...prev]);
      setStatus(AgentStatus.COMPLETE);
    } catch (e) {
      handleServiceError(e);
    }
  }, [intent, shotHistory.length]);

  // 3. Generate Video (Veo)
  const handleAnimate = async () => {
    if (!currentImage) return;
    setStatus(AgentStatus.ANIMATING);
    try {
      const videoUrl = await generateVeoVideo(intent, currentImage);
      setCurrentVideo(videoUrl);
      
      // Add video to history
      const newShot: Shot = {
        id: Date.now().toString(),
        name: `Video ${shotHistory.length + 1}`,
        intent: intent || "Animation",
        params: params,
        imageUrl: currentImage,
        videoUrl: videoUrl,
        timestamp: Date.now(),
        type: 'video'
      };
      setShotHistory(prev => [newShot, ...prev]);
      setStatus(AgentStatus.COMPLETE);
    } catch (e) {
      handleServiceError(e);
    }
  };

  // 4. Edit Image (Gemini 2.5 Flash)
  const handleEdit = async () => {
     if (!editPrompt || !currentImage) return;
     setStatus(AgentStatus.EDITING);
     try {
       const newImage = await editImageWithPrompt(currentImage, editPrompt);
       setCurrentImage(newImage);
       setEditPrompt("");
       setIsEditing(false);
       setStatus(AgentStatus.COMPLETE);
     } catch (e) {
       handleServiceError(e);
     }
  };

  const handleParamUpdate = useCallback((newParams: ShotParameters) => {
    setParams(newParams);
  }, []);

  const updateCamera = (key: keyof ShotParameters['camera'], value: any) => handleParamUpdate({ ...params, camera: { ...params.camera, [key]: value } });
  const updateFormat = (key: keyof ShotParameters['format'], value: any) => handleParamUpdate({ ...params, format: { ...params.format, [key]: value } });
  const updateLighting = (light: 'key' | 'fill' | 'rim', key: 'intensity' | 'angle_deg', value: any) => handleParamUpdate({ ...params, lighting: { ...params.lighting, [light]: { ...params.lighting[light], [key]: value } } });
  const updateColor = (key: keyof ShotParameters['color'], value: any) => handleParamUpdate({ ...params, color: { ...params.color, [key]: value } });
  const updateComposition = (key: keyof ShotParameters['composition'], value: any) => handleParamUpdate({ ...params, composition: { ...params.composition, [key]: value } });

  // Render Viewport Content
  const renderVisualContent = () => {
    if (viewTab === 'code') return <div className="w-full h-full p-6 bg-[#0d1117] overflow-auto"><JSONEditor data={params} onChange={handleParamUpdate} /></div>;

    if (viewTab === 'compare') {
      const previousShot = shotHistory.length > 1 ? shotHistory[1] : null;
      return (
        <div className="flex w-full h-full">
           <div className="flex-1 border-r border-slate-700 relative bg-black flex flex-col">
              <div className="absolute top-2 left-2 bg-black/60 text-cyan-400 text-xs px-2 py-1 rounded z-10 font-bold border border-cyan-500/30">CURRENT</div>
              {currentVideo ? (
                 <video src={currentVideo} controls autoPlay loop className="w-full h-full object-contain" />
              ) : currentImage ? (
                <img src={currentImage} className="w-full h-full object-contain" alt="Current" />
              ) : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Waiting for Render</div>}
           </div>
           <div className="flex-1 relative bg-black flex flex-col">
              <div className="absolute top-2 left-2 bg-black/60 text-slate-400 text-xs px-2 py-1 rounded z-10 font-bold border border-slate-700">PREVIOUS</div>
              {previousShot?.videoUrl ? (
                <video src={previousShot.videoUrl} controls className="w-full h-full object-contain opacity-80" />
              ) : previousShot?.imageUrl ? (
                <img src={previousShot.imageUrl} className="w-full h-full object-contain opacity-80 grayscale-[30%]" alt="Previous" />
              ) : <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs italic">No history yet</div>}
           </div>
        </div>
      );
    }

    // Default 'visual'
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {currentVideo ? (
           <div className="relative shadow-2xl group max-w-[95%] max-h-[95%]">
              <video src={currentVideo} controls autoPlay loop className="rounded-sm max-w-full max-h-full border border-slate-800" />
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse">VEO GENERATED</div>
           </div>
        ) : currentImage ? (
          <div className="relative shadow-2xl group max-w-[95%] max-h-[95%]">
            <img src={currentImage} alt="Generated Shot" className="rounded-sm max-w-full max-h-full border border-slate-800" />
            
            {/* Edit Overlay */}
            {isEditing && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 p-2 rounded border border-cyan-500/50 flex gap-2">
                 <input 
                   autoFocus
                   className="flex-1 bg-transparent text-xs text-white outline-none" 
                   placeholder="Describe change (e.g. 'Add a red flare')" 
                   value={editPrompt}
                   onChange={e => setEditPrompt(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleEdit()}
                 />
                 <button onClick={handleEdit} className="text-cyan-400 hover:text-white text-xs font-bold">APPLY</button>
                 <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white text-xs">CANCEL</button>
              </div>
            )}

            {!isEditing && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => setIsEditing(true)} className="bg-black/80 text-white text-xs px-3 py-1.5 rounded backdrop-blur border border-white/10 hover:bg-cyan-900/80">
                    Edit Image
                 </button>
                 <button onClick={handleAnimate} className="bg-black/80 text-white text-xs px-3 py-1.5 rounded backdrop-blur border border-white/10 hover:bg-purple-900/80 flex items-center">
                    <VideoIcon /> Animate (Veo)
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-600 rounded-full animate-spin mb-4 mx-auto opacity-50"></div>
            <p className="text-slate-600 uppercase tracking-widest text-xs">Waiting for Render...</p>
          </div>
        )}
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
        <div className="flex items-center space-x-3">
           {/* Status Indicator */}
           <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center transition-colors ${status === AgentStatus.IDLE || status === AgentStatus.COMPLETE ? 'bg-slate-800 text-slate-400' : 'bg-amber-900/50 text-amber-400 border border-amber-500/20'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${status === AgentStatus.IDLE || status === AgentStatus.COMPLETE ? 'bg-slate-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {status}
           </div>

           {/* Live Toggle */}
           <button 
             onClick={toggleLive}
             className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center border transition-all ${isLive ? 'bg-red-900/50 text-red-400 border-red-500/50 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
           >
             <MicIcon /> {isLive ? "Live On" : "Live Off"}
           </button>

           {/* Chat Toggle */}
           <button 
             onClick={() => setShowChat(!showChat)}
             className={`p-2 rounded-md transition-colors ${showChat ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
           >
             <ChatIcon />
           </button>

           <button 
             onClick={() => triggerRender(params)}
             disabled={status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETE}
             className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-cyan-900/20"
           >
             <RefreshIcon />
             Re-Render
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Chat Overlay Panel */}
        {showChat && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-900 z-40 border-l border-slate-800 shadow-2xl animate-slideIn">
             <ChatInterface />
          </div>
        )}

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
              placeholder="Describe your scene... e.g. 'Cyberpunk detective standing in rain'"
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
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-[#0b1120] py-1 z-10">History</h3>
             <div className="grid grid-cols-2 gap-2">
                {shotHistory.map((shot, i) => (
                   <div 
                      key={shot.id} 
                      onClick={() => { setParams(shot.params); if(shot.type === 'video') setCurrentVideo(shot.videoUrl!); else {setCurrentImage(shot.imageUrl || null); setCurrentVideo(null);} setIntent(shot.intent); }} 
                      className={`cursor-pointer group relative aspect-video bg-slate-800 rounded overflow-hidden border transition-all ${currentImage === shot.imageUrl ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-700 hover:border-slate-500'}`}
                   >
                      {shot.type === 'video' ? (
                         <div className="w-full h-full flex items-center justify-center bg-black"><VideoIcon /></div>
                      ) : (
                         <img src={shot.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <span className="text-[10px] text-white font-bold truncate">{shot.type === 'video' ? 'Video' : 'Shot'} {shotHistory.length - i}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </section>

        {/* CENTER PANEL: Preview */}
        <section className="flex-1 bg-black flex flex-col relative z-0">
          <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
             <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-white/10 pointer-events-auto flex shadow-xl">
                <button onClick={() => setViewTab('visual')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'visual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><EyeIcon /> Viewport</button>
                <button onClick={() => setViewTab('compare')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'compare' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><SplitIcon /> Compare</button>
                <button onClick={() => setViewTab('code')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center ${viewTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><CodeIcon /> JSON</button>
             </div>
          </div>
          
          <div className="absolute top-4 right-4 z-20 pointer-events-auto">
             <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex items-center space-x-2 px-3 shadow-xl cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsHDR(!isHDR)}>
               <div className={`w-2 h-2 rounded-full ${isHDR ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-600'}`}></div>
               <span className={`text-[10px] font-bold ${isHDR ? 'text-cyan-400' : 'text-slate-500'}`}>ACEScg / {isHDR ? '16-bit' : '8-bit'}</span>
             </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] overflow-hidden">
             {renderVisualContent()}
          </div>
        </section>

        {/* RIGHT PANEL: Controls */}
        <section className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-xl">
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
            {controlTab === 'camera' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-cyan-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-cyan-900/30 pb-2">Camera Physics</h3>
                <SliderControl label="Focal Length" value={params.camera.lens_mm} min={12} max={200} unit="mm" onChange={(v) => updateCamera('lens_mm', v)} />
                <SliderControl label="Field of View" value={params.camera.fov_deg} min={10} max={120} unit="°" onChange={(v) => updateCamera('fov_deg', v)} />
                <SliderControl label="Camera Height" value={params.camera.camera_height_m} min={0.1} max={5} step={0.1} unit="m" onChange={(v) => updateCamera('camera_height_m', v)} />
                
                <div className="pt-2">
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Format</label>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <select value={params.format.aspect_ratio} onChange={e => updateFormat('aspect_ratio', e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none">
                         <option value="1:1">1:1 Square</option>
                         <option value="16:9">16:9 Cinema</option>
                         <option value="9:16">9:16 Vertical</option>
                         <option value="4:3">4:3 TV</option>
                      </select>
                      <select value={params.format.resolution} onChange={e => updateFormat('resolution', e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none">
                         <option value="1K">1K Res</option>
                         <option value="2K">2K Res</option>
                         <option value="4K">4K Res</option>
                      </select>
                   </div>
                </div>

                <div className="pt-2">
                   <label className="text-xs text-slate-400 uppercase block mb-2 font-mono">Angle</label>
                   <select value={params.camera.angle} onChange={(e) => updateCamera('angle', e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none">
                     <option value="eye_level">Eye Level</option>
                     <option value="low_angle">Low Angle</option>
                     <option value="high_angle">High Angle</option>
                     <option value="bird_eye">Bird's Eye</option>
                     <option value="dutch_angle">Dutch Angle</option>
                   </select>
                </div>
              </div>
            )}
             {controlTab === 'lighting' && (
               <div className="space-y-6">
                 <h3 className="text-amber-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-amber-900/30 pb-2">Studio Lighting</h3>
                 <SliderControl label="Key Intensity" value={params.lighting.key.intensity} min={0} max={2} step={0.1} onChange={(v) => updateLighting('key', 'intensity', v)} />
                 <SliderControl label="Fill Intensity" value={params.lighting.fill.intensity} min={0} max={1} step={0.05} onChange={(v) => updateLighting('fill', 'intensity', v)} />
                 <SliderControl label="Rim Intensity" value={params.lighting.rim.intensity} min={0} max={2} step={0.1} onChange={(v) => updateLighting('rim', 'intensity', v)} />
               </div>
             )}
             {controlTab === 'color' && (
                <div className="space-y-6">
                  <h3 className="text-pink-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-pink-900/30 pb-2">Color Grading</h3>
                  <div className="flex bg-slate-950 rounded p-1 border border-slate-800">
                      {[8, 16, 32].map(bit => (
                        <button key={bit} onClick={() => updateColor('bit_depth', bit)} className={`flex-1 text-[10px] py-1 rounded transition-all ${params.color.bit_depth === bit ? 'bg-slate-700 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}>{bit}-bit</button>
                      ))}
                    </div>
                </div>
             )}
             {controlTab === 'composition' && (
               <div className="space-y-6">
                  <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-4 border-b border-emerald-900/30 pb-2">Framing</h3>
                  <button onClick={() => updateComposition('rule_of_thirds', !params.composition.rule_of_thirds)} className={`w-full py-2 rounded text-xs border ${params.composition.rule_of_thirds ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-700 text-slate-500'}`}>Rule of Thirds: {params.composition.rule_of_thirds ? 'ON' : 'OFF'}</button>
               </div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;