import React from 'react';
import { DailyAiAnalysis } from '../services/aiAnalysis';
import { Sparkles, Droplet, Coffee, Moon, Scale, RotateCw, CheckCircle2 } from 'lucide-react';

interface AiDailyAnalysisCardProps {
  analysis: DailyAiAnalysis;
  onRefresh: () => void;
}

export const AiDailyAnalysisCard: React.FC<AiDailyAnalysisCardProps> = ({
  analysis,
  onRefresh
}) => {
  const getInsightIcon = (type: 'hydration' | 'caffeine' | 'circadian' | 'balance') => {
    switch (type) {
      case 'hydration':
        return <Droplet size={16} color="var(--color-water)" />;
      case 'caffeine':
        return <Coffee size={16} color="var(--color-coffee)" />;
      case 'circadian':
        return <Moon size={16} color="#c084fc" />;
      case 'balance':
        return <Scale size={16} color="var(--color-tea)" />;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 22, 0.95) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Ambient Top Glow Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #38bdf8, #10b981, transparent)'
      }} />

      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(56, 189, 248, 0.4)'
          }}>
            <Sparkles size={15} color="#38bdf8" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#f8fafc' }}>
              AI Daily Intake Synthesis
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Edge Intelligence • Generated at {analysis.generatedAt}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: analysis.tierBg,
            color: analysis.tierColor,
            border: `1px solid ${analysis.tierColor}40`,
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {analysis.vitalityTier} ({analysis.vitalityScore}/100)
          </span>
          <button
            onClick={onRefresh}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Recalculate Analysis"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Headline Callout */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderLeft: `3px solid ${analysis.tierColor}`,
        padding: '10px 14px',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        marginBottom: 16
      }}>
        <p style={{
          fontSize: '0.92rem',
          fontWeight: 600,
          color: '#e2e8f0',
          lineHeight: '1.4'
        }}>
          "{analysis.headline}"
        </p>
      </div>

      {/* Structured Insights Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {analysis.insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2
            }}>
              {getInsightIcon(insight.iconType)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {insight.category}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  {insight.title}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation Note Footer */}
      <div style={{
        background: 'rgba(6, 182, 212, 0.06)',
        border: '1px dashed rgba(6, 182, 212, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <CheckCircle2 size={16} color="var(--color-water)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
          <strong>Next Action:</strong> {analysis.recommendationNote}
        </span>
      </div>
    </div>
  );
};
