// app/dashboard/por-health/biometrics/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './biometrics.module.css';

interface BiometricReading {
  id: string;
  timestamp: Date;
  type: 'heart_rate' | 'blood_pressure' | 'body_composition' | 'sleep' | 'stress' | 'temperature' | 'oxygen_saturation' | 'glucose';
  value: number | { systolic: number; diastolic: number } | { weight: number; bodyFat: number; muscle: number };
  unit: string;
  source: 'manual' | 'apple_watch' | 'fitbit' | 'oura' | 'whoop' | 'smart_scale' | 'blood_pressure_monitor';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

interface TrendData {
  period: '24h' | '7d' | '30d' | '90d';
  data: { timestamp: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  recommendation: string;
  timestamp: Date;
  dismissed: boolean;
}

interface WearableDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'smart_scale' | 'blood_pressure_monitor' | 'glucose_monitor';
  brand: string;
  model: string;
  connected: boolean;
  lastSync: Date;
  batteryLevel?: number;
  syncFrequency: 'real_time' | 'hourly' | 'daily';
  metrics: string[];
}

interface BiometricGoals {
  restingHeartRate: { target: number; range: { min: number; max: number } };
  bloodPressure: { systolic: { target: number; max: number }; diastolic: { target: number; max: number } };
  bodyFat: { target: number; range: { min: number; max: number } };
  sleepDuration: { target: number; range: { min: number; max: number } };
  stressLevel: { target: number; max: number };
  weight: { target: number; range: { min: number; max: number } };
}

export default function BiometricsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'realtime' | 'trends' | 'devices' | 'goals'>('realtime');
  
  // Data states
  const [realtimeReadings, setRealtimeReadings] = useState<BiometricReading[]>([]);
  const [trendData, setTrendData] = useState<Record<string, TrendData>>({});
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
  const [biometricGoals, setBiometricGoals] = useState<BiometricGoals | null>(null);
  
