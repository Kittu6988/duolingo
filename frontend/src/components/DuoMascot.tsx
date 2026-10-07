import React from 'react';

interface DuoMascotProps {
  mood?: 'happy' | 'celebrating' | 'sad' | 'thinking' | 'tuxedo' | 'fire' | 'crying';
  size?: number;
  className?: string;
}

export const DuoMascot: React.FC<DuoMascotProps> = ({
  mood = 'happy',
  size = 120,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-block relative select-none transition-transform hover:scale-105 duration-200 ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Fire background aura if streak/fire mood */}
        {mood === 'fire' && (
          <g className="animate-pulse">
            <path
              d="M60 5 C45 25 30 35 30 65 C30 95 90 95 90 65 C90 35 75 25 60 5 Z"
              fill="#ff9600"
              opacity="0.3"
            />
            <path
              d="M60 18 C50 32 40 42 40 65 C40 85 80 85 80 65 C80 42 70 32 60 18 Z"
              fill="#ff4b4b"
              opacity="0.4"
            />
          </g>
        )}

        {/* Feet */}
        <ellipse cx="44" cy="108" rx="12" ry="7" fill="#E57800" />
        <ellipse cx="76" cy="108" rx="12" ry="7" fill="#E57800" />
        <ellipse cx="44" cy="106" rx="10" ry="5" fill="#FF9600" />
        <ellipse cx="76" cy="106" rx="10" ry="5" fill="#FF9600" />

        {/* Body (Iconic Duo green round egg/pear shape) */}
        <path
          d="M60 12 C32 12 20 34 20 64 C20 94 36 104 60 104 C84 104 100 94 100 64 C100 34 88 12 60 12 Z"
          fill="#58CC02"
        />
        {/* Darker green bottom shadow/depth */}
        <path
          d="M23 78 C28 98 42 104 60 104 C78 104 92 98 97 78 C86 92 74 98 60 98 C46 98 34 92 23 78 Z"
          fill="#46A302"
        />

        {/* Belly patch */}
        <ellipse cx="60" cy="74" rx="26" ry="24" fill="#78D824" />

        {/* Tuxedo outfit */}
        {mood === 'tuxedo' && (
          <g>
            {/* White shirt */}
            <path d="M48 55 L72 55 L60 88 Z" fill="#FFFFFF" />
            {/* Black jacket lapels */}
            <path d="M40 56 L52 78 L38 92 Z" fill="#2B2B2B" />
            <path d="M80 56 L68 78 L82 92 Z" fill="#2B2B2B" />
            {/* Red bowtie */}
            <polygon points="52,58 60,63 52,68" fill="#FF4B4B" />
            <polygon points="68,58 60,63 68,68" fill="#FF4B4B" />
            <circle cx="60" cy="63" r="2.5" fill="#D62626" />
          </g>
        )}

        {/* Left Wing */}
        {mood === 'celebrating' ? (
          <path
            d="M20 54 C10 35 2 38 4 50 C6 62 18 72 26 70 Z"
            fill="#58CC02"
            stroke="#46A302"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M21 54 C14 54 8 62 12 74 C16 86 24 88 28 80 Z"
            fill="#58CC02"
            stroke="#46A302"
            strokeWidth="2"
          />
        )}

        {/* Right Wing */}
        {mood === 'celebrating' ? (
          <path
            d="M100 54 C110 35 118 38 116 50 C114 62 102 72 94 70 Z"
            fill="#58CC02"
            stroke="#46A302"
            strokeWidth="2"
          />
        ) : mood === 'thinking' ? (
          <path
            d="M99 56 C105 50 102 42 92 46 C84 48 88 64 94 72 Z"
            fill="#58CC02"
            stroke="#46A302"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M99 54 C106 54 112 62 108 74 C104 86 96 88 92 80 Z"
            fill="#58CC02"
            stroke="#46A302"
            strokeWidth="2"
          />
        )}

        {/* Eyes Glasses / Rings */}
        <circle cx="44" cy="46" r="17" fill="#FFFFFF" stroke="#46A302" strokeWidth="3" />
        <circle cx="76" cy="46" r="17" fill="#FFFFFF" stroke="#46A302" strokeWidth="3" />

        {/* Pupils & Eyebrows depending on mood */}
        {mood === 'happy' || mood === 'celebrating' || mood === 'tuxedo' || mood === 'fire' ? (
          <>
            {/* Happy pupils */}
            <circle cx="46" cy="46" r="8.5" fill="#2B2B2B" />
            <circle cx="48" cy="43" r="3" fill="#FFFFFF" />
            <circle cx="74" cy="46" r="8.5" fill="#2B2B2B" />
            <circle cx="76" cy="43" r="3" fill="#FFFFFF" />
            {/* Feathers / Tuft */}
            <path d="M42 14 C48 8 54 10 52 16 Z" fill="#58CC02" />
            <path d="M68 14 C62 8 56 10 58 16 Z" fill="#58CC02" />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="48" cy="42" r="8.5" fill="#2B2B2B" />
            <circle cx="50" cy="39" r="3" fill="#FFFFFF" />
            <circle cx="72" cy="42" r="8.5" fill="#2B2B2B" />
            <circle cx="74" cy="39" r="3" fill="#FFFFFF" />
            <path d="M36 26 Q44 22 52 28" stroke="#337800" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M68 28 Q76 22 84 26" stroke="#337800" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : mood === 'sad' ? (
          <>
            {/* Sad pupils looking down */}
            <circle cx="44" cy="50" r="7.5" fill="#2B2B2B" />
            <circle cx="46" cy="48" r="2.5" fill="#FFFFFF" />
            <circle cx="76" cy="50" r="7.5" fill="#2B2B2B" />
            <circle cx="78" cy="48" r="2.5" fill="#FFFFFF" />
            {/* Drooping brows */}
            <path d="M34 30 Q44 34 52 30" stroke="#337800" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M68 30 Q76 34 86 30" stroke="#337800" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          /* Crying */
          <>
            <path d="M36 46 Q44 40 52 46" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M68 46 Q76 40 84 46" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Tears */}
            <path d="M42 56 C40 64 42 70 44 70 C46 70 48 64 46 56 Z" fill="#1CB0F6" />
            <path d="M78 56 C76 64 78 70 80 70 C82 70 84 64 82 56 Z" fill="#1CB0F6" />
          </>
        )}

        {/* Beak */}
        <polygon points="60,48 50,58 70,58" fill="#FF9600" />
        <polygon points="60,66 50,58 70,58" fill="#FFC800" />

        {/* Celebrating Crown */}
        {mood === 'celebrating' && (
          <g className="animate-bounce">
            <path
              d="M44 14 L50 4 L60 12 L70 4 L76 14 Z"
              fill="#FFC800"
              stroke="#E5A500"
              strokeWidth="2"
            />
            <circle cx="50" cy="4" r="2.5" fill="#FF4B4B" />
            <circle cx="60" cy="12" r="2.5" fill="#1CB0F6" />
            <circle cx="70" cy="4" r="2.5" fill="#58CC02" />
          </g>
        )}
      </svg>
    </div>
  );
};
