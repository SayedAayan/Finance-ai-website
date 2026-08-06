import React from 'react';

const AnimatedBackground = () => {
  // Generate 6 smooth flowing Bézier curves for the premium fintech look.
  const curves = [
    { d: "M-100,500 C150,450 350,600 600,400 S1000,200 1300,300", dur: "45s", opacity: 0.12, strokeWidth: 1.2 },
    { d: "M-100,300 C200,250 400,450 700,300 S1100,100 1400,250", dur: "50s", opacity: 0.15, strokeWidth: 1 },
    { d: "M-100,700 C250,750 450,550 800,650 S1200,800 1500,600", dur: "55s", opacity: 0.1, strokeWidth: 1.5 },
    { d: "M-100,400 C300,500 500,300 900,450 S1300,250 1600,400", dur: "48s", opacity: 0.14, strokeWidth: 1 },
    { d: "M-100,200 C350,150 550,350 1000,200 S1400,400 1700,250", dur: "52s", opacity: 0.11, strokeWidth: 1.2 },
    { d: "M-100,600 C400,700 600,500 1100,650 S1500,450 1800,600", dur: "60s", opacity: 0.13, strokeWidth: 1 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="absolute inset-0 w-[200%] h-[200%] -left-[50%] -top-[50%]"
        style={{
          transform: 'rotate(-25deg)',
          animation: 'bg-pan 60s linear infinite'
        }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1500 1000" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {curves.map((curve, index) => (
            <path
              key={index}
              d={curve.d}
              fill="none"
              stroke="#0B3D91"
              strokeWidth={curve.strokeWidth}
              opacity={curve.opacity}
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'blur(0.4px)' }}
            >
              <animate 
                attributeName="d" 
                dur={curve.dur}
                repeatCount="indefinite" 
                values={`${curve.d}; ${curve.d.replace(/(\d+),(\d+)/g, (m, x, y) => `${parseInt(x)},${parseInt(y) + (Math.random() * 40 - 20)}`)}; ${curve.d}`} 
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
          ))}
        </svg>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bg-pan {
          0% { transform: rotate(-25deg) translateX(0); }
          100% { transform: rotate(-25deg) translateX(-20%); }
        }
      `}} />
    </div>
  );
};

export default AnimatedBackground;
