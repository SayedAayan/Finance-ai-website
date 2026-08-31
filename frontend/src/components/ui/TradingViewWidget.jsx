import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BSE:SENSEX", theme = "light", height = 400 }) {
  const container = useRef();

  useEffect(() => {
    // Clear existing content to prevent duplicates in strict mode
    container.current.innerHTML = ""; 
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    // TradingView widget config
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": "${theme}",
        "style": "1",
        "locale": "in",
        "enable_publishing": false,
        "backgroundColor": "rgba(0, 0, 0, 0)",
        "gridColor": "rgba(42, 46, 57, 0.06)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "support_host": "https://www.tradingview.com"
      }`;
      
    container.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: height, width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
