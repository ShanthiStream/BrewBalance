import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Moon, Droplet, Coffee, CheckCircle2, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Recommendation } from '../types';
import confetti from 'canvas-confetti';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onQuickLog: (beverage: 'water' | 'tea' | 'coffee', volume: number) => void;
}

interface BeverageSlide {
  beverage: 'water' | 'tea' | 'coffee';
  name: string;
  subtitle: string;
  icon: string;
  artwork: string;
  color: string;
  deepColor: string;
  glow: string;
  bgGlow: string;
  accentGradient: string;
  defaultMl: number;
}

const BEVERAGE_SLIDES: BeverageSlide[] = [
  {
    beverage: 'water',
    name: 'Water',
    subtitle: 'Pure Hydration',
    icon: '💧',
    artwork: '/assets/water.webp',
    color: '#00d2ff',
    deepColor: '#0284c7',
    glow: 'rgba(0, 210, 255, 0.45)',
    bgGlow: 'rgba(0, 210, 255, 0.18)',
    accentGradient: 'linear-gradient(135deg, #00d2ff, #0369a1)',
    defaultMl: 300
  },
  {
    beverage: 'tea',
    name: 'Tea',
    subtitle: 'Mindful L-Theanine',
    icon: '🍵',
    artwork: '/assets/tea.webp',
    color: '#10b981',
    deepColor: '#059669',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgGlow: 'rgba(16, 185, 129, 0.18)',
    accentGradient: 'linear-gradient(135deg, #10b981, #047857)',
    defaultMl: 250
  },
  {
    beverage: 'coffee',
    name: 'Coffee',
    subtitle: 'Focused Energy',
    icon: '☕',
    artwork: '/assets/coffee.webp',
    color: '#f59e0b',
    deepColor: '#d97706',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgGlow: 'rgba(245, 158, 11, 0.18)',
    accentGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    defaultMl: 200
  }
];

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onQuickLog
}) => {
  const { suggestedBeverage, confidenceScore, reasonCode, message, portionMl, currentStats } = recommendation;

  // Sync initial slide index with AI recommendation
  const initialIndex = BEVERAGE_SLIDES.findIndex(s => s.beverage === suggestedBeverage);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPaused, setIsPaused] = useState(false);

  // When AI suggestion changes, align slide unless user paused
  useEffect(() => {
    const idx = BEVERAGE_SLIDES.findIndex(s => s.beverage === suggestedBeverage);
    if (idx >= 0) {
      setCurrentSlideIndex(idx);
    }
  }, [suggestedBeverage]);

  // Slideshow auto-advance timer (5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % BEVERAGE_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = BEVERAGE_SLIDES[currentSlideIndex];
  const isAiPick = currentSlide.beverage === suggestedBeverage;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev - 1 + BEVERAGE_SLIDES.length) % BEVERAGE_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev + 1) % BEVERAGE_SLIDES.length);
  };

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
    const logPortion = isAiPick ? portionMl : currentSlide.defaultMl;
    confetti({
      particleCount: 65,
      spread: 65,
      origin: { y: 0.7 },
      colors: currentSlide.beverage === 'water'
        ? ['#00d2ff', '#38bdf8', '#ffffff']
        : currentSlide.beverage === 'tea'
        ? ['#10b981', '#34d399', '#ffffff']
        : ['#f59e0b', '#d97706', '#ffffff']
    });
    onQuickLog(currentSlide.beverage, logPortion);
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
      {/* Dynamic Ambient Luminescence Backdrop */}
      <div style={{
        position: 'absolute',
        inset: '-6px',
        background: `radial-gradient(ellipse at center, ${currentSlide.bgGlow} 0%, transparent 70%)`,
        filter: 'blur(35px)',
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'background 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
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
          background: `linear-gradient(90deg, transparent 0%, ${currentSlide.color} 50%, transparent 100%)`,
          opacity: 0.9,
          transition: 'background 0.8s ease'
        }} />

        {/* Hero Visual Slideshow Presentation */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            position: 'relative',
            height: '240px',
            width: '100%',
            overflow: 'hidden',
            cursor: 'default'
          }}
        >
          {/* Stacked Cross-Fade Slides with Ken-Burns Motion */}
          {BEVERAGE_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.beverage}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${slide.artwork})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 6s cubic-bezier(0.1, 0.8, 0.2, 1)',
                  zIndex: isActive ? 1 : 0,
                  pointerEvents: 'none'
                }}
              />
            );
          })}

          {/* Multi-Stop Dark Cinematic Vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(6, 9, 17, 0.35) 0%, rgba(10, 15, 26, 0.65) 60%, #0d1424 100%)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Top Status Bar Over Artwork */}
          <div style={{
            position: 'absolute',
            top: 14,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3
          }}>
            <div style={{
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              fontSize: '0.75rem',
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

            {/* Slide Quick Selectors */}
            <div style={{
              display: 'flex',
              gap: 5,
              background: 'rgba(6, 10, 18, 0.72)',
              padding: '3px 5px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)'
            }}>
              {BEVERAGE_SLIDES.map((s, idx) => {
                const isSelected = idx === currentSlideIndex;
                const isSug = s.beverage === suggestedBeverage;
                return (
                  <button
                    key={s.beverage}
                    onClick={() => setCurrentSlideIndex(idx)}
                    title={`View ${s.name}${isSug ? ' (AI Suggested)' : ''}`}
                    style={{
                      background: isSelected ? `${s.color}30` : 'transparent',
                      border: isSelected ? `1px solid ${s.color}` : '1px solid transparent',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <span>{s.icon}</span>
                    <span style={{ fontSize: '0.7rem' }}>{s.name}</span>
                    {isSug && (
                      <span style={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        background: 'rgba(255,255,255,0.22)',
                        padding: '1px 3px',
                        borderRadius: 3
                      }}>
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floating Left / Right Slide Navigation Buttons */}
          <button
            onClick={handlePrev}
            aria-label="Previous beverage slide"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 10, 18, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next beverage slide"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 10, 18, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Floating Hero Beverage Header */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            zIndex: 3
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isAiPick ? currentSlide.color : '#94a3b8',
                  fontWeight: 700
                }}>
                  {isAiPick ? '★ AI Biological Recommendation' : `${currentSlide.subtitle}`}
                </span>
                {isAiPick && (
                  <span style={{
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    background: 'rgba(6, 10, 18, 0.6)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    <Zap size={11} color={currentSlide.color} />
                    {Math.round(confidenceScore * 100)}% Match
                  </span>
                )}
              </div>
              <h2 style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                lineHeight: '1.05',
                color: currentSlide.color,
                textShadow: `0 0 25px ${currentSlide.glow}`,
                letterSpacing: '-0.03em',
                marginTop: 3
              }}>
                {currentSlide.name}
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginLeft: 10
                }}>
                  {isAiPick ? `${portionMl}ml` : `${currentSlide.defaultMl}ml`}
                </span>
              </h2>
            </div>

            {/* Slide Position Indicator Dots */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              {BEVERAGE_SLIDES.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  onClick={() => setCurrentSlideIndex(dotIdx)}
                  style={{
                    width: dotIdx === currentSlideIndex ? 22 : 6,
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    background: dotIdx === currentSlideIndex ? currentSlide.color : 'rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content & Apple-Style Concentric Activity Ring */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Description */}
          <p style={{ fontSize: '0.96rem', lineHeight: '1.5', color: '#e2e8f0', fontWeight: 400 }}>
            {isAiPick
              ? message
              : `Previewing ${currentSlide.name}: ${currentSlide.subtitle}. Click below to log ${currentSlide.defaultMl}ml, or tap the AI tag above to return to your personalized recommendation.`}
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
                color: currentSlide.color,
                transition: 'color 0.5s ease'
              }}>
                {currentSlide.beverage === 'water' ? <Droplet size={20} /> : <Coffee size={20} />}
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
              background: currentSlide.accentGradient,
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 800,
              boxShadow: `0 8px 24px ${currentSlide.glow}, 0 1px 2px rgba(255, 255, 255, 0.4) inset`,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background 0.5s ease, box-shadow 0.5s ease'
            }}
          >
            <CheckCircle2 size={20} />
            <span>
              Log {isAiPick ? portionMl : currentSlide.defaultMl}ml {currentSlide.name.toUpperCase()} Now
              {isAiPick ? ' (AI Pick)' : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

