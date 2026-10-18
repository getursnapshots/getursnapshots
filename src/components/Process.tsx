import React from 'react';
import { Calendar, UserCheck, Camera, Download, ArrowRight, Check } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

interface ProcessProps {
  onStartBooking: () => void;
}

export const Process: React.FC<ProcessProps> = ({ onStartBooking }) => {
  const stepIcons = [Calendar, UserCheck, Camera, Download];

  return (
    <section id="process" className="bg-transparent py-10 sm:py-14 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">PROCESS</p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="process-title"
          >
            How Snap Shots Works
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            From booking to final delivery in 4 streamlined steps. Zero stress, maximum impact.
          </p>
        </div>

        {/* 4 Steps Row / Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {siteConfig.processSteps.map((step, idx) => {
            const Icon = stepIcons[idx] || Camera;

            return (
              <div
                key={step.number}
                className="relative rounded-3xl bg-zinc-950 p-6 sm:p-7 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 shadow-xl shadow-black/40 transition-all duration-300 flex flex-col justify-between group"
                id={`process-step-${step.number}`}
              >
                <div>
                  {/* Top Step Counter & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-700 group-hover:text-[#bd1616] transition-colors font-mono">
                      {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-white group-hover:bg-[#bd1616] group-hover:border-[#9e1212] group-hover:text-white transition-colors shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#bd1616]">
                      {step.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="mt-5 pt-4 border-t border-zinc-800 space-y-2">
                    {step.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3 h-3 text-[#bd1616] flex-shrink-0 stroke-[2.5]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-zinc-700 to-[#bd1616]"
                      style={{ width: `${(idx + 1) * 25}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Banner below process */}
        <div className="mt-14 text-center px-2">
          <button
            type="button"
            onClick={onStartBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-8 h-12 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 hover:shadow-xl hover:shadow-[#bd1616]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>START STEP 01: BOOK YOUR SESSION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
