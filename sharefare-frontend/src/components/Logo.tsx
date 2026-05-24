import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-0.5 group select-none ${className}`}>
      {/* Orange S with Car SVG */}
      <span className="relative inline-flex items-center justify-center shrink-0 w-9 sm:w-11">
        <svg viewBox="0 0 44 52" className="w-full h-auto transition-transform duration-300 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orange S letter */}
          <text
            x="2"
            y="43"
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontWeight="900"
            fontSize="52"
            fill="#f04e12"
          >
            S
          </text>
          
          {/* White Car body inside the upper curve of the S */}
          <path
            d="M 10 24 
               C 10 22, 11 20, 13 20 
               L 16 16 
               C 18 13.5, 26 13.5, 28 16 
               L 31 20 
               C 33 20, 34 22, 34 24 
               C 34 27, 33 28, 30 28 
               L 14 28 
               C 11 28, 10 27, 10 24 Z"
            fill="white"
          />
          
          {/* Car Windows (using the orange color of the S) */}
          <path d="M 15 20 L 21 20 L 21 16.5 L 17 16.5 Z" fill="#f04e12" />
          <path d="M 23 20 L 29 20 L 27 16.5 L 23 16.5 Z" fill="#f04e12" />
          
          {/* Car Wheels (Black tires, Gray hubs) */}
          <circle cx="15.5" cy="28" r="3.5" fill="#1a1a1a" />
          <circle cx="15.5" cy="28" r="1.5" fill="#888888" />
          
          <circle cx="28.5" cy="28" r="3.5" fill="#1a1a1a" />
          <circle cx="28.5" cy="28" r="1.5" fill="#888888" />
        </svg>
      </span>

      {/* Typography: "hare" in black, "FARE" in orange, "HYDERABAD CAMPUS RIDES" in grey */}
      <div className="flex flex-col justify-center -ml-1 sm:-ml-1.5 leading-none">
        <span className="text-[20px] sm:text-[25px] font-black tracking-tight text-slate-950 leading-[0.9]" style={{ fontFamily: "'Inter', sans-serif" }}>
          hare
        </span>
        <span className="text-[14px] sm:text-[17px] font-black tracking-widest text-[#f04e12] leading-[0.9] mt-[2px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          FARE
        </span>
        <span className="hidden sm:inline-block text-[7.5px] font-extrabold tracking-[0.14em] text-slate-400 uppercase mt-[4px]" style={{ fontFamily: "'Inter', sans-serif" }}>
          HYDERABAD CAMPUS RIDES
        </span>
      </div>
    </Link>
  );
}
