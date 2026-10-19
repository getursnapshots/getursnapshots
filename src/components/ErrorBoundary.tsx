import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SnapShots ErrorBoundary caught an exception]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleWhatsAppSupport = () => {
    const text = encodeURIComponent(
      'Hi Snap Shots Team, I encountered a display issue on the website and would like assistance.'
    );
    window.open(`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-[#bd1616]">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Top signature brand glow */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(189,22,22,0.35) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 text-[#bd1616] mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              Temporary Glitch Detected
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Our system protected your session. Please click below to refresh the page or connect directly with our team.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 h-11 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleWhatsAppSupport}
                className="w-full sm:w-auto px-5 h-11 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#ffc800]" />
                <span>WhatsApp Help</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
