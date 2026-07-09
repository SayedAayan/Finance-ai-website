import { Info } from 'lucide-react';

export default function MetricCard({ title, value, subtext, isPositive, tooltip, timestamp }) {
  return (
    <div className="card hover-lift">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-neutral-500 flex items-center gap-1">
          {title}
          {tooltip && (
            <span title={tooltip} style={{ cursor: 'help' }}>
              <Info size={14} />
            </span>
          )}
        </h4>
      </div>
      <div className="text-2xl font-bold text-neutral-900 mb-1">{value}</div>
      {subtext && (
        <div className={`text-xs ${isPositive === true ? 'text-success' : isPositive === false ? 'text-danger' : 'text-neutral-500'}`}>
          {subtext}
        </div>
      )}
      {timestamp && (
        <div className="text-xs text-neutral-500 mt-3" style={{ fontSize: '10px' }}>
          Updated: {new Date(timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
