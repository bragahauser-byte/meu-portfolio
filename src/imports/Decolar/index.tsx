import imgFrame2147233598 from "./ff2b5873c8cee333b01b6e6533b5f618b33964a4.png";
import imgFrame2147233599 from "./3eeeafbfa5e81e206d3aa542ddbf033099ce29ef.png";
import imgFrame2147233600 from "./ee8f8429dc61aa11f3db8c464272e8958de4ea9b.png";
import imgFrame2147233601 from "./ef13dcea97cdbc0ead8e3790172b137135c928ea.png";
import imgFrame2147233602 from "./9d622b159fbab4fd1b1c6ab3b7118651b03856f0.png";
import imgFrame2147233603 from "./4ef7e77b40063c585250ba438ce5c78b9c850b79.png";

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

export default function Decolar() {
  return (
    <div className="bg-white relative size-full" data-name="decolar">
      <Frame5 />
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[2776px] leading-[0] left-[40px] not-italic text-[#333] text-[24px] text-justify top-[302px] tracking-[0.024px] w-[658px] whitespace-pre-wrap">
        <p className="leading-[32px] mb-0">{`Planning a trip with friends seems exciting at first, but it can quickly turn into a problem. What starts simple transforms into long conversations, indecision, and lack of progress. Differences in expectations, budget, and availability make it difficult for the group to align, and often the trip doesn't even happen. For platforms like Decolar, this is a critical point, since everything depends on the user's decision.`}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">The main difficulty lies in the group process itself. Aligning everything manually takes time, generates doubts, and ultimately stalls the decision. The longer the group takes, the greater the chance of losing interest and giving up altogether. The goal of the project was to make this process simpler and more organized, helping the group reach a decision more quickly and clearly — not by eliminating collaboration, but by better structuring how it happens.</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px] mb-0">{`The insight was realizing that the problem isn't a lack of options, but a lack of clarity. When each person can express their preferences individually, and this input is organized intelligently, deciding becomes much easier. From there, the solution took shape as a system based on a quick quiz, where each person indicates their budget, dates, and travel style. Based on these answers, the product suggests three destinations that balance the group's profile, showing a compatibility percentage for each to help guide the choice. Images and videos bring each destination to life, making the decision feel more real and engaging rather than abstract.`}</p>
        <p className="leading-[32px] mb-0">​</p>
        <p className="leading-[32px]">{`As a result, the process becomes less confusing and more guided, increasing the chances of the group actually making a decision. And if it's not yet time to buy, the experience continues through a shared piggy bank, helping the group manage money together and stay engaged until the trip finally happens.`}</p>
      </div>
      <div className="[word-break:break-word] absolute font-['PP_Neue_Montreal:Book',sans-serif] h-[64px] leading-[0] left-[40px] not-italic text-[#1a1a1a] text-[0px] top-[40px] tracking-[0.028px] w-[307px]">
        <p className="leading-[32px] mb-0 text-[28px]">Decolar</p>
        <p className="leading-[32px] mb-0 text-[#757575] text-[28px]">Design study</p>
        <p className="leading-[32px] text-[28px]">​</p>
      </div>
    </div>
  );
}