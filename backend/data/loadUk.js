// UK Market Directory & Blue Chips for London Stock Exchange (LSE)

export const UK_COMPANIES = [
  { id: 'LSE:AZN', symbol: 'AZN.L', name: 'AstraZeneca PLC', exchange: 'LSE', country: 'United Kingdom', sector: 'Healthcare', currency: 'GBP', adr: 'AZN' },
  { id: 'LSE:SHEL', symbol: 'SHEL.L', name: 'Shell plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Energy', currency: 'GBP', adr: 'SHEL' },
  { id: 'LSE:HSBA', symbol: 'HSBA.L', name: 'HSBC Holdings plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Financial Services', currency: 'GBP', adr: 'HSBC' },
  { id: 'LSE:ULVR', symbol: 'ULVR.L', name: 'Unilever PLC', exchange: 'LSE', country: 'United Kingdom', sector: 'Consumer Defensive', currency: 'GBP', adr: 'UL' },
  { id: 'LSE:BP', symbol: 'BP.L', name: 'BP p.l.c.', exchange: 'LSE', country: 'United Kingdom', sector: 'Energy', currency: 'GBP', adr: 'BP' },
  { id: 'LSE:RIO', symbol: 'RIO.L', name: 'Rio Tinto Group', exchange: 'LSE', country: 'United Kingdom', sector: 'Basic Materials', currency: 'GBP', adr: 'RIO' },
  { id: 'LSE:GSK', symbol: 'GSK.L', name: 'GSK plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Healthcare', currency: 'GBP', adr: 'GSK' },
  { id: 'LSE:DGE', symbol: 'DGE.L', name: 'Diageo plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Consumer Defensive', currency: 'GBP', adr: 'DEO' },
  { id: 'LSE:BARC', symbol: 'BARC.L', name: 'Barclays PLC', exchange: 'LSE', country: 'United Kingdom', sector: 'Financial Services', currency: 'GBP', adr: 'BCS' },
  { id: 'LSE:VOD', symbol: 'VOD.L', name: 'Vodafone Group Plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Communication Services', currency: 'GBP', adr: 'VOD' },
  { id: 'LSE:LLOY', symbol: 'LLOY.L', name: 'Lloyds Banking Group plc', exchange: 'LSE', country: 'United Kingdom', sector: 'Financial Services', currency: 'GBP', adr: 'LYG' },
  { id: 'LSE:REL', symbol: 'REL.L', name: 'RELX PLC', exchange: 'LSE', country: 'United Kingdom', sector: 'Industrials', currency: 'GBP', adr: 'RELX' }
];

export async function loadUkCompanies() {
  return UK_COMPANIES;
}
