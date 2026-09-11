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
        return <Droplet size={16} color="#00d2ff" />;
      case 'caffeine':
        return <Coffee size={16} color="#f59e0b" />;
      case 'circadian':
        return <Moon size={16} color="#c084fc" />;
      case 'balance':
        return <Scale size={16} color="#10b981" />;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(10, 15, 26, 0.95) 100%)',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08) inset'
      }}
    >
      {/* Specular Ambient Glow Sweep */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #00d2ff, #10b981, transparent)'
      }} />

      {/* Header Row with AI Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.25), rgba(16, 185, 129, 0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 210, 255, 0.5)',
            boxShadow: '0 0 14px rgba(0, 210, 255, 0.35)'
          }}>
            <Sparkles size={16} color="#00d2ff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h4 style={{ fontSize: '1.02rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                AI Daily Intake Synthesis
              </h4>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              On-device neural inference • Synced {analysis.generatedAt}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: analysis.tierBg,
            color: analysis.tierColor,
            border: `1px solid ${analysis.tierColor}60`,
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 800,
            boxShadow: `0 0 12px ${analysis.tierBg}`
          }}>
            {analysis.vitalityTier} • {analysis.vitalityScore}/100
          </span>
          <button
            onClick={onRefresh}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
            title="Recalculate Analysis"
          >
            <RotateCw size={14} color="#94a3b8" />
          </button>
        </div>
      </div>

      {/* Clinical Headline Callout */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderLeft: `3px solid ${analysis.tierColor}`,
        padding: '12px 16px',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        marginBottom: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2) inset'
      }}>
        <p style={{
          fontSize: '0.94rem',
          fontWeight: 600,
          color: '#f1f5f9',
          lineHeight: '1.45',
          fontStyle: 'italic'
        }}>
          "{analysis.headline}"
        </p>
      </div>

      {/* Structured 3-Pillar Insights Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {analysis.insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.025)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1
            }}>
              {getInsightIcon(insight.iconType)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>
                  {insight.category}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  {insight.title}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.45' }}>
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Next Step Footer */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <CheckCircle2 size={18} color="#00d2ff" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>
          <strong style={{ color: '#00d2ff' }}>Recommended Action: </strong>
          {analysis.recommendationNote}
        </span>
      </div>
    </div>
  );
};
