import { Sparkles, AlertTriangle, BookOpen } from 'lucide-react';

export default function AIExplainerPanel({ entityName, entityType, metrics }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,248,255,0.8))' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary-600" size={24} />
        <h3 className="text-xl font-bold text-neutral-900">AI Research Assistant</h3>
      </div>
      
      <div className="mb-4" style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-500)' }}>
        <p className="text-sm font-medium text-primary-700 flex items-center gap-2">
          <BookOpen size={16} /> Exploring {entityName} ({entityType})
        </p>
      </div>
      
      <div className="text-sm text-neutral-800 space-y-4" style={{ lineHeight: '1.6' }}>
        <p className="mb-3">
          <strong>What it is:</strong> {entityName} is a {entityType === 'Stock' ? 'publicly traded company' : 'mutual fund'}.
        </p>
        
        {entityType === 'Stock' ? (
          <p className="mb-3">
            <strong>Key Metrics Explained:</strong> It has a P/E ratio of {metrics.peRatio}, which means investors are paying ₹{metrics.peRatio} for every ₹1 of company earnings. The Debt-to-Equity ratio is {metrics.debtToEquity}, indicating its leverage level.
          </p>
        ) : (
          <p className="mb-3">
            <strong>Key Metrics Explained:</strong> The fund has an Expense Ratio of {metrics.expenseRatio}%, which is the annual fee charged to manage the fund. The 1-Year return is {metrics.returns['1Y']}%, compared to its benchmark return of {metrics.benchmarkReturns['1Y']}%.
          </p>
        )}
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
          <h4 className="font-bold flex items-center gap-2 mb-2 text-danger">
            <AlertTriangle size={16} /> Risk Summary
          </h4>
          <p className="text-xs text-neutral-700">
            {entityType === 'Stock' ? 
              'Investing in individual equities involves high market risk, sector-specific risks, and company-specific risks. Past performance does not indicate future results.' :
              `This fund is categorized as '${metrics.riskometer}' on the Riskometer. Mutual fund investments are subject to market risks. Read all scheme related documents carefully.`
            }
          </p>
        </div>
        
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--neutral-200)' }}>
          <p className="text-xs text-neutral-500">
            <strong>Sources Used:</strong> Company filings (Q1 2026), NSE/BSE pricing data, Scheme Information Document (SID).<br/>
            <em>This AI summary is for educational purposes only and is strictly not investment advice.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
