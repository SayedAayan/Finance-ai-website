import { ShieldCheck, Clock } from 'lucide-react';

export default function TrustPanel({ dataSource, lastUpdated }) {
  return (
    <div className="card" style={{ background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', marginTop: '2rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="text-primary-600" size={20} />
        <h3 className="font-bold text-neutral-900">Data & Compliance Integrity</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="flex items-center gap-2 text-neutral-700 mb-1">
            <strong>Data Source:</strong> {dataSource}
          </p>
          <p className="flex items-center gap-2 text-neutral-700">
            <Clock size={14} /> 
            <strong>Last Updated:</strong> {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
        
        <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--warning-light)' }}>
          <p className="text-xs text-neutral-700">
            <strong>Disclosure:</strong> StockBuzz is a research platform. The information provided does not constitute investment advice. We do not guarantee returns or provide personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
