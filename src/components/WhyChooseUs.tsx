import React from 'react';
import { Award, Zap, Tag, CheckCircle2 } from 'lucide-react';
import { useCountry } from '../context/CountryContext';

export const WhyChooseUs: React.FC = () => {
  const { startingPriceLabel } = useCountry();

  const cards = [
    {
      icon: Award,
      number: '01',
      title: 'Trained & Certified Reel-Makers',
      desc: 'Our creators aren’t just camera operators. They understand visual hooks, trending audio, dynamic pacing, and mobile framing to make your content stop the scroll.',
      badge: 'Top 1% Creators',
      points: [
        'Rigorous 6-step background & style evaluation',
        'Equipped with latest iPhone 16 Pro Max & gimbal rigs',
        'Expert guidance on poses, natural angles & lighting',
      ],
    },
    {
      icon: Tag,
      number: '02',
      title: `Transparent Packages from ${startingPriceLabel}`,
      desc: 'No confusing contracts or surprise add-ons. Clear, transparent packages with upfront inclusions so you know exactly what you’re paying for.',
      badge: 'Zero Hidden Fees',
      points: [
        'All taxes & basic edits included',
        'Full upfront deliverable breakdown',
        'Flexible custom tiers for multi-day events',
      ],
    },
    {
      icon: Zap,
      number: '03',
      title: 'Instant Booking & Same-Day Delivery',
      desc: 'Reserve a creator in under 2 minutes. Receive fully edited, color-graded reels within hours of your shoot so you can post while the excitement is still fresh.',
      badge: '2–6 Hour Delivery',
      points: [
        'Instant confirmation across 7 major cities',
        'Fastest turnaround in the media industry',
        'Live event edits ready for immediate story reposts',
      ],
    },
  ];

  return (
    <section className="bg-transparent py-10 sm:py-14 relative overflow-hidden border-b border-zinc-900/80" id="why-choose-us">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">
            WHY CHOOSE US
          </p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="why-choose-title"
          >
            The Snap Shots Difference
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            We reimagined event videography into a fast, social-first service built specifically for the reel era.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {cards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl bg-zinc-950 p-5 sm:p-8 border border-zinc-800 hover:border-zinc-700 shadow-xl shadow-black/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                id={`why-card-${idx + 1}`}
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-white group-hover:bg-[#bd1616] group-hover:border-[#9e1212] group-hover:text-white transition-colors shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#bd1616] text-white text-xs font-bold uppercase tracking-wider border border-[#9e1212] shadow-xs">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{item.desc}</p>

                  {/* Bullet Checklist */}
                  <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2.5">
                    {item.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#bd1616] flex-shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <span>SNAP SHOTS STANDARD</span>
                  <span className="font-bold text-zinc-400">0{idx + 1} / 0{cards.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
