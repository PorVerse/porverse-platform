// app/dashboard/por-health/biometrics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './biometrics.module.css';

interface BiometricReading {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'blood_sugar' | 'weight' | 'body_fat' | 'temperature';
  value: string;
  unit: string;
  timestamp: Date;
  source: 'manual' | 'apple_health' | 'fitbit' | 'oura' | 'whoop';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  recommendation: string;
  timestamp: Date;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'scale' | 'blood_pressure_monitor';
  model: string;
  isConnected: boolean;
  batteryLevel?: number;
  lastSync: Date;
  metrics: string[];
}

interface HealthGoal {
  id: string;
  name: string;
  target: string;
  current: string;
  unit: string;
  progress: number;
  icon: string;
  range: string;
}

export default function BiometricsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'realtime' | 'trends' | 'devices' | 'goals'>('realtime');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [showAddModal, setShowAddModal] = useState(false);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [recentReadings, setRecentReadings] = useState<BiometricReading[]>([]);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);

  // Mock data loading
  useEffect(() => {
    const loadMockData = async () => {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock alerts
      setAlerts([
        {
          id: '1',
          type: 'critical',
          metric: 'Blood Pressure',
          message: 'Reading of 160/95 mmHg is significantly elevated',
          recommendation: 'Please consult your doctor immediately and avoid strenuous activity',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '2',
          type: 'warning',
          metric: 'Heart Rate',
          message: 'Resting heart rate has increased by 15% over last week',
          recommendation: 'Consider reducing caffeine intake and ensure adequate sleep',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        }
      ]);

      // Mock recent readings
      setRecentReadings([
        {
          id: '1',
          type: 'heart_rate',
          value: '72',
          unit: 'bpm',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'apple_health',
          quality: 'excellent',
          notes: 'Resting measurement'
        },
        {
          id: '2',
          type: 'blood_pressure',
          value: '160/95',
          unit: 'mmHg',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          source: 'manual',
          quality: 'good',
          notes: 'Measured after 5 min rest'
        },
        {
          id: '3',
          type: 'weight',
          value: '75.2',
          unit: 'kg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          source: 'fitbit',
          quality: 'excellent'
        },
        {
          id: '4',
          type: 'blood_sugar',
          value: '95',
          unit: 'mg/dL',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          source: 'manual',
          quality: 'good',
          notes: 'Fasting measurement'
        }
      ]);

      // Mock devices
      setDevices([
        {
          id: '1',
          name: 'Apple Watch Series 9',
          type: 'smartwatch',
          model: 'A2986',
          isConnected: true,
          batteryLevel: 78,
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          metrics: ['heart_rate', 'blood_oxygen', 'ecg', 'activity']
        },
        {
          id: '2',
          name: 'Fitbit Aria Scale',
          type: 'scale',
          model: 'FB202',
          isConnected: true,
          batteryLevel: 45,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metrics: ['weight', 'body_fat', 'bmi']
        },
        {
          id: '3',
          name: 'Omron BP Monitor',
          type: 'blood_pressure_monitor',
          model: 'HEM-7120',
          isConnected: false,
          lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
          metrics: ['blood_pressure', 'pulse']
        }
      ]);

      // Mock goals
      setGoals([
        {
          id: '1',
          name: 'Resting Heart Rate',
          target: '< 60 bpm',
          current: '72 bpm',
          unit: 'bpm',
          progress: 65,
          icon: '❤️',
          range: '50-60 bpm optimal'
        },
        {
          id: '2',
          name: 'Blood Pressure',
          target: '< 120/80 mmHg',
          current: '160/95 mmHg',
          unit: 'mmHg',
          progress: 20,
          icon: '🩸',
          range: '90-120/60-80 mmHg healthy'
        },
        {
          id: '3',
          name: 'Weight Management',
          target: '70-75 kg',
          current: '75.2 kg',
          unit: 'kg',
          progress: 85,
          icon: '⚖️',
          range: 'BMI 18.5-24.9 healthy'
        },
        {
          id: '4',
          name: 'Blood Sugar',
          target: '80-100 mg/dL',
          current: '95 mg/dL',
          unit: 'mg/dL',
          progress: 90,
          icon: '🍯',
          range: '80-130 mg/dL normal'
        }
      ]);

      setLoading(false);
    };

    loadMockData();
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMetricIcon = (type: string) => {
    const icons = {
      heart_rate: '❤️',
      blood_pressure: '🩸',
      blood_sugar: '🍯',
      weight: '⚖️',
      body_fat: '📊',
      temperature: '🌡️'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getDeviceIcon = (type: string) => {
    const icons = {
      smartwatch: '⌚',
      fitness_tracker: '🏃',
      scale: '⚖️',
      blood_pressure_monitor: '🩺'
    };
    return icons[type as keyof typeof icons] || '📱';
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      excellent: '#22c55e',
      good: '#3b82f6',
      fair: '#f59e0b',
      poor: '#ef4444'
    };
    return colors[quality as keyof typeof colors] || '#9ca3af';
  };

  const getCurrentMetrics = () => {
    const latest = recentReadings.reduce((acc, reading) => {
      if (!acc[reading.type] || reading.timestamp > acc[reading.type].timestamp) {
        acc[reading.type] = reading;
      }
      return acc;
    }, {} as Record<string, BiometricReading>);

    return Object.values(latest);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
        </div>
        <h2 className={styles.loadingTitle}>🔬 Loading Biometrics</h2>
        <p className={styles.loadingText}>
          Connecting to your health devices and fetching the latest readings...
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.biometricsPage} biometrics-page`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/por-health" className={styles.backButton}>
            ← Back to PorHealth
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>🔬 Live Biometrics</h1>
            <p className={styles.pageSubtitle}>
              Real-time health monitoring with AI-powered insights and personalized recommendations
            </p>
          </div>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.liveControls}>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`${styles.liveToggle} ${isLiveMode ? styles.active : ''}`}
            >
              <div className={styles.liveIndicator} />
              {isLiveMode ? 'Live Mode ON' : 'Live Mode OFF'}
            </button>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className={styles.refreshSelect}
              disabled={!isLiveMode}
            >
              <option value="15">Every 15s</option>
              <option value="30">Every 30s</option>
              <option value="60">Every 1m</option>
              <option value="300">Every 5m</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className={styles.addReadingButton}
          >
            ➕ Add Reading
          </button>
        </div>
      </header>

      {/* Health Alerts */}
      {alerts.length > 0 && (
        <section className={styles.alertsSection}>
          <div className={styles.alertsContainer}>
            {alerts.map(alert => (
              <div key={alert.id} className={`${styles.healthAlert} ${styles[alert.type]}`}>
                <div className={styles.alertContent}>
                  <div className={styles.alertHeader}>
                    <span className={styles.alertIcon}>
                      {alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className={styles.alertMetric}>{alert.metric}</span>
                    <span className={styles.alertTime}>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  <p className={styles.alertMessage}>{alert.message}</p>
                  <p className={styles.alertRecommendation}>{alert.recommendation}</p>
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className={styles.dismissButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <nav className={styles.tabNavigation}>
        {[
          { key: 'realtime', label: 'Real-time', icon: '📊' },
          { key: 'trends', label: 'Trends', icon: '📈' },
          { key: 'devices', label: 'Devices', icon: '📱' },
          { key: 'goals', label: 'Goals', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className={styles.tabContent}>
        {activeTab === 'realtime' && (
          <div className={styles.realtimeTab}>
            {/* Current Metrics Grid */}
            <section>
              <h2 className={styles.sectionTitle}>📊 Current Readings</h2>
              <div className={styles.metricsGrid}>
                {getCurrentMetrics().map(metric => (
                  <div key={metric.id} className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>{getMetricIcon(metric.type)}</span>
                      <div className={styles.metricInfo}>
                        <h3 className={styles.metricName}>
                          {metric.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <p className={styles.metricTime}>{formatTimestamp(metric.timestamp)}</p>
                      </div>
                      <div 
                        className={styles.qualityIndicator}
                        style={{ backgroundColor: getQualityColor(metric.quality) }}
                      />
                    </div>
                    <div className={styles.metricValue}>
                      {metric.value} {metric.unit}
                    </div>
                    <p className={styles.metricSource}>Source: {metric.source.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Readings */}
            <section>
              <h2 className={styles.sectionTitle}>📋 Recent Activity</h2>
              <div className={styles.recentReadings}>
                <div className={styles.readingsList}>
                  {recentReadings.map(reading => (
                    <div key={reading.id} className={styles.readingItem}>
                      <div className={styles.readingIcon}>
                        {getMetricIcon(reading.type)}
                      </div>
                      <div className={styles.readingContent}>
                        <div className={styles.readingHeader}>
                          <span className={styles.readingName}>
                            {reading.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={styles.readingTime}>{formatTimestamp(reading.timestamp)}</span>
                        </div>
                        <div className={styles.readingValue}>
                          {reading.value} {reading.unit}
                        </div>
                        {reading.notes && (
                          <p className={styles.readingNotes}>{reading.notes}</p>
                        )}
                      </div>
                      <div 
                        className={styles.readingQuality}
                        style={{ backgroundColor: getQualityColor(reading.quality) }}
                      >
                        {reading.quality}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className={styles.trendsTab}>
            <div className={styles.trendsGrid}>
              {['Heart Rate', 'Blood Pressure', 'Weight', 'Blood Sugar'].map((metric, index) => (
                <div key={metric} className={styles.trendCard}>
                  <div className={styles.trendHeader}>
                    <div className={styles.trendInfo}>
                      <span className={styles.trendIcon}>{getMetricIcon(metric.toLowerCase().replace(' ', '_'))}</span>
                      <div>
                        <h3 className={styles.trendName}>{metric}</h3>
                        <p className={styles.trendPeriod}>Last 30 days</p>
                      </div>
                    </div>
                    <div className={styles.trendChange}>
                      <span 
                        className={styles.changeValue}
                        style={{ color: index % 2 === 0 ? '#22c55e' : '#ef4444' }}
                      >
                        {index % 2 === 0 ? '+5.2%' : '-8.1%'}
                      </span>
                      <span className={styles.changeTrend}>
                        {index % 2 === 0 ? 'improving' : 'concerning'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.trendChart}>
                    <div className={styles.chartPlaceholder}>
                      📈 Interactive Chart
                      <br />
                      <small>Chart visualization coming soon</small>
                    </div>
                    <div className={styles.chartSummary}>
                      Average: {index === 0 ? '68 bpm' : index === 1 ? '125/82 mmHg' : index === 2 ? '74.8 kg' : '92 mg/dL'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className={styles.devicesTab}>
            <div className={styles.devicesHeader}>
              <h2 className={styles.sectionTitle}>📱 Connected Devices</h2>
              <button className={styles.addDeviceButton}>
                ➕ Add Device
              </button>
            </div>
            
            <div className={styles.devicesList}>
              {devices.map(device => (
                <div key={device.id} className={styles.deviceCard}>
                  <div className={styles.deviceHeader}>
                    <div className={styles.deviceInfo}>
                      <div className={styles.deviceIcon}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className={styles.deviceName}>{device.name}</h3>
                        <p className={styles.deviceModel}>{device.model}</p>
                      </div>
                    </div>
                    <div className={styles.deviceStatus}>
                      <span className={`${styles.connectionStatus} ${device.isConnected ? styles.connected : styles.disconnected}`}>
                        {device.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      {device.batteryLevel && (
                        <span className={styles.batteryLevel}>
                          🔋 {device.batteryLevel}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.deviceDetails}>
                    <div className={styles.syncInfo}>
                      <span>Last sync: {formatTimestamp(device.lastSync)}</span>
                      <span>Metrics: {device.metrics.length}</span>
                    </div>
                    
                    <div className={styles.deviceMetrics}>
                      <div className={styles.metricsChips}>
                        {device.metrics.map(metric => (
                          <span key={metric} className={styles.metricChip}>
                            {getMetricIcon(metric)} {metric.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.deviceActions}>
                    {device.isConnected ? (
                      <>
                        <button className={styles.syncButton}>
                          🔄 Sync Now
                        </button>
                        <button className={styles.settingsButton}>
                          ⚙️ Settings
                        </button>
                      </>
                    ) : (
                      <button className={styles.connectButton}>
                        🔗 Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className={styles.goalsTab}>
            <div className={styles.goalsHeader}>
              <h2 className={styles.sectionTitle}>🎯 Health Goals</h2>
              <button className={styles.editGoalsButton}>
                ✏️ Edit Goals
              </button>
            </div>
            
            <div className={styles.goalsGrid}>
              {goals.map(goal => (
                <div key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalHeader}>
                    <span className={styles.goalIcon}>{goal.icon}</span>
                    <h3 className={styles.goalName}>{goal.name}</h3>
                  </div>
                  <div className={styles.goalTarget}>Target: {goal.target}</div>
                  <div className={styles.goalRange}>{goal.range}</div>
                  <div className={styles.goalProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      Current: {goal.current} ({goal.progress}% of goal)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Reading Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>➕ Add New Reading</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Metric Type</label>
                <select className={styles.formSelect}>
                  <option>Heart Rate</option>
                  <option>Blood Pressure</option>
                  <option>Blood Sugar</option>
                  <option>Weight</option>
                  <option>Body Fat</option>
                  <option>Temperature</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Value</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  placeholder="Enter measurement value"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notes (Optional)</label>
                <textarea 
                  className={styles.formTextarea}
                  placeholder="Add any relevant notes about this reading..."
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setShowAddModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button className={styles.saveButton}>
                💾 Save Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}