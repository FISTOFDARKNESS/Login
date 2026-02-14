
import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Apple, DownloadCloud, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

interface ExternalDownload {
  platform: 'windows' | 'android' | 'macos';
  version_name: string;
  url: string;
  size: string;
  release_date: string;
}

const DOWNLOAD_LINKS: ExternalDownload[] = [
  {
    platform: 'windows',
    version_name: 'v2.4.0-STABLE',
    url: 'https://example.com/excalibur_setup.exe',
    size: '2 BG',
    release_date: '2026-01-14'
  },
  {
    platform: 'android',
    version_name: 'v2.4.0-STABLE',
    url: 'https://excaliburmusics.netlify.app/components/downloads/excalibur-music.apk',
    size: '4.1 MB',
    release_date: '2026-01-14'
  }
];

const DownloadSection: React.FC = () => {
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startDownload = (platform: string, url: string) => {
    if (activeDownload) return;
    
    setActiveDownload(platform);
    setProgress(0);

    const duration = 1500; // 1.5 seconds for the bar to fill
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + step;
        if (newProgress >= 100) {
          clearInterval(timer);
          window.open(url, '_blank', 'noopener,noreferrer');
          setTimeout(() => {
            setActiveDownload(null);
            setProgress(0);
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, interval);
  };

  return (
    <section id="download" className="py-24 px-6 bg-gradient-to-t from-blue-600/5 to-transparent relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 glass rounded-full mb-6 border border-white/5">
            <DownloadCloud size={12} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Secure Delivery
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase">Downloads.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Select your platform. Your download will be initialized after a quick security check.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Windows */}
          {DOWNLOAD_LINKS.filter(v => v.platform === 'windows').map(v => (
            <div 
              key={v.platform}
              onClick={() => startDownload('windows', v.url)}
              className={`glass p-10 rounded-[40px] transition-all relative overflow-hidden group ${activeDownload ? 'cursor-default' : 'cursor-pointer card-hover'}`}
            >
              <Monitor size={56} className={`mx-auto mb-8 transition-colors ${activeDownload === 'windows' ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Windows</h3>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {v.version_name} • {v.size}
              </span>
              
              <div className="mt-8 pt-8 border-t border-white/5 min-h-[60px] flex flex-col items-center justify-center">
                {activeDownload === 'windows' ? (
                  <div className="w-full space-y-3">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-75" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block text-center">
                      {progress < 100 ? 'Encrypting Connection...' : 'Redirecting...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center font-bold text-blue-500">
                    <span>Download</span>
                    <ExternalLink size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Android */}
          {DOWNLOAD_LINKS.filter(v => v.platform === 'android').map(v => (
            <div 
              key={v.platform}
              onClick={() => startDownload('android', v.url)}
              className={`glass p-10 rounded-[40px] transition-all relative overflow-hidden group ${activeDownload ? 'cursor-default' : 'cursor-pointer card-hover'}`}
            >
              <Smartphone size={56} className={`mx-auto mb-8 transition-colors ${activeDownload === 'android' ? 'text-green-500' : 'group-hover:text-green-500'}`} />
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Android</h3>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {v.version_name} • {v.size}
              </span>
              
              <div className="mt-8 pt-8 border-t border-white/5 min-h-[60px] flex flex-col items-center justify-center">
                {activeDownload === 'android' ? (
                  <div className="w-full space-y-3">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-75" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block text-center">
                      {progress < 100 ? 'Securing Package...' : 'Redirecting...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center font-bold text-green-500">
                    <span>Download</span>
                    <ExternalLink size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* macOS */}
          <div className="glass p-10 rounded-[40px] opacity-30 cursor-not-allowed group relative">
            <Apple size={56} className="mx-auto mb-8 text-gray-600" />
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">macOS</h3>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Coming Soon</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">In Development</span>
            </div>
          </div>
        </div>

        <div className="mt-20 glass p-8 rounded-3xl border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-500/10 rounded-2xl">
               <CheckCircle className="text-blue-500" size={24} />
             </div>
             <div>
               <h4 className="font-black uppercase text-sm">Safe Infrastructure</h4>
               <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Verified redirection to official cloud mirrors.</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Engine: V8-CLOUD-READY</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
