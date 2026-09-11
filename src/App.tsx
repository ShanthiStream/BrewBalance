import React, { useState, useEffect, useCallback } from 'react';
import { Intake, UserLimit, Recommendation, BeverageType, IntakeSource } from './types';
import { getIntakes, addIntake, removeIntake, getLimits, clearAllIntakes, loadSampleData } from './services/storage';
import { evaluateRecommendation } from './services/edgeMl';
import { RecommendationCard } from './components/RecommendationCard';
import { IntakeLoggerModal } from './components/IntakeLoggerModal';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { AiDailyAnalysisCard } from './components/AiDailyAnalysisCard';
import { Navigation, TabType } from './components/Navigation';
import { generateDailyAiAnalysis, DailyAiAnalysis } from './services/aiAnalysis';
import { Coffee, RotateCcw } from 'lucide-react';

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

  // Reset all data to clean fresh state
  const handleResetData = () => {
    localStorage.removeItem('brewbalance_ai_intakes_v2');
    localStorage.removeItem('brewbalance_intakes_v1');
    localStorage.removeItem('brewbalance_limits_v1');
    localStorage.removeItem('brewbalance_ai_limits_v2');
    clearAllIntakes();
    refreshData();
    setToastMessage('Intake history reset to clean 0ml start.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoadSampleData = () => {
    loadSampleData();
    refreshData();
    setToastMessage('7-day demo data loaded for chart preview.');
    setTimeout(() => setToastMessage(null), 3500);
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
            alt="BrewBalance AI Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '1px solid var(--border-glow-cyan)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)'
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.45rem', lineHeight: '1.1', background: 'linear-gradient(135deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
              BrewBalance <span style={{ fontSize: '0.74rem', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))', border: '1px solid var(--border-glow-cyan)', color: 'var(--color-water)', fontWeight: 800, letterSpacing: '0.05em' }}>AI</span>
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
            <div className="glass-panel" style={{
              padding: '18px 20px',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.7) 0%, rgba(10, 15, 26, 0.85) 100%)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Fast One-Tap Presets
                </span>
                <button
                  onClick={() => setIsLoggerOpen(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 12px',
                    color: '#00d2ff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Custom portion +
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {/* Water Fast Button */}
                <button
                  onClick={() => handleQuickLog('water', 250)}
                  style={{
                    background: 'linear-gradient(180deg, rgba(0, 210, 255, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.6)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 210, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.3)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <img
                    src="/assets/water.jpg"
                    alt="Water"
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #00d2ff', boxShadow: '0 0 10px rgba(0, 210, 255, 0.4)' }}
                  />
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#00d2ff' }}>+250ml</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Pure Water</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>0 mg caff</div>
                </button>

                {/* Tea Fast Button */}
                <button
                  onClick={() => handleQuickLog('tea', 250)}
                  style={{
                    background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <img
                    src="/assets/tea.jpg"
                    alt="Tea"
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}
                  />
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#10b981' }}>+250ml</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Artisan Tea</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>~45 mg caff</div>
                </button>

                {/* Coffee Fast Button */}
                <button
                  onClick={() => handleQuickLog('coffee', 250)}
                  style={{
                    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  <img
                    src="/assets/coffee.jpg"
                    alt="Coffee"
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #f59e0b', boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}
                  />
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f59e0b' }}>+250ml</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Espresso Brew</div>
                  <div style={{ fontSize: '0.66rem', color: '#64748b' }}>~95 mg caff</div>
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
            onLoadSampleData={handleLoadSampleData}
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
