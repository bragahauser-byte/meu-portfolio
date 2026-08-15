function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[300px] items-center left-[40px] text-[#1a1a1a] text-[0px] top-[40px] tracking-[0.028px] whitespace-nowrap">
      <div className="relative shrink-0">
        <p className="leading-[32px] mb-0 text-[28px]">Experience</p>
        <p className="leading-[32px] text-[#757575] text-[28px]">Cherey — Internship, 2024–2026</p>
      </div>
      <div className="relative shrink-0">
        <p className="leading-[32px] mb-0 text-[28px]">Education</p>
        <p className="leading-[32px] text-[#757575] text-[28px]">Digital Design — Anhembi Morumbi, 2023–2026</p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="[word-break:break-word] bg-white font-['PP_Neue_Montreal:Book',sans-serif] leading-[0] not-italic relative size-full" data-name="about">
      <Frame />
      <div className="absolute left-[calc(37.5%+18px)] text-[#333] text-[32px] text-justify top-[calc(25%+25px)] tracking-[0.032px] w-[705px] whitespace-pre-wrap">
        <p className="leading-[40px] mb-0">{`I've been designing since before I called it that. It started with banners and thumbnails for the games I played as a kid — no real purpose, just because it was fun. I didn't know it then, but that was already shaping how I think about design today.`}</p>
        <p className="leading-[40px] mb-0">​</p>
        <p className="leading-[40px] mb-0">{`I see design as something that carries intention. It's not just about solving problems — it's where I put what I think, question, and feel. A coherent aesthetic isn't decoration; it exists to support clarity and make an idea land. But form only matters when it's grounded in something real, tested against use, not just taste.`}</p>
        <p className="leading-[40px] mb-0">​</p>
        <p className="leading-[40px] mb-0">{`I also believe design needs conviction. Consensus tends to produce average outcomes — and I'd rather make an informed, honest decision than settle for one that pleases everyone and says nothing.`}</p>
        <p className="leading-[40px] mb-0">​</p>
        <p className="leading-[40px]">{`At the end of the day, the best design is the kind that disappears — that gets out of the way so the experience can speak for itself. If no one uses what I designed, I've wasted my time. What drives me is simple: making someone's life a little easier through what I build.`}</p>
      </div>
      <div className="absolute flex flex-col inset-[94.44%_94.53%_3.7%_2.08%] justify-center text-[#1a1a1a] text-[16px] tracking-[-0.64px] whitespace-nowrap" style={{ fontFeatureSettings: '"dlig" 1' }}>
        <p className="leading-[20px]">LINKEDIN</p>
      </div>
      <div className="absolute flex flex-col inset-[94.44%_82.71%_3.7%_14.22%] justify-center text-[#1a1a1a] text-[16px] tracking-[-0.64px] whitespace-nowrap" style={{ fontFeatureSettings: '"dlig" 1' }}>
        <p className="leading-[20px]">MEDIUM</p>
      </div>
      <div className="absolute flex flex-col inset-[94.35%_71.41%_3.8%_26.3%] justify-center text-[#1a1a1a] text-[16px] tracking-[-0.64px] whitespace-nowrap" style={{ fontFeatureSettings: '"dlig" 1' }}>
        <p className="leading-[20px]">EMAIL</p>
      </div>
    </div>
  );
}