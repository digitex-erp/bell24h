import { IndustryComparisonItem } from '../../../../shared/stock-analysis.types';

interface MarketTrendsTableProps {
  industries: IndustryComparisonItem[];
}

export default function MarketTrendsTable({ industries }: MarketTrendsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Industry</th>
            <th className="text-right p-2">Perf.</th>
            <th className="text-right p-2">Vol.</th>
            <th className="text-right p-2">Top Symbol</th>
          </tr>
        </thead>
        <tbody>
          {industries.map((industry) => (
            <tr key={industry.industryId} className="border-b hover:bg-secondary">
              <td className="p-2 font-medium">{industry.industry}</td>
              <td className={`p-2 text-right font-medium ${
                industry.performance > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {industry.performance > 0 ? '+' : ''}
                {industry.performance.toFixed(2)}%
              </td>
              <td className="p-2 text-right">{industry.volatility.toFixed(2)}</td>
              <td className="p-2 text-right">
                <div className="flex items-center justify-end">
                  <span className="font-medium">{industry.topSymbol.symbol}</span>
                  <span className={`ml-2 ${
                    industry.topSymbol.performance > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ({industry.topSymbol.performance > 0 ? '+' : ''}
                    {industry.topSymbol.performance.toFixed(2)}%)
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}