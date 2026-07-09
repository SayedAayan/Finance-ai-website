import React from 'react';

export default function TrustBadge({ source, isLive, isAI }) {
  const badgeClass = `trust-marker ${isLive ? 'live' : ''} ${isAI ? 'ai' : ''}`;
  
  return (
    <div className={badgeClass}>
      <div className="dot"></div>
      <span>{source}</span>
    </div>
  );
}
