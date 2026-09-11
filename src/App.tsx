import React, { useState, useEffect, useCallback } from 'react';
import { Intake, UserLimit, Recommendation, BeverageType, IntakeSource } from './types';
import { getIntakes, addIntake, removeIntake, getLimits } from './services/storage';
import { evaluateRecommendation } from './services/edgeMl';
import { RecommendationCard } from './components/RecommendationCard';
import { IntakeLoggerModal } from './components/IntakeLoggerModal';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { AiDailyAnalysisCard } from './components/AiDailyAnalysisCard';
import { Navigation, TabType } from './components/Navigation';
import { generateDailyAiAnalysis, DailyAiAnalysis } from './services/aiAnalysis';
import { Droplet, Coffee, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isLoggerOpen, setIsLoggerOpen] = useState<boolean>(false);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [limits, setLimits] = useState<UserLimit[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [dailyAnalysis, setDailyAnalysis] = useState<DailyAiAnalysis>(generateDailyAiAnalysis);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state from storage
  const refreshData = useCallback(() => {
    const loadedIntakes = getIntakes();
    const loadedLimits = getLimits();
    setIntakes(loadedIntakes);
    setLimits(loadedLimits);
    setRecommendation(evaluateRecommendation());
    setDailyAnalysis(generateDailyAiAnalysis());
  }, []);

  useEffect(() => {
    refreshData();

    // Re-evaluate every 30 seconds to catch cut-off hours and dehydration windows
    const timer = setInterval(() => {
      setRecommendation(evaluateRecommendation());
      setDailyAnalysis(generateDailyAiAnalysis());
    }, 30000);

    return () => clearInterval(timer);
  }, [refreshData]);

  // Log an intake
  const handleSaveIntake = (newIntake: {
    beverageType: BeverageType;
    volumeMl: number;
    caffeineMg: number;
    source: IntakeSource;
    label?: string;
  }) => {
    const record = addIntake({
      ...newIntake,
      loggedAt: new Date().toISOString()
    });

    setLastAddedId(record.id);
    setToastMessage(`Logged ${record.volumeMl}ml ${record.beverageType}`);
    setTimeout(() => setToastMessage(null), 4000);
    refreshData();
  };

  // Quick 1-tap logging
  const handleQuickLog = (beverage: BeverageType, volumeMl: number) => {
    let caffeine = 0;
    if (beverage === 'tea') caffeine = 45;
    if (beverage === 'coffee') caffeine = 95;

    handleSaveIntake({
      beverageType: beverage,
      volumeMl,
      caffeineMg: caffeine,
      source: 'manual'
    });
  };

  // Undo last logged item
  const handleUndo = () => {
    if (lastAddedId) {
      removeIntake(lastAddedId);
      setLastAddedId(null);
      setToastMessage('Intake undone');
      setTimeout(() => setToastMessage(null), 2500);
      refreshData();
    }
  };

  // Delete specific intake
  const handleDeleteIntake = (id: string) => {
    removeIntake(id);
    refreshData();
  };

  // Reset data to seed
  const handleResetData = () => {
    localStorage.removeItem('brewbalance_intakes_v1');
    localStorage.removeItem('brewbalance_limits_v1');
    refreshData();
  };

  return (
    <div className="app-container">
      {/* Top Application Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 0 10px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/assets/logo.jpg"
            alt="BrewBalance Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '1px solid var(--border-active)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)'
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.45rem', lineHeight: '1.1', background: 'linear-gradient(135deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BrewBalance
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Intelligent Hydration & Caffeine Engine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="https://buymeacoffee.com/shanthistream"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill"
            style={{
              textDecoration: 'none',
              fontSize: '0.75rem',
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.2s ease'
            }}
            title="Fuel the creator on BuyMeACoffee"
          >
            <Coffee size={13} />
            <span>Fuel Creator</span>
          </a>

          <span className="glass-pill" style={{ fontSize: '0.75rem', color: 'var(--color-water)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-water)', display: 'inline-block' }} />
            Edge ML
          </span>
        </div>
      </header>

      {/* Main Tab Views */}
      <main>
        {activeTab === 'home' && recommendation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Primary Recommendation Card */}
            <RecommendationCard
              recommendation={recommendation}
              onQuickLog={handleQuickLog}
            />

            {/* Quick 1-Tap Logging Shelf */}
            <div className="glass-panel" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Fast One-Tap Presets
                </span>
                <button
                  onClick={() => setIsLoggerOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-water)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Custom portion +
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {/* Water Fast Button */}
                <button
                  onClick={() => handleQuickLog('water', 250)}
                  className="btn"
                  style={{
                    background: 'var(--color-water-bg)',
                    border: '1px solid var(--border-glow-cyan)',
                    color: 'var(--color-water)',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Droplet size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>+250ml Water</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Pure Hydration</span>
                </button>

                {/* Tea Fast Button */}
                <button
                  onClick={() => handleQuickLog('tea', 250)}
                  className="btn"
                  style={{
                    background: 'var(--color-tea-bg)',
                    border: '1px solid var(--border-glow-emerald)',
                    color: 'var(--color-tea)',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Coffee size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>+250ml Tea</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>45mg Caffeine</span>
                </button>

                {/* Coffee Fast Button */}
                <button
                  onClick={() => handleQuickLog('coffee', 250)}
                  className="btn"
                  style={{
                    background: 'var(--color-coffee-bg)',
                    border: '1px solid var(--border-glow-amber)',
                    color: 'var(--color-coffee)',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Coffee size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>+250ml Coffee</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>95mg Caffeine</span>
                </button>
              </div>
            </div>

            {/* AI-Generated Daily Consumption Analysis */}
            <AiDailyAnalysisCard
              analysis={dailyAnalysis}
              onRefresh={() => setDailyAnalysis(generateDailyAiAnalysis())}
            />

            {/* Today's Timeline Highlights */}
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: '0.98rem' }}>Today's Timeline</h4>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-water)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  View full analytics &rarr;
                </button>
              </div>

              {intakes.filter(i => i.loggedAt.startsWith(new Date().toISOString().split('T')[0])).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No drinks logged yet today. Start with a fresh glass of water.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {intakes
                    .filter(i => i.loggedAt.startsWith(new Date().toISOString().split('T')[0]))
                    .slice(0, 4)
                    .map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.84rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: item.beverageType === 'water' ? 'var(--color-water)' : item.beverageType === 'tea' ? 'var(--color-tea)' : 'var(--color-coffee)'
                          }} />
                          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{item.beverageType}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({item.volumeMl}ml)</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {new Date(item.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            intakes={intakes}
            onDeleteIntake={handleDeleteIntake}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            limits={limits}
            onLimitsUpdated={refreshData}
            onDataReset={handleResetData}
          />
        )}
      </main>

      {/* Floating Undo Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 85,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 90,
          backdropFilter: 'blur(12px)',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toastMessage}</span>
          {lastAddedId && (
            <button
              onClick={handleUndo}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={12} /> Undo
            </button>
          )}
        </div>
      )}

      {/* Modal Logger */}
      <IntakeLoggerModal
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSaveIntake={handleSaveIntake}
      />

      {/* Persistent Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogModal={() => setIsLoggerOpen(true)}
      />
    </div>
  );
};
