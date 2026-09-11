import React from 'react';
import { Sparkles, AlertTriangle, Moon, Droplet, Coffee, CheckCircle2 } from 'lucide-react';
import { Recommendation } from '../types';
import confetti from 'canvas-confetti';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onQuickLog: (beverage: 'water' | 'tea' | 'coffee', volume: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onQuickLog
}) => {
  const { suggestedBeverage, confidenceScore, reasonCode, message, portionMl, currentStats } = recommendation;

  const getArtwork = () => {
    switch (suggestedBeverage) {
      case 'coffee': return '/assets/coffee.jpg';
      case 'tea': return '/assets/tea.jpg';
      default: return '/assets/water.jpg';
    }
  };

  const getBadgeDetails = () => {
    switch (reasonCode) {
      case 'LIMIT_EXCEEDED':
        return {
          icon: <AlertTriangle size={14} color="#f43f5e" />,
          label: 'Caffeine Quota Exceeded',
          color: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)'
        };
      case 'CIRCADIAN_CUTOFF':
        return {
          icon: <Moon size={14} color="#a855f7" />,
          label: 'Sleep Rhythm Guard',
          color: '#c084fc',
          bg: 'rgba(168, 85, 247, 0.15)'
        };
      case 'DEHYDRATION':
        return {
          icon: <Droplet size={14} color="#06b6d4" />,
          label: 'Dehydration Detected',
          color: 'var(--color-water)',
          bg: 'var(--color-water-bg)'
        };
      default:
        return {
          icon: <Sparkles size={14} color="#10b981" />,
          label: 'Edge-ML Optimal Window',
          color: 'var(--color-success)',
          bg: 'var(--color-tea-bg)'
        };
    }
  };

  const badge = getBadgeDetails();

  const handleQuickLog = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: suggestedBeverage === 'water' ? ['#06b6d4', '#38bdf8'] : suggestedBeverage === 'tea' ? ['#10b981', '#34d399'] : ['#f59e0b', '#d97706']
    });
    onQuickLog(suggestedBeverage, portionMl);
  };

  const waterPercent = Math.min(100, Math.round((currentStats.todayWaterMl / currentStats.waterTargetMl) * 100));
  const caffPercent = Math.min(100, Math.round((currentStats.todayCaffeineMg / currentStats.caffeineLimitMg) * 100));

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Visual Header Banner */}
      <div style={{
        position: 'relative',
        height: '210px',
        width: '100%',
        backgroundImage: `url(${getArtwork()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Soft Vignette Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.2) 0%, rgba(9, 13, 22, 0.85) 85%, #0f172a 100%)'
        }} />

        {/* Floating Top Badges */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.color}40`,
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(8px)'
          }}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(8px)'
          }}>
            Sub-5ms Edge ML • {Math.round(confidenceScore * 100)}% conf
          </div>
        </div>

        {/* Floating Title & Beverage Label */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 18,
          right: 18
        }}>
          <span style={{
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700
          }}>
            Real-Time Recommendation
          </span>
          <h2 style={{
            fontSize: '2rem',
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: suggestedBeverage === 'water' ? 'var(--color-water)' : suggestedBeverage === 'tea' ? 'var(--color-tea)' : 'var(--color-coffee)'
          }}>
            {suggestedBeverage}
            <span style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
              ({portionMl}ml)
            </span>
          </h2>
        </div>
      </div>

      {/* Card Content & Action Area */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.45', color: '#cbd5e1' }}>
          {message}
        </p>

        {/* Progress Gauges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Water Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-water)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Droplet size={12} /> Hydration
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{currentStats.todayWaterMl} / {currentStats.waterTargetMl}ml</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${waterPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                borderRadius: 3,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Caffeine Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
              <span style={{ color: currentStats.todayCaffeineMg >= currentStats.caffeineLimitMg ? 'var(--color-danger)' : 'var(--color-coffee)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Coffee size={12} /> Caffeine
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{currentStats.todayCaffeineMg} / {currentStats.caffeineLimitMg}mg</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${caffPercent}%`,
                height: '100%',
                background: currentStats.todayCaffeineMg >= currentStats.caffeineLimitMg 
                  ? 'linear-gradient(90deg, #f43f5e, #e11d48)' 
                  : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: 3,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Quick Log Action CTA */}
        <button
          onClick={handleQuickLog}
          className="btn"
          style={{
            width: '100%',
            padding: '12px 18px',
            background: suggestedBeverage === 'water'
              ? 'linear-gradient(135deg, #06b6d4, #0284c7)'
              : suggestedBeverage === 'tea'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            fontSize: '1.02rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <CheckCircle2 size={18} />
          <span>Log {portionMl}ml {suggestedBeverage.toUpperCase()} Now</span>
        </button>

        {/* Clever Support Callout on Caffeine Exceed / Cutoff */}
        {(reasonCode === 'LIMIT_EXCEEDED' || reasonCode === 'CIRCADIAN_CUTOFF') && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px dashed rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div style={{ fontSize: '0.8rem', color: '#fcd34d' }}>
              <span>☕ Reached your caffeine ceiling? Transfer the good vibes — </span>
              <strong>buy the developer a coffee!</strong>
            </div>
            <a
              href="https://buymeacoffee.com/shanthistream"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#f59e0b',
                color: '#000',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Fuel ☕
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
