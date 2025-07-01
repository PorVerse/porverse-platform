'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css'
;

// Types
interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  progress: number;
}

export default function PorHealthDashboard() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setHealthMetrics([
        { id: '1', name: 'Weight', value: 72.5, unit: 'kg', target: 70, progress: 75 },
        { id: '2', name: 'Steps', value: 8543, unit: 'steps', target: 10000, progress: 85 },
        { id: '3', name: 'Sleep', value: 7.2, unit: 'hours', target: 8, progress: 90 },
        { id: '4', name: 'Water', value: 2.1, unit: 'liters', target: 2.5, progress: 84 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '4px solid rgba(0,255,136,0.3)', 
                borderTop: '4px solid #00ff88',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Loading PorHealth Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo">🌿 PorHealth</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Dashboard</div>
            <Link href="/dashboard/por-health" className="nav-item active">
              <span className="nav-item-icon">📊</span>
              Overview
            </Link>
            <Link href="/dashboard/por-health/nutrition" className="nav-item">
              <span className="nav-item-icon">🍎</span>
              Nutrition
            </Link>
            <Link href="/dashboard/por-health/workouts" className="nav-item">
              <span className="nav-item-icon">💪</span>
              Workouts
            </Link>
            <Link href="/dashboard/por-health/biometrics" className="nav-item">
              <span className="nav-item-icon">⚖️</span>
              Biometrics
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Tools</div>
            <Link href="/dashboard/por-health/meal-planner" className="nav-item">
              <span className="nav-item-icon">🥗</span>
              Meal Planner
            </Link>
            <Link href="/dashboard/por-health/supplements" className="nav-item">
              <span className="nav-item-icon">💊</span>
              Supplements
            </Link>
            <Link href="/dashboard/por-health/progress" className="nav-item">
              <span className="nav-item-icon">📈</span>
              Progress
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Other Ecosystems</div>
            <Link href="/dashboard/por-mind" className="nav-item">
              <span className="nav-item-icon">💰</span>
              PorMind
            </Link>
            <Link href="/dashboard/por-well" className="nav-item">
              <span className="nav-item-icon">🌻</span>
              PorWell
            </Link>
            <Link href="/dashboard/por-flow" className="nav-item">
              <span className="nav-item-icon">🌊</span>
              PorFlow
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="upgrade-card">
            <h4>Upgrade to Premium</h4>
            <p>Unlock advanced AI features and detailed analytics</p>
            <button className="upgrade-btn">Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>Health Dashboard</h1>
          <p>Welcome back! Here's your health overview for today.</p>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">85%</div>
              <div className="stat-label">Daily Goal</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">7</div>
              <div className="stat-label">Streak Days</div>
            </div>
          </div>
          <button className="notification-btn">🔔</button>
          <button className="profile-btn">👤</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Health Metrics Cards */}
          {healthMetrics.map((metric) => (
            <div key={metric.id} className="dashboard-card fade-in-up">
              <div className="card-header">
                <div className="card-title">{metric.name}</div>
                <div className="card-icon">
                  {metric.name === 'Weight' && '⚖️'}
                  {metric.name === 'Steps' && '👟'}
                  {metric.name === 'Sleep' && '😴'}
                  {metric.name === 'Water' && '💧'}
                </div>
              </div>
              <div className="card-value">
                {metric.value} <span style={{fontSize: '0.6em', fontWeight: 'normal'}}>{metric.unit}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${metric.progress}%`}}></div>
              </div>
              <div className="progress-text">
                {metric.progress}% of target ({metric.target} {metric.unit})
              </div>
            </div>
          ))}

          {/* Nutrition Overview */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <div className="card-title">Today's Nutrition</div>
              <div className="card-icon">🍎</div>
            </div>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <div className="nutrition-label">Calories</div>
                <div className="nutrition-value">1,847</div>
                <div className="nutrition-target">/ 2,200</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-label">Protein</div>
                <div className="nutrition-value">98g</div>
                <div className="nutrition-target">/ 140g</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-label">Carbs</div>
                <div className="nutrition-value">205g</div>
                <div className="nutrition-target">/ 275g</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-label">Fat</div>
                <div className="nutrition-value">67g</div>
                <div className="nutrition-target">/ 85g</div>
              </div>
            </div>
          </div>

          {/* Workout Plan */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <div className="card-title">Today's Workout</div>
              <div className="card-icon">💪</div>
            </div>
            <div className="workout-list">
              <div className="workout-item">
                <div className="workout-info">
                  <div className="workout-name">Upper Body Strength</div>
                  <div className="workout-details">45 min • Intermediate • 320 cal</div>
                </div>
                <div className="workout-status">Scheduled</div>
              </div>
              <div className="workout-item">
                <div className="workout-info">
                  <div className="workout-name">Evening Yoga</div>
                  <div className="workout-details">30 min • Beginner • 150 cal</div>
                </div>
                <div className="workout-status">Optional</div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <div className="card-title">Recent Activities</div>
              <div className="card-icon">📝</div>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🥗</div>
                <div className="activity-content">
                  <div className="activity-title">Quinoa Salad logged</div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">💪</div>
                <div className="activity-content">
                  <div className="activity-title">Morning Workout completed</div>
                  <div className="activity-time">5 hours ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">💧</div>
                <div className="activity-content">
                  <div className="activity-title">Water goal reached</div>
                  <div className="activity-time">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn" onClick={() => setChatOpen(true)}>
            <span className="action-btn-icon">🤖</span>
            <span className="action-btn-text">AI Health Coach</span>
          </button>
          <Link href="/dashboard/por-health/nutrition" className="action-btn">
            <span className="action-btn-icon">🍎</span>
            <span className="action-btn-text">Log Food</span>
          </Link>
          <Link href="/dashboard/por-health/workouts" className="action-btn">
            <span className="action-btn-icon">🏋️</span>
            <span className="action-btn-text">Start Workout</span>
          </Link>
          <Link href="/dashboard/por-health/biometrics" className="action-btn">
            <span className="action-btn-icon">⚖️</span>
            <span className="action-btn-text">Log Weight</span>
          </Link>
        </div>
      </main>

      {/* AI Chat Widget */}
      {chatOpen && (
        <div className="ai-chat open">
          <div className="chat-header">
            <span>🤖 AI Health Coach</span>
            <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
          </div>
          <div className="chat-messages">
            <div style={{background: 'rgba(0,255,136,0.1)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem'}}>
              👋 Hi! I'm your AI Health Coach. I can help you with nutrition advice, workout plans, and health insights. What would you like to know?
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Ask me about your health goals..." />
            <button className="chat-send">Send</button>
          </div>
        </div>
      )}

      {/* Chat Toggle */}
      {!chatOpen && (
        <button className="chat-toggle" onClick={() => setChatOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
}