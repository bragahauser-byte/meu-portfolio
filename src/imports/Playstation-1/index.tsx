import imgFrame2147233598 from "./b9f92c64362555697b1bf52070200b5776449dd9.png";
import imgFrame2147233599 from "./712bc7808b04958224ac8952234b52ff22823da0.png";
import imgFrame2147233600 from "./399f11adf248c3bddad6aa41d12930562278241a.png";
import imgFrame2147233601 from "./d141364c892e76f9f0086baf105fbc5003b811df.png";
import imgFrame2147233602 from "./1bfd329f51e198222cbf1335e958f93e9bbef465.png";
import imgFrame2147233603 from "./957bca79229f9f620b8e6263af445e3b16bc178b.png";

function Frame() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233598} />
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233599} />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233600} />
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233601} />
    </div>
  );
}

function Frame4() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233602} />
    </div>
  );
}

function Frame6() {
  return (
    <div className="h-[1000px] relative rounded-[12px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgFrame2147233603} />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-[calc(37.5%+18px)] top-[40px] w-[1142px]">
      <Frame />
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame4 />
      <Frame6 />
    </div>
  );
}

export default function Playstation() {
  return (
    <div className="bg-white relative size-full" data-name="playstation">
      <Frame5 />
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[2776px] leading-[0] left-[40px] not-italic text-[#333] text-[24px] text-justify top-[302px] tracking-[0.024px] w-[658px] whitespace-pre-wrap">
        <p className="leading-[32px] mb-0">Over the past decade, the gaming market has undergone a structural shift, with a growing number of gamers migrating from consoles to PC, driven by flexibility, performance, and more affordable price points. While competitors like Xbox have moved forward with initiatives such as Game Pass for PC, PlayStation has maintained a strong reliance on its console ecosystem. PlayStation Connect emerges as an exploration of how the brand could strategically enter the PC gaming space without diluting its premium positioning.</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">{`The main friction lies not in interest in the games themselves, but in the commitment to the hardware. Many PC gamers don't reject PlayStation titles, but they avoid the need to purchase an additional console. They seek more direct access, more flexible pricing models, and continuity across devices — something the current ecosystem doesn't consistently provide. Understanding this, the goal became clear: create a structured way to expand PlayStation's presence on PC, offering a centralized experience that eliminated barriers to entry and adapted to the habits of this audience. More than just distributing games, the intention was to build a new gateway for the brand.`}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">{`The answer was PlayStation Connect, a dedicated launcher that consolidates distribution, identity, and access on a single platform. Since hardware commitment was the biggest barrier, the experience was designed to be fully native to PC, with no console required. Account continuity ensures that progress, trophies, and libraries carry over seamlessly across devices, closing the gap that currently pushes PC gamers away, while a subscription model responds to this audience's expectation for more flexible pricing. Together, these pieces turn Connect into a bridge between the PlayStation ecosystem and this new context of use, rather than just another storefront for ports.`}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px]">{`As a result, the project repositions PlayStation's presence on PC, moving away from a collection of isolated ports and towards a platform strategy. By reducing access friction and expanding brand reach, the solution points to a future where value lies less in hardware and more in the integrated service experience. If this platform were live, I would track launcher downloads, subscription conversion, and account-linking rates between console and PC as core indicators of adoption, complemented by a post-launch survey to understand how PC gamers perceive the brand's accessibility now that hardware is no longer the entry point.`}</p>
      </div>
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[64px] leading-[0] left-[40px] not-italic text-[#1a1a1a] text-[0px] top-[40px] tracking-[0.028px] w-[307px]">
        <p className="leading-[32px] mb-0 text-[28px]">Playstation</p>
        <p className="leading-[32px] mb-0 text-[#757575] text-[28px]">Design study</p>
        <p className="leading-[32px] text-[28px]">​</p>
      </div>
    </div>
  );
}