  // Real-time monitoring
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['heart_rate', 'stress', 'blood_pressure']);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  
  // Manual entry states
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [newReading, setNewReading] = useState({
    type: 'heart_rate',
    value: '',
    notes: ''
  });

  // Refs for intervals
  const realtimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadBiometricData();
    
    return () => {
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLiveMode) {
      startRealTimeMonitoring();
    } else {
      stopRealTimeMonitoring();
    }
  }, [isLiveMode, refreshInterval]);

  const loadBiometricData = async () => {
    setLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock biometric goals
    setBiometricGoals({
      restingHeartRate: { target: 60, range: { min: 50, max: 70 } },
      bloodPressure: { 
        systolic: { target: 120, max: 140 }, 
        diastolic: { target: 80, max: 90 } 
      },
      bodyFat: { target: 15, range: { min: 10, max: 20 } },
      sleepDuration: { target: 8, range: { min: 7, max: 9 } },
      stressLevel: { target: 30, max: 50 },
      weight: { target: 75, range: { min: 70, max: 80 } }
    });

    // Mock connected devices
    setConnectedDevices([
      {
        id: 'apple-watch',
        name: 'Apple Watch Series 9',
        type: 'smartwatch',
        brand: 'Apple',
        model: 'Series 9',
        connected: true,
        lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        batteryLevel: 78,
        syncFrequency: 'real_time',
        metrics: ['heart_rate', 'stress', 'sleep', 'temperature', 'oxygen_saturation']
      },
      {
        id: 'withings-scale',
        name: 'Withings Body+',
        type: 'smart_scale',
        brand: 'Withings',
        model: 'Body+',
        connected: true,
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        syncFrequency: 'daily',
        metrics: ['weight', 'body_composition']
      },
      {
        id: 'omron-bp',
        name: 'Omron HeartGuide',
        type: 'blood_pressure_monitor',
        brand: 'Omron',
        model: 'HeartGuide',
        connected: false,
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        syncFrequency: 'daily',
        metrics: ['blood_pressure']
      }
    ]);

    // Mock recent readings
    const now = new Date();
    setRealtimeReadings([
      {
        id: '1',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        type: 'heart_rate',
        value: 68,
        unit: 'bpm',
        source: 'apple_watch',
        quality: 'excellent'
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        type: 'blood_pressure',
        value: { systolic: 118, diastolic: 76 },
        unit: 'mmHg',
        source: 'omron_bp',
        quality: 'good'
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        type: 'body_composition',
        value: { weight: 72.3, bodyFat: 12.8, muscle: 45.2 },
        unit: 'kg/%',
        source: 'smart_scale',
        quality: 'excellent'
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000),
        type: 'stress',
        value: 24,
        unit: '%',
        source: 'apple_watch',
        quality: 'good'
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000),
        type: 'oxygen_saturation',
        value: 98,
        unit: '%',
        source: 'apple_watch',
        quality: 'excellent'
      }
    ]);

    // Mock health alerts
    setHealthAlerts([
      {
        id: 'alert-1',
        type: 'info',
        metric: 'Heart Rate Variability',
        message: 'Your HRV has improved 15% this week',
        recommendation: 'Continue current stress management practices',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000),
        dismissed: false
      },
      {
        id: 'alert-2',
        type: 'warning',
        metric: 'Sleep Quality',
        message: 'Sleep duration below target for 3 consecutive days',
        recommendation: 'Consider adjusting bedtime routine',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        dismissed: false
      }
    ]);

    // Mock trend data
    setTrendData({
      heart_rate: {
        period: '7d',
        data: generateMockTrendData(68, 7),
        trend: 'stable',
        changePercentage: -2.3
      },
      stress: {
        period: '7d',
        data: generateMockTrendData(24, 7),
        trend: 'improving',
        changePercentage: -12.5
      },
      weight: {
        period: '30d',
        data: generateMockTrendData(72.3, 30),
        trend: 'declining',
        changePercentage: -1.8
      }
    });

    setLoading(false);
  };

  const generateMockTrendData = (baseValue: number, days: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * (baseValue * 0.1);
      const value = Math.max(0, baseValue + variation);
      data.push({ timestamp, value: Math.round(value * 10) / 10 });
    }
    
    return data;
  };

  const startRealTimeMonitoring = () => {
    if (realtimeIntervalRef.current) {
      clearInterval(realtimeIntervalRef.current);
    }
    
    realtimeIntervalRef.current = setInterval(() => {
      simulateNewReadings();
    }, refreshInterval * 1000);
  };

  const stopRealTimeMonitoring = () => {
    if (realtimeIntervalRef.current) {
      clearInterval(realtimeIntervalRef.current);
      realtimeIntervalRef.current = null;
    }
  };

  const simulateNewReadings = () => {
    const now = new Date();
    const newReadings: BiometricReading[] = [];
    
    selectedMetrics.forEach((metric, index) => {
      const baseValues = {
        heart_rate: 68,
        stress: 24,
        blood_pressure: { systolic: 118, diastolic: 76 },
        oxygen_saturation: 98,
        temperature: 36.7
      };
      
      let value: any = baseValues[metric as keyof typeof baseValues];
      
      if (metric === 'heart_rate') {
        value = Math.max(50, Math.min(100, value + (Math.random() - 0.5) * 10));
      } else if (metric === 'stress') {
        value = Math.max(0, Math.min(100, value + (Math.random() - 0.5) * 15));
      } else if (metric === 'oxygen_saturation') {
        value = Math.max(90, Math.min(100, value + (Math.random() - 0.5) * 2));
      } else if (metric === 'temperature') {
        value = Math.max(35, Math.min(38, value + (Math.random() - 0.5) * 0.5));
      }
      
      const reading: BiometricReading = {
        id: `live-${Date.now()}-${index}`,
        timestamp: new Date(now.getTime() + index * 1000),
        type: metric as any,
        value: typeof value === 'number' ? Math.round(value * 10) / 10 : value,
        unit: getUnitForMetric(metric),
        source: 'apple_watch',
        quality: 'good'
      };
      
      newReadings.push(reading);
    });
    
    setRealtimeReadings(prev => [...newReadings, ...prev].slice(0, 50)); // Keep last 50 readings
  };

  const getUnitForMetric = (metric: string): string => {
    const units = {
      heart_rate: 'bpm',
      stress: '%',
      blood_pressure: 'mmHg',
      oxygen_saturation: '%',
      temperature: '°C',
      weight: 'kg',
      body_fat: '%'
    };
    return units[metric as keyof typeof units] || '';
  };

  const getMetricIcon = (metric: string): string => {
    const icons = {
      heart_rate: '❤️',
      blood_pressure: '🩸',
      body_composition: '⚖️',
      sleep: '😴',
      stress: '🧘',
      temperature: '🌡️',
      oxygen_saturation: '🫁',
      glucose: '🍯'
    };
    return icons[metric as keyof typeof icons] || '📊';
  };

  const getQualityColor = (quality: string): string => {
    const colors = {
      excellent: '#22c55e',
      good: '#3b82f6',
      fair: '#f59e0b',
      poor: '#ef4444'
    };
    return colors[quality as keyof typeof colors] || '#6b7280';
  };

  const getTrendColor = (trend: string): string => {
    const colors = {
      improving: '#22c55e',
      stable: '#3b82f6',
      declining: '#ef4444'
    };
    return colors[trend as keyof typeof colors] || '#6b7280';
  };

  const formatReadingValue = (reading: BiometricReading): string => {
    if (typeof reading.value === 'number') {
      return `${reading.value} ${reading.unit}`;
    }
    
    if (reading.type === 'blood_pressure' && typeof reading.value === 'object' && 'systolic' in reading.value) {
      return `${reading.value.systolic}/${reading.value.diastolic} ${reading.unit}`;
    }
    
    if (reading.type === 'body_composition' && typeof reading.value === 'object' && 'weight' in reading.value) {
      return `${reading.value.weight}kg • ${reading.value.bodyFat}% fat • ${reading.value.muscle}% muscle`;
    }
    
    return 'N/A';
  };

  const addManualReading = () => {
    if (!newReading.value) return;
    
    const reading: BiometricReading = {
      id: `manual-${Date.now()}`,
      timestamp: new Date(),
      type: newReading.type as any,
      value: parseFloat(newReading.value),
      unit: getUnitForMetric(newReading.type),
      source: 'manual',
      quality: 'good',
      notes: newReading.notes || undefined
    };
    
    setRealtimeReadings(prev => [reading, ...prev]);
    setManualEntryOpen(false);
    setNewReading({ type: 'heart_rate', value: '', notes: '' });
  };

  const dismissAlert = (alertId: string) => {
    setHealthAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
        <h2 className={styles.loadingTitle}>📊 Synchronizing Biometric Data</h2>
        <p className={styles.loadingText}>
          Connecting to wearable devices and analyzing health patterns...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.biometricsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/por-health" className={styles.backButton}>
            ← Back to Dashboard
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>📊 Live Biometrics</h1>
            <p className={styles.pageSubtitle}>
              Real-time health monitoring and biometric analysis
            </p>
          </div>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.liveControls}>
            <button 
              className={`${styles.liveToggle} ${isLiveMode ? styles.active : ''}`}
              onClick={() => setIsLiveMode(!isLiveMode)}
            >
              <span className={styles.liveIndicator}></span>
              {isLiveMode ? 'Live ON' : 'Live OFF'}
            </button>
            
            {isLiveMode && (
              <select 
                className={styles.refreshSelect}
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
              </select>
            )}
          </div>
          
          <button 
            className={styles.addReadingButton}
            onClick={() => setManualEntryOpen(true)}
          >
            + Add Reading
          </button>
        </div>
      </header>

      {/* Health Alerts */}
      {healthAlerts.filter(alert => !alert.dismissed).length > 0 && (
        <div className={styles.alertsSection}>
          <div className={styles.alertsContainer}>
            {healthAlerts.filter(alert => !alert.dismissed).map((alert) => (
              <div key={alert.id} className={`${styles.healthAlert} ${styles[alert.type]}`}>
                <div className={styles.alertContent}>
                  <div className={styles.alertHeader}>
                    <span className={styles.alertIcon}>
                      {alert.type === 'critical' ? '🚨' : 
                       alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className={styles.alertMetric}>{alert.metric}</span>
                    <span className={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  <div className={styles.alertMessage}>{alert.message}</div>
                  <div className={styles.alertRecommendation}>{alert.recommendation}</div>
                </div>
                <button 
                  className={styles.dismissButton}
                  onClick={() => dismissAlert(alert.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'realtime' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('realtime')}
        >
          <span className={styles.tabIcon}>⚡</span>
          Real-time
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'trends' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <span className={styles.tabIcon}>📈</span>
          Trends
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'devices' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          <span className={styles.tabIcon}>⌚</span>
          Devices
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'goals' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <span className={styles.tabIcon}>🎯</span>
          Goals
        </button>
      </nav>

      <div className={styles.tabContent}>
        {/* REAL-TIME TAB */}
        {activeTab === 'realtime' && (
          <div className={styles.realtimeTab}>
            <div className={styles.metricsGrid}>
              {realtimeReadings
                .filter((reading, index, arr) => 
                  arr.findIndex(r => r.type === reading.type) === index
                )
                .slice(0, 6)
                .map((reading) => (
                <div key={reading.type} className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricIcon}>{getMetricIcon(reading.type)}</span>
                    <div className={styles.metricInfo}>
                      <h4 className={styles.metricName}>
                        {reading.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <span className={styles.metricTime}>{formatTimeAgo(reading.timestamp)}</span>
                    </div>
                    <div 
                      className={styles.qualityIndicator}
                      style={{ backgroundColor: getQualityColor(reading.quality) }}
                    ></div>
                  </div>
                  
                  <div className={styles.metricValue}>
                    {formatReadingValue(reading)}
                  </div>
                  
                  <div className={styles.metricSource}>
                    Source: {reading.source.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.recentReadings}>
              <h3 className={styles.sectionTitle}>Recent Readings</h3>
              <div className={styles.readingsList}>
                {realtimeReadings.slice(0, 10).map((reading) => (
                  <div key={reading.id} className={styles.readingItem}>
                    <div className={styles.readingIcon}>{getMetricIcon(reading.type)}</div>
                    <div className={styles.readingContent}>
                      <div className={styles.readingHeader}>
                        <span className={styles.readingName}>
                          {reading.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={styles.readingTime}>{formatTimeAgo(reading.timestamp)}</span>
                      </div>
                      <div className={styles.readingValue}>{formatReadingValue(reading)}</div>
                      {reading.notes && (
                        <div className={styles.readingNotes}>{reading.notes}</div>
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
          </div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className={styles.trendsTab}>
            <div className={styles.trendsGrid}>
              {Object.entries(trendData).map(([metric, data]) => (
                <div key={metric} className={styles.trendCard}>
                  <div className={styles.trendHeader}>
                    <div className={styles.trendInfo}>
                      <span className={styles.trendIcon}>{getMetricIcon(metric)}</span>
                      <div>
                        <h4 className={styles.trendName}>
                          {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <span className={styles.trendPeriod}>{data.period} trend</span>
                      </div>
                    </div>
                    
                    <div className={styles.trendChange}>
                      <span 
                        className={styles.changeValue}
                        style={{ color: getTrendColor(data.trend) }}
                      >
                        {data.changePercentage > 0 ? '+' : ''}{data.changePercentage}%
                      </span>
                      <span className={styles.changeTrend} style={{ color: getTrendColor(data.trend) }}>
                        {data.trend === 'improving' ? '📈' :
                         data.trend === 'declining' ? '📉' : '➡️'} {data.trend}
                      </span>
                    </div>
                  </div>

                  <div className={styles.trendChart}>
                    <div className={styles.chartPlaceholder}>
                      📊 {data.period} trend visualization
                      <div className={styles.chartSummary}>
                        Latest: {data.data[data.data.length - 1]?.value} • 
                        Average: {Math.round(data.data.reduce((sum, d) => sum + d.value, 0) / data.data.length * 10) / 10}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'devices' && (
          <div className={styles.devicesTab}>
            <div className={styles.devicesHeader}>
              <h3 className={styles.sectionTitle}>Connected Devices</h3>
              <button className={styles.addDeviceButton}>+ Add Device</button>
            </div>

            <div className={styles.devicesList}>
              {connectedDevices.map((device) => (
                <div key={device.id} className={styles.deviceCard}>
                  <div className={styles.deviceHeader}>
                    <div className={styles.deviceInfo}>
                      <div className={styles.deviceIcon}>
                        {device.type === 'smartwatch' ? '⌚' :
                         device.type === 'fitness_tracker' ? '🏃' :
                         device.type === 'smart_scale' ? '⚖️' :
                         device.type === 'blood_pressure_monitor' ? '🩸' : '📱'}
                      </div>
                      <div>
                        <h4 className={styles.deviceName}>{device.name}</h4>
                        <p className={styles.deviceModel}>{device.brand} {device.model}</p>
                      </div>
                    </div>
                    
                    <div className={styles.deviceStatus}>
                      <div 
                        className={`${styles.connectionStatus} ${device.connected ? styles.connected : styles.disconnected}`}
                      >
                        {device.connected ? '✅ Connected' : '❌ Disconnected'}
                      </div>
                      {device.batteryLevel && (
                        <div className={styles.batteryLevel}>
                          🔋 {device.batteryLevel}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.deviceDetails}>
                    <div className={styles.syncInfo}>
                      <span>Last sync: {formatTimeAgo(device.lastSync)}</span>
                      <span>Frequency: {device.syncFrequency.replace('_', ' ')}</span>
                    </div>
                    
                    <div className={styles.deviceMetrics}>
                      <strong>Metrics:</strong>
                      <div className={styles.metricsChips}>
                        {device.metrics.map((metric) => (
                          <span key={metric} className={styles.metricChip}>
                            {getMetricIcon(metric)} {metric.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.deviceActions}>
                    {device.connected ? (
                      <>
                        <button className={styles.syncButton}>🔄 Sync Now</button>
                        <button className={styles.settingsButton}>⚙️ Settings</button>
                      </>
                    ) : (
                      <button className={styles.connectButton}>🔗 Reconnect</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOALS TAB */}
        {activeTab === 'goals' && biometricGoals && (
          <div className={styles.goalsTab}>
            <div className={styles.goalsHeader}>
              <h3 className={styles.sectionTitle}>Biometric Goals</h3>
              <button className={styles.editGoalsButton}>✏️ Edit Goals</button>
            </div>

            <div className={styles.goalsGrid}>
              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>❤️</span>
                  <h4 className={styles.goalName}>Resting Heart Rate</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.restingHeartRate.target} bpm
                </div>
                <div className={styles.goalRange}>
                  Healthy range: {biometricGoals.restingHeartRate.range.min}-{biometricGoals.restingHeartRate.range.max} bpm
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 68 bpm (Within range)</span>
                </div>
              </div>

              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>🩸</span>
                  <h4 className={styles.goalName}>Blood Pressure</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.bloodPressure.systolic.target}/{biometricGoals.bloodPressure.diastolic.target} mmHg
                </div>
                <div className={styles.goalRange}>
                  Max: {biometricGoals.bloodPressure.systolic.max}/{biometricGoals.bloodPressure.diastolic.max} mmHg
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 118/76 mmHg (Excellent)</span>
                </div>
              </div>

              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>⚖️</span>
                  <h4 className={styles.goalName}>Body Fat</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.bodyFat.target}%
                </div>
                <div className={styles.goalRange}>
                  Healthy range: {biometricGoals.bodyFat.range.min}-{biometricGoals.bodyFat.range.max}%
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 12.8% (On target)</span>
                </div>
              </div>

              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>😴</span>
                  <h4 className={styles.goalName}>Sleep Duration</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.sleepDuration.target} hours
                </div>
                <div className={styles.goalRange}>
                  Healthy range: {biometricGoals.sleepDuration.range.min}-{biometricGoals.sleepDuration.range.max} hours
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '95%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 8.4 hours (Above target)</span>
                </div>
              </div>

              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>🧘</span>
                  <h4 className={styles.goalName}>Stress Level</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.stressLevel.target}%
                </div>
                <div className={styles.goalRange}>
                  Max acceptable: {biometricGoals.stressLevel.max}%
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 24% (Below target)</span>
                </div>
              </div>

              <div className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>⚖️</span>
                  <h4 className={styles.goalName}>Weight</h4>
                </div>
                <div className={styles.goalTarget}>
                  Target: {biometricGoals.weight.target} kg
                </div>
                <div className={styles.goalRange}>
                  Healthy range: {biometricGoals.weight.range.min}-{biometricGoals.weight.range.max} kg
                </div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: '88%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>Current: 72.3 kg (Within range)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {manualEntryOpen && (
        <div className={styles.modalOverlay} onClick={() => setManualEntryOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Manual Reading</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setManualEntryOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Metric Type</label>
                <select 
                  className={styles.formSelect}
                  value={newReading.type}
                  onChange={(e) => setNewReading(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="heart_rate">Heart Rate</option>
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="weight">Weight</option>
                  <option value="body_fat">Body Fat</option>
                  <option value="stress">Stress Level</option>
                  <option value="temperature">Temperature</option>
                  <option value="glucose">Blood Glucose</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Value ({getUnitForMetric(newReading.type)})
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newReading.value}
                  onChange={(e) => setNewReading(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={`Enter ${newReading.type.replace('_', ' ')} value`}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notes (Optional)</label>
                <textarea
                  className={styles.formTextarea}
                  value={newReading.notes}
                  onChange={(e) => setNewReading(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this reading..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setManualEntryOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={addManualReading}
                disabled={!newReading.value}
              >
                Save Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}