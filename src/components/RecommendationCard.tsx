import React from 'react';
import { Sparkles, AlertTriangle, Moon, Droplet, Coffee, CheckCircle2, Zap } from 'lucide-react';
import { Recommendation } from '../types';
import confetti from 'canvas-confetti';
import { generateCreatorCoffeeMessage } from '../services/aiAnalysis';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onQuickLog: (beverage: 'water' | 'tea' | 'coffee', volume: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onQuickLog
}) => {
  const { suggestedBeverage, confidenceScore, reasonCode, message, portionMl, currentStats } = recommendation;
  const creatorCallout = generateCreatorCoffeeMessage();

  const getTheme = () => {
    switch (suggestedBeverage) {
      case 'coffee':
        return {
          color: '#f59e0b',
          deepColor: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)',
          bgGlow: 'rgba(245, 158, 11, 0.15)',
          artwork: '/assets/coffee.jpg',
          accentGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
          pillBorder: 'rgba(245, 158, 11, 0.35)',
          name: 'Coffee'
        };
      case 'tea':
        return {
          color: '#10b981',
          deepColor: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
          bgGlow: 'rgba(16, 185, 129, 0.15)',
          artwork: '/assets/tea.jpg',
          accentGradient: 'linear-gradient(135deg, #10b981, #047857)',
          pillBorder: 'rgba(16, 185, 129, 0.35)',
          name: 'Tea'
        };
      default:
        return {
          color: '#00d2ff',
          deepColor: '#0284c7',
          glow: 'rgba(0, 210, 255, 0.4)',
          bgGlow: 'rgba(0, 210, 255, 0.15)',
          artwork: '/assets/water.jpg',
          accentGradient: 'linear-gradient(135deg, #00d2ff, #0369a1)',
          pillBorder: 'rgba(0, 210, 255, 0.35)',
          name: 'Water'
        };
    }
  };

  const theme = getTheme();

  const getBadgeDetails = () => {
    switch (reasonCode) {
      case 'LIMIT_EXCEEDED':
        return {
          icon: <AlertTriangle size={13} color="#f43f5e" />,
          label: 'Caffeine Cap Reached',
          color: 'var(--color-danger)',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.35)'
        };
      case 'CIRCADIAN_CUTOFF':
        return {
          icon: <Moon size={13} color="#c084fc" />,
          label: 'Circadian Sleep Guard',
          color: '#c084fc',
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.35)'
        };
      case 'DEHYDRATION':
        return {
          icon: <Droplet size={13} color="#00d2ff" />,
          label: 'Hydration Recovery',
          color: 'var(--color-water)',
          bg: 'var(--color-water-bg)',
          border: 'rgba(0, 210, 255, 0.35)'
        };
      default:
        return {
          icon: <Sparkles size={13} color="#10b981" />,
          label: 'Edge-ML Optimal Window',
          color: 'var(--color-success)',
          bg: 'var(--color-tea-bg)',
          border: 'rgba(16, 185, 129, 0.35)'
        };
    }
  };

  const badge = getBadgeDetails();

  const handleQuickLog = () => {
    confetti({
      particleCount: 65,
      spread: 65,
      origin: { y: 0.7 },
      colors: suggestedBeverage === 'water' ? ['#00d2ff', '#38bdf8', '#ffffff'] : suggestedBeverage === 'tea' ? ['#10b981', '#34d399', '#ffffff'] : ['#f59e0b', '#d97706', '#ffffff']
    });
    onQuickLog(suggestedBeverage, portionMl);
  };

  // Ring Gauge Math
  const waterPercent = Math.min(100, Math.round((currentStats.todayWaterMl / currentStats.waterTargetMl) * 100));
  const caffPercent = Math.min(100, Math.round((currentStats.todayCaffeineMg / currentStats.caffeineLimitMg) * 100));

  const radiusOuter = 38;
  const circumOuter = 2 * Math.PI * radiusOuter;
  const dashOffsetWater = circumOuter - (waterPercent / 100) * circumOuter;

  const radiusInner = 28;
  const circumInner = 2 * Math.PI * radiusInner;
  const dashOffsetCaff = circumInner - (caffPercent / 100) * circumInner;

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient Luminescence Backdrop */}
      <div style={{
        position: 'absolute',
        inset: '-4px',
        background: `radial-gradient(ellipse at center, ${theme.bgGlow} 0%, transparent 70%)`,
        filter: 'blur(35px)',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'background 0.5s ease'
      }} />

      {/* Main Luxury Glass Card */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'linear-gradient(180deg, rgba(20, 29, 48, 0.75) 0%, rgba(10, 15, 26, 0.9) 100%)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08) inset'
        }}
      >
        {/* Specular Top Sheen */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.color} 50%, transparent 100%)`,
          opacity: 0.8
        }} />

        {/* Hero Visual Presentation */}
        <div style={{
          position: 'relative',
          height: '220px',
          width: '100%',
          backgroundImage: `url(${theme.artwork})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden'
        }}>
          {/* Multi-Stop Dark Vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(6, 9, 17, 0.25) 0%, rgba(10, 15, 26, 0.75) 70%, #0d1424 100%)'
          }} />

          {/* Top Status Bar Over Artwork */}
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
              border: `1px solid ${badge.border}`,
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
            }}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            <div style={{
              background: 'rgba(6, 10, 18, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Zap size={12} color={theme.color} />
              <span>{Math.round(confidenceScore * 100)}% Confidence</span>
            </div>
          </div>

          {/* Floating Hero Beverage Header */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#94a3b8',
                fontWeight: 700
              }}>
                Current Biological Need
              </span>
              <h2 style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                lineHeight: '1.05',
                color: theme.color,
                textShadow: `0 0 25px ${theme.glow}`,
                letterSpacing: '-0.03em',
                marginTop: 2
              }}>
                {theme.name}
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginLeft: 10
                }}>
                  {portionMl}ml
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Content & Apple-Style Concentric Activity Ring */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Description */}
          <p style={{ fontSize: '0.96rem', lineHeight: '1.5', color: '#e2e8f0', fontWeight: 400 }}>
            {message}
          </p>

          {/* Activity Gauge & Quick Numbers HUD */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 18px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25) inset'
          }}>
            {/* Concentric Dual Halo SVG Ring */}
            <div style={{ position: 'relative', width: 94, height: 94, flexShrink: 0 }}>
              <svg width="94" height="94" viewBox="0 0 94 94" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background tracks */}
                <circle cx="47" cy="47" r={radiusOuter} stroke="rgba(0, 210, 255, 0.15)" strokeWidth="8" fill="none" />
                <circle cx="47" cy="47" r={radiusInner} stroke="rgba(245, 158, 11, 0.15)" strokeWidth="8" fill="none" />

                {/* Animated Outer Ring (Water) */}
                <circle
                  cx="47"
                  cy="47"
                  r={radiusOuter}
                  stroke="#00d2ff"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumOuter}
                  strokeDashoffset={dashOffsetWater}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* Animated Inner Ring (Caffeine) */}
                <circle
                  cx="47"
                  cy="47"
                  r={radiusInner}
                  stroke={currentStats.todayCaffeineMg >= currentStats.caffeineLimitMg ? '#f43f5e' : '#f59e0b'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumInner}
                  strokeDashoffset={dashOffsetCaff}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </svg>

              {/* Center Ring Icon */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.color
              }}>
                {suggestedBeverage === 'water' ? <Droplet size={20} /> : <Coffee size={20} />}
              </div>
            </div>

            {/* Metrics Breakdown Readout */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Hydration Metric */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ color: '#00d2ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Droplet size={13} /> Hydration
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {currentStats.todayWaterMl} <span style={{ color: '#64748b', fontWeight: 500 }}>/ {currentStats.waterTargetMl}ml</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {waterPercent}% of daily replenishment goal
                </div>
              </div>

              {/* Caffeine Metric */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{
                    color: currentStats.todayCaffeineMg >= currentStats.caffeineLimitMg ? '#f43f5e' : '#f59e0b',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <Coffee size={13} /> Caffeine
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {currentStats.todayCaffeineMg} <span style={{ color: '#64748b', fontWeight: 500 }}>/ {currentStats.caffeineLimitMg}mg</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {caffPercent}% of maximum stimulant ceiling
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleQuickLog}
            className="btn"
            style={{
              width: '100%',
              padding: '14px 22px',
              background: theme.accentGradient,
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 800,
              boxShadow: `0 8px 24px ${theme.glow}, 0 1px 2px rgba(255, 255, 255, 0.4) inset`,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={20} />
            <span>Log {portionMl}ml {theme.name.toUpperCase()} Now</span>
          </button>

          {/* Contextual AI-Generated Dynamic Creator Support Callout */}
          <div style={{
            background: creatorCallout.accentBg,
            border: `1px solid ${creatorCallout.accentBorder}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            transition: 'all var(--transition-smooth)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: creatorCallout.accentColor,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Sparkles size={11} />
                <span>{creatorCallout.badge}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                {creatorCallout.message}
              </div>
            </div>
            <a
              href="https://buymeacoffee.com/shanthistream"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.74rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0
              }}
            >
              <span>{creatorCallout.actionText}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
