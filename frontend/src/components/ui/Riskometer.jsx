export default function Riskometer({ riskLevel = 'Very High' }) {
  // Simplified SVG representation of a riskometer gauge
  return (
    <div className="card text-center" style={{ background: 'var(--neutral-50)' }}>
      <h4 className="text-sm font-bold text-neutral-900 mb-4">Riskometer</h4>
      
      <div style={{ position: 'relative', width: '120px', height: '60px', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '200%',
          borderRadius: '50%',
          background: 'conic-gradient(from -90deg at 50% 50%, #22c55e 0deg, #84cc16 36deg, #eab308 72deg, #f59e0b 108deg, #ef4444 144deg, transparent 180deg)',
          transform: 'rotate(-90deg)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          width: '80%',
          height: '160%',
          borderRadius: '50%',
          background: 'var(--neutral-50)',
        }}></div>
        
        {/* Simple needle pointing to Very High (far right) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '4px',
          height: '50px',
          background: 'var(--neutral-900)',
          transformOrigin: 'bottom center',
          transform: 'translateX(-50%) rotate(70deg)'
        }}></div>
      </div>
      
      <div className="mt-3 text-sm font-bold text-danger">
        {riskLevel}
      </div>
      <p className="text-xs text-neutral-500 mt-1" style={{ fontSize: '10px' }}>
        Investors understand that their principal will be at {riskLevel} risk
      </p>
    </div>
  );
}
