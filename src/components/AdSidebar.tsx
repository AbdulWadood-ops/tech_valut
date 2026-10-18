'use client';

export default function AdSidebar() {
  return (
    <aside className="w-10 xl:w-64 2xl:w-72 border-l border-white/5 bg-zinc-950/30 backdrop-blur-md p-4 flex flex-col gap-5 shrink-0 hidden xl:flex self-stretch">

      {/* Sidebar Label */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
        <span className="text-[9px] uppercase font-extrabold text-zinc-600 tracking-[0.15em]">
          Advertisement
        </span>
        <span className="text-[8px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full text-zinc-600 font-semibold tracking-wider">
          AD
        </span>
      </div>

      {/* Large Banner Ad Slot — 300×250 Medium Rectangle */}
      <div className="relative rounded-2xl overflow-hidden border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 flex flex-col items-center justify-center gap-3 group"
        style={{ minHeight: '250px' }}>
        {/* Subtle animated gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 via-transparent to-[#7f22fe]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/10 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/10 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/10 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/10 rounded-br-2xl" />

        {/* Subtle grid lines */}
        <div className="absolute inset-4 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 4.5h16.5A.75.75 0 0121 5.25v10.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 15.75V5.25A.75.75 0 013.75 4.5z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Your Ad Here</span>
          <span className="text-[9px] text-zinc-700 font-medium">300 × 250</span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[8px] text-zinc-700 uppercase tracking-widest font-semibold">Sponsored</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Tall Skyscraper Ad Slot — 160×600 */}
      <div className="relative rounded-2xl overflow-hidden border border-dashed border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950/60 to-zinc-900/60 flex flex-col items-center justify-center gap-3 group flex-1"
        style={{ minHeight: '300px' }}>
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7f22fe]/5 via-transparent to-[#3b82f6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

        {/* Floating dots decoration */}
        <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-white/5" />
        <div className="absolute top-10 right-8 w-1 h-1 rounded-full bg-white/5" />
        <div className="absolute bottom-10 left-8 w-1 h-1 rounded-full bg-white/5" />
        <div className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-white/5" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/10 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/10 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/10 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/10 rounded-br-2xl" />

        {/* Subtle grid lines */}
        <div className="absolute inset-4 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Vertical text label */}
        <div className="relative flex flex-col items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 4.5h16.5A.75.75 0 0121 5.25v10.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 15.75V5.25A.75.75 0 013.75 4.5z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">Your Ad Here</span>
          <span className="text-[9px] text-zinc-700 font-medium">160 × 600</span>
          <div className="flex flex-col items-center gap-1 mt-2">
            <div className="w-12 h-px bg-white/5" />
            <span className="text-[8px] text-zinc-800 font-medium uppercase tracking-widest mt-1">Skyscraper</span>
          </div>
        </div>
      </div>

      {/* Small Square Ad Slot — 300×100 */}
      <div className="relative rounded-xl overflow-hidden border border-dashed border-white/10 bg-zinc-900/40 flex items-center justify-center gap-3 group"
        style={{ minHeight: '80px' }}>
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-[#7f22fe]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative flex items-center gap-2.5 z-10">
          <div className="w-6 h-6 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 4.5h16.5A.75.75 0 0121 5.25v10.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 15.75V5.25A.75.75 0 013.75 4.5z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Your Ad Here</span>
            <span className="text-[8px] text-zinc-700 font-medium">300 × 100 Banner</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center shrink-0">
        <span className="text-[8px] text-zinc-800 uppercase tracking-widest font-medium">Ads by TechVault</span>
      </div>

    </aside>
  );
}
