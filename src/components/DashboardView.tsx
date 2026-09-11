import React, { useState } from 'react';
import { DashboardRange, Intake } from '../types';
import { getDashboardStats } from '../services/storage';
import { Droplet, Coffee, Award, Clock, Trash2, Activity } from 'lucide-react';

interface DashboardViewProps {
  intakes: Intake[];
  onDeleteIntake: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ intakes, onDeleteIntake }) => {
  const [selectedRange, setSelectedRange] = useState<DashboardRange>('week');
  const stats = getDashboardStats(selectedRange);

  const ranges: { key: DashboardRange; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Past 7 Days' },
    { key: 'month', label: 'Past 30 Days' },
    { key: 'year', label: 'Past Year' },
    { key: 'lifetime', label: 'All Time' }
  ];

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 560;
  const padding = 28;
  const maxWater = Math.max(...stats.series.map(s => s.waterMl), 1000);
  const maxCaff = Math.max(...stats.series.map(s => s.caffeineMg), 100);

  // Generate SVG Path for Water curve
  const waterPoints = stats.series.map((pt, idx) => {
    const x = padding + (idx / Math.max(1, stats.series.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (pt.waterMl / maxWater) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Generate SVG Path for Caffeine curve
  const caffPoints = stats.series.map((pt, idx) => {
    const x = padding + (idx / Math.max(1, stats.series.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (pt.caffeineMg / maxCaff) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const formatHour = (hour: number | null) => {
    if (hour === null) return 'N/A';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Range Selector Header */}
      <div style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 'var(--radius-full)',
        padding: 4,
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setSelectedRange(r.key)}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: selectedRange === r.key ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(2, 132, 199, 0.35))' : 'transparent',
              color: selectedRange === r.key ? '#38bdf8' : 'var(--text-muted)',
              border: selectedRange === r.key ? '1px solid var(--border-glow-cyan)' : '1px solid transparent',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: selectedRange === r.key ? '0 2px 10px rgba(6, 182, 212, 0.2)' : 'none'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: SEPARATE BEVERAGE METRIC CARDS (Water, Tea, Coffee) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Activity size={16} color="var(--color-water)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Beverage Breakdown ({ranges.find(r => r.key === selectedRange)?.label})
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {/* 1. Pure Water Card */}
          <div
            className="glass-panel"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid rgba(6, 182, 212, 0.25)',
              background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img
                src="/assets/water.jpg"
                alt="Water"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--color-water)',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.35)'
                }}
              />
              <span style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--color-water)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                0 mg caff
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Water Intake
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-water)', lineHeight: '1.1', marginTop: 2 }}>
                {stats.beverages.water.count}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                  glasses
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: 8,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Volume:</span>
              <strong style={{ color: '#fff' }}>
                {(stats.beverages.water.volumeMl / 1000).toFixed(1)} L
              </strong>
            </div>
          </div>

          {/* 2. Tea Card */}
          <div
            className="glass-panel"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid rgba(16, 185, 129, 0.25)',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img
                src="/assets/tea.jpg"
                alt="Tea"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--color-tea)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.35)'
                }}
              />
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--color-tea)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                ~{stats.beverages.tea.caffeineMg}mg caff
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Tea Cups
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-tea)', lineHeight: '1.1', marginTop: 2 }}>
                {stats.beverages.tea.count}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                  cups
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: 8,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Volume:</span>
              <strong style={{ color: '#fff' }}>
                {(stats.beverages.tea.volumeMl / 1000).toFixed(1)} L
              </strong>
            </div>
          </div>

          {/* 3. Coffee Card */}
          <div
            className="glass-panel"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid rgba(245, 158, 11, 0.25)',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img
                src="/assets/coffee.jpg"
                alt="Coffee"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--color-coffee)',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.35)'
                }}
              />
              <span style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-coffee)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                ~{Math.round(stats.beverages.coffee.caffeineMg)}mg caff
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Coffee Cups
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-coffee)', lineHeight: '1.1', marginTop: 2 }}>
                {stats.beverages.coffee.count}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
                  cups
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: 8,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Volume:</span>
              <strong style={{ color: '#fff' }}>
                {(stats.beverages.coffee.volumeMl / 1000).toFixed(1)} L
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADHERENCE & TOTALS KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Adherence Score */}
        <div className="glass-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-success)', marginBottom: 4 }}>
            <Award size={15} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Adherence</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {stats.complianceScore}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target compliance</div>
        </div>

        {/* Total Caffeine */}
        <div className="glass-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-coffee)', marginBottom: 4 }}>
            <Coffee size={15} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Caffeine Total</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Math.round(stats.totalCaffeineMg)}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>mg</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Across all brews</div>
        </div>

        {/* Peak Intake Hour */}
        <div className="glass-panel" style={{ padding: '16px 14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#c084fc', marginBottom: 4 }}>
            <Clock size={15} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Peak Hour</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            {formatHour(stats.peakConsumptionHour)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top stimulation time</div>
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE TIME-SERIES SVG CHART */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Intake Trajectory</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Continuous volume (ml) & caffeine (mg) correlation</p>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--color-water)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-water)' }} />
              Water
            </span>
            <span style={{ color: 'var(--color-coffee)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-coffee)' }} />
              Caffeine
            </span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Guide Lines */}
            <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.12)" />

            {/* Water Line */}
            {waterPoints && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                points={waterPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Caffeine Line */}
            {caffPoints && (
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                points={caffPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* X-Axis Data Point Labels */}
            {stats.series.map((pt, idx) => {
              const x = padding + (idx / Math.max(1, stats.series.length - 1)) * (chartWidth - padding * 2);
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {pt.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* SECTION 4: BEVERAGE SHARE PROGRESS BAR */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Beverage Portfolio Share</h4>
        <div style={{
          height: 20,
          borderRadius: '10px',
          display: 'flex',
          overflow: 'hidden',
          marginBottom: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ width: `${stats.beverageBreakdown.waterPercentage}%`, background: 'var(--color-water)', transition: 'width 0.4s ease' }} title={`Water: ${stats.beverageBreakdown.waterPercentage}%`} />
          <div style={{ width: `${stats.beverageBreakdown.teaPercentage}%`, background: 'var(--color-tea)', transition: 'width 0.4s ease' }} title={`Tea: ${stats.beverageBreakdown.teaPercentage}%`} />
          <div style={{ width: `${stats.beverageBreakdown.coffeePercentage}%`, background: 'var(--color-coffee)', transition: 'width 0.4s ease' }} title={`Coffee: ${stats.beverageBreakdown.coffeePercentage}%`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--color-water)', fontWeight: 800, fontSize: '1.2rem' }}>
              {stats.beverageBreakdown.waterPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Water ({stats.beverages.water.count} logs)</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--color-tea)', fontWeight: 800, fontSize: '1.2rem' }}>
              {stats.beverageBreakdown.teaPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tea ({stats.beverages.tea.count} logs)</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--color-coffee)', fontWeight: 800, fontSize: '1.2rem' }}>
              {stats.beverageBreakdown.coffeePercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coffee ({stats.beverages.coffee.count} logs)</div>
          </div>
        </div>
      </div>

      {/* SECTION 5: HISTORICAL INTAKE LOG */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Intake History Log</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {intakes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No intake records yet.</p>
          ) : (
            intakes.slice(0, 25).map(item => {
              const date = new Date(item.loggedAt);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: item.beverageType === 'water' ? 'var(--color-water-bg)' : item.beverageType === 'tea' ? 'var(--color-tea-bg)' : 'var(--color-coffee-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.beverageType === 'water' ? 'var(--color-water)' : item.beverageType === 'tea' ? 'var(--color-tea)' : 'var(--color-coffee)'
                    }}>
                      {item.beverageType === 'water' ? <Droplet size={18} /> : <Coffee size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {item.beverageType} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({item.volumeMl}ml)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {dateStr} at {timeStr} • <span style={{ textTransform: 'uppercase' }}>{item.source}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.caffeineMg > 0 && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-coffee)' }}>
                        +{item.caffeineMg}mg
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteIntake(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4
                      }}
                      title="Delete entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
