import imgFrame2147233598 from "./5c1c7db8bda671d3301de454303f2df32f7f02e6.png";
import imgFrame2147233599 from "./b3e76a13886665494eb1e3bd7733419efa6ad114.png";
import imgFrame2147233600 from "./b729fc34dc283d938b246926ebce3bc057101490.png";
import imgFrame2147233601 from "./d34bc3c6bfe03581ef4b363fef18edb46113864f.png";
import imgFrame2147233602 from "./608d83c88b6e1960d9629dc8ad826e8cca3bb30f.png";
import imgFrame2147233603 from "./d3277e896ea1e722febcfba8f22e8cdab3ba256d.png";

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

export default function Soundroom() {
  return (
    <div className="bg-white relative size-full" data-name="soundroom">
      <Frame5 />
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[2776px] leading-[0] left-[40px] not-italic text-[#333] text-[24px] text-justify top-[302px] tracking-[0.024px] w-[658px] whitespace-pre-wrap">
        <p className="leading-[32px] mb-0">Music consumption has never been so intense on a global scale, with listeners dedicating hours a week to listening. Even so, the way music is experienced and discussed has become progressively superficial, shaped by algorithms and fragmented habits. Soundroom emerges in this context proposing a change of perspective: treating music not only as content to be consumed, but as culture to be reflected upon, shared, and debated.</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">{`The main friction lies in the contrast between frequency and depth. Although music is a constant part of daily life, meaningful engagement — especially with full albums and independent artists — has been weakening. Listening becomes passive, guided by automatic recommendations, while critical analysis is restricted to a few. This limits discovery and impoverishes the user's relationship with music. `}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">The goal of the project was to deepen this relationship, encouraging more conscious and participatory listening. The proposal is not to compete with platforms like Spotify, but to complement the existing ecosystem with a layer that values expression, exchange, and discovery guided by people.</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">{`The key insight was understanding that the problem isn't a lack of access to music, but a lack of spaces that encourage reflection and dialogue. When the user stops being just a consumer and starts expressing themselves about what they hear, the experience becomes richer, more memorable, and more meaningful. From there, the solution took shape as a social platform dedicated to the musical experience, where users can record their listening sessions, write entries, create playlists, follow friends, and discover new artists within the community. Instead of isolated consumption, Soundroom transforms music into a shared journey, where human interaction and curation take center stage.`}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px]">As a result, the project culturally deepens an already recurring habit, encouraging the listening of albums as complete works and expanding the visibility of independent artists. By reducing dependence on algorithmic trends, Soundroom repositions music as an active experience — something that is not only listened to, but interpreted, discussed, and preserved.</p>
      </div>
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[64px] leading-[0] left-[40px] not-italic text-[#1a1a1a] text-[0px] top-[40px] tracking-[0.028px] w-[307px]">
        <p className="leading-[32px] mb-0 text-[28px]">Soundroom</p>
        <p className="leading-[32px] mb-0 text-[#757575] text-[28px]">University Project</p>
        <p className="leading-[32px] text-[28px]">​</p>
      </div>
    </div>
  );
}