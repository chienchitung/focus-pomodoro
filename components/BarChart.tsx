import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;
  const barWidth = 30;
  const barMargin = 15;
  const chartWidth = data.length * (barWidth + barMargin);

  return (
    <div className="overflow-x-auto p-4">
        <svg width={chartWidth} height={chartHeight + 40} className="text-light">
            {data.map((d, i) => {
                const barHeight = (d.value / maxValue) * chartHeight;
                const x = i * (barWidth + barMargin);
                const y = chartHeight - barHeight;

                return (
                    <g key={d.label}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            className="fill-current text-accent/80 hover:text-accent transition-colors"
                        />
                        <text x={x + barWidth / 2} y={chartHeight + 18} textAnchor="middle" className="text-xs fill-current text-light/70">
                            {d.label}
                        </text>
                        <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-sm font-bold fill-current">
                            {d.value}
                        </text>
                    </g>
                );
            })}
             <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-current text-gray-600" strokeWidth="1" />
        </svg>
    </div>
  );
};

export default BarChart;
