// app/dashboard/por-flow/components/TimeBlocking.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Plus, Edit, Trash, Zap, Brain, Coffee, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './TimeBlocking.module.css';

interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'focus' | 'meeting' | 'break' | 'admin' | 'creative' | 'buffer';
  color: string;
  taskIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isLocked?: boolean;
  energyLevel?: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  productivity?: number;
  completed?: boolean;
}

interface OptimizationSuggestion {
  id: string;
  type: 'reorder' | 'merge' | 'split' | 'move' | 'add-buffer';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  blocks: string[];
}

interface TimeBlockingProps {
  userId: string;
}

export default function TimeBlocking({ userId }: TimeBlockingProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<TimeBlock | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'agenda'>('day');
  const [loading, setLoading] = useState(true);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTimeBlocks();
    generateAISuggestions();
  }, [selectedDate, userId]);

  const loadTimeBlocks = () => {
    try {
      const saved = localStorage.getItem(`porflow_timeblocks_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved).map((block: any) => ({
          ...block,
          startTime: new Date(block.startTime),
          endTime: new Date(block.endTime)
        }));
        setTimeBlocks(parsed);
      } else {
        // Initialize with sample blocks
        const sampleBlocks = generateSampleBlocks();
        setTimeBlocks(sampleBlocks);
        saveTimeBlocks(sampleBlocks);
      }
    } catch (error) {
      console.error('Error loading time blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTimeBlocks = (blocks: TimeBlock[]) => {
    localStorage.setItem(`porflow_timeblocks_${userId}`, JSON.stringify(blocks));
  };

  const generateSampleBlocks = (): TimeBlock[] => {
    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);

    return [
      {
        id: '1',
        title: 'Deep Work: AI Development',
        description: 'Focus on PorVerse AI integration implementation',
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
        type: 'focus',
        color: '#7c3aed',
        priority: 'critical',
        energyLevel: 'high',
        taskIds: ['1', '3'],
        productivity: 92
      },
      {
        id: '2',
        title: 'Team Standup',
        description: 'Daily team sync and sprint planning',
        startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
        endTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
        type: 'meeting',
        color: '#3b82f6',
        priority: 'medium',
        attendees: ['Team Lead', 'Developers', 'Product Manager'],
        location: 'Conference Room A'
      },
      {
        id: '3',
        title: 'Lunch Break',
        description: 'Recharge and reset for afternoon session',
        startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
        endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
        type: 'break',
        color: '#10b981',
        priority: 'low',
        energyLevel: 'medium'
      },
      {
        id: '4',
        title: 'Code Review & Documentation',
        description: 'Review pull requests and update technical docs',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
        type: 'admin',
        color: '#f59e0b',
        priority: 'high',
        energyLevel: 'medium',
        taskIds: ['2', '4']
      },
      {
        id: '5',
        title: 'Creative Brainstorming',
        description: 'UI/UX improvements and feature ideation',
        startTime: new Date(today.getTime() + 16.5 * 60 * 60 * 1000), // 4:30 PM
        endTime: new Date(today.getTime() + 17.5 * 60 * 60 * 1000), // 5:30 PM
        type: 'creative',
        color: '#ec4899',
        priority: 'medium',
        energyLevel: 'medium'
      }
    ];
  };

  const generateAISuggestions = () => {
    // AI-powered optimization suggestions
    const suggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        type: 'reorder',
        title: 'Optimize Energy Alignment',
        description: 'Move creative work to morning when your energy is highest',
        impact: 'high',
        blocks: ['5', '1']
      },
      {
        id: '2',
        type: 'add-buffer',
        title: 'Add Buffer Time',
        description: 'Add 15-minute buffers between meetings to prevent context switching fatigue',
        impact: 'medium',
        blocks: ['2', '4']
      },
      {
        id: '3',
        type: 'merge',
        title: 'Batch Similar Tasks',
        description: 'Combine admin tasks into one focused block for better efficiency',
        impact: 'medium',
        blocks: ['4']
      }
    ];
    setSuggestions(suggestions);
  };

  // Time utilities
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getBlocksForDate = (date: Date) => {
    const dateKey = getDateKey(date);
    return timeBlocks.filter(block => 
      getDateKey(block.startTime) === dateKey
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  // CRUD Operations
  const addTimeBlock = (blockData: Partial<TimeBlock>) => {
    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      title: blockData.title || 'New Block',
      description: blockData.description,
      startTime: blockData.startTime || new Date(),
      endTime: blockData.endTime || new Date(),
      type: blockData.type || 'focus',
      color: getTypeColor(blockData.type || 'focus'),
      priority: blockData.priority || 'medium',
      energyLevel: blockData.energyLevel,
      location: blockData.location,
      attendees: blockData.attendees,
      taskIds: blockData.taskIds
    };

    const updatedBlocks = [...timeBlocks, newBlock];
    setTimeBlocks(updatedBlocks);
    saveTimeBlocks(updatedBlocks);
    setShowAddModal(false);
  };

  const updateTimeBlock = (blockId: string, updates: Partial<TimeBlock>) => {
    const updatedBlocks = timeBlocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setTimeBlocks(updatedBlocks);
    saveTimeBlocks(updatedBlocks);
    setEditingBlock(null);
  };

  const deleteTimeBlock = (blockId: string) => {
    if (confirm('Are you sure you want to delete this time block?')) {
      const updatedBlocks = timeBlocks.filter(block => block.id !== blockId);
      setTimeBlocks(updatedBlocks);
      saveTimeBlocks(updatedBlocks);
    }
  };

  const getTypeColor = (type: TimeBlock['type']) => {
    const colors = {
      focus: '#7c3aed',
      meeting: '#3b82f6',
      break: '#10b981',
      admin: '#f59e0b',
      creative: '#ec4899',
      buffer: '#6b7280'
    };
    return colors[type];
  };

  const getTypeIcon = (type: TimeBlock['type']) => {
    switch (type) {
      case 'focus': return <Brain size={16} />;
      case 'meeting': return <Users size={16} />;
      case 'break': return <Coffee size={16} />;
      case 'admin': return <Clock size={16} />;
      case 'creative': return <Zap size={16} />;
      case 'buffer': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, block: TimeBlock) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropTime: Date) => {
    e.preventDefault();
    
    if (!draggedBlock) return;

    const duration = draggedBlock.endTime.getTime() - draggedBlock.startTime.getTime();
    const newStartTime = new Date(dropTime);
    const newEndTime = new Date(dropTime.getTime() + duration);

    updateTimeBlock(draggedBlock.id, {
      startTime: newStartTime,
      endTime: newEndTime
    });

    setDraggedBlock(null);
  };

  // AI Optimization
  const applyOptimization = (suggestion: OptimizationSuggestion) => {
    switch (suggestion.type) {
      case 'reorder':
        // Swap positions of specified blocks
        const [block1Id, block2Id] = suggestion.blocks;
        const block1 = timeBlocks.find(b => b.id === block1Id);
        const block2 = timeBlocks.find(b => b.id === block2Id);
        
        if (block1 && block2) {
          const temp1Start = new Date(block1.startTime);
          const temp1End = new Date(block1.endTime);
          
          updateTimeBlock(block1Id, {
            startTime: block2.startTime,
            endTime: block2.endTime
          });
          
          updateTimeBlock(block2Id, {
            startTime: temp1Start,
            endTime: temp1End
          });
        }
        break;
        
      case 'add-buffer':
        // Add 15-minute buffers between blocks
        suggestion.blocks.forEach(blockId => {
          const block = timeBlocks.find(b => b.id === blockId);
          if (block) {
            const bufferBlock: TimeBlock = {
              id: `buffer_${Date.now()}`,
              title: 'Buffer Time',
              description: 'Transition time between activities',
              startTime: new Date(block.endTime),
              endTime: new Date(block.endTime.getTime() + 15 * 60 * 1000),
              type: 'buffer',
              color: getTypeColor('buffer'),
              priority: 'low'
            };
            
            const updatedBlocks = [...timeBlocks, bufferBlock];
            setTimeBlocks(updatedBlocks);
            saveTimeBlocks(updatedBlocks);
          }
        });
        break;
    }
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  // Time slots for calendar view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(new Date(selectedDate.getTime() + hour * 60 * 60 * 1000));
    }
    return slots;
  };

  const calculateBlockPosition = (block: TimeBlock) => {
    const startHour = block.startTime.getHours() + block.startTime.getMinutes() / 60;
    const endHour = block.endTime.getHours() + block.endTime.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${(startHour - 6) * 60}px`, // 60px per hour, starting from 6 AM
      height: `${duration * 60}px`
    };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your calendar...</p>
      </div>
    );
  }

  const todayBlocks = getBlocksForDate(selectedDate);

  return (
    <div className={styles.timeBlocking}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>📅 Time Blocking</h1>
          <p>AI-optimized schedule for maximum productivity</p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.viewModeToggle}>
            <button 
              className={viewMode === 'day' ? styles.active : ''}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={viewMode === 'week' ? styles.active : ''}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={viewMode === 'agenda' ? styles.active : ''}
              onClick={() => setViewMode('agenda')}
            >
              Agenda
            </button>
          </div>
          
          <button 
            className={styles.optimizerButton}
            onClick={() => setShowOptimizer(!showOptimizer)}
          >
            <Zap size={16} />
            AI Optimizer
          </button>
          
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Block
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className={styles.dateNavigation}>
        <button onClick={() => navigateDate('prev')} className={styles.navButton}>
          <ChevronLeft size={20} />
        </button>
        
        <div className={styles.dateDisplay}>
          <h2>{selectedDate.toLocaleDateString('ro-RO', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</h2>
        </div>
        
        <button onClick={() => navigateDate('next')} className={styles.navButton}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* AI Optimizer Panel */}
      {showOptimizer && (
        <div className={styles.optimizerPanel}>
          <div className={styles.optimizerHeader}>
            <Brain size={20} />
            <h3>AI Schedule Optimizer</h3>
          </div>
          
          <div className={styles.suggestions}>
            {suggestions.length > 0 ? (
              suggestions.map(suggestion => (
                <div key={suggestion.id} className={styles.suggestion}>
                  <div className={styles.suggestionContent}>
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.description}</p>
                    <span className={`${styles.impact} ${styles[suggestion.impact]}`}>
                      {suggestion.impact} impact
                    </span>
                  </div>
                  <button 
                    className={styles.applyButton}
                    onClick={() => applyOptimization(suggestion)}
                  >
                    Apply
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.noSuggestions}>
                <Zap size={24} />
                <p>Your schedule is already optimized!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className={styles.calendarContainer}>
        {viewMode === 'day' && (
          <div className={styles.dayView} ref={calendarRef}>
            <div className={styles.timeSlots}>
              {generateTimeSlots().map(slot => (
                <div 
                  key={slot.getHours()}
                  className={styles.timeSlot}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slot)}
                >
                  <span className={styles.timeLabel}>
                    {formatTime(slot)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className={styles.blocksContainer}>
              {todayBlocks.map(block => (
                <div
                  key={block.id}
                  className={styles.timeBlockCard}
                  style={{
                    ...calculateBlockPosition(block),
                    backgroundColor: block.color + '20',
                    borderLeft: `4px solid ${block.color}`
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                >
                  <div className={styles.blockHeader}>
                    <div className={styles.blockTitle}>
                      {getTypeIcon(block.type)}
                      <span>{block.title}</span>
                    </div>
                    <div className={styles.blockActions}>
                      <button 
                        onClick={() => setEditingBlock(block)}
                        className={styles.editButton}
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => deleteTimeBlock(block.id)}
                        className={styles.deleteButton}
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.blockTime}>
                    {formatTime(block.startTime)} - {formatTime(block.endTime)}
                  </div>
                  
                  {block.description && (
                    <div className={styles.blockDescription}>
                      {block.description}
                    </div>
                  )}
                  
                  <div className={styles.blockMeta}>
                    <span className={`${styles.priority} ${styles[block.priority]}`}>
                      {block.priority}
                    </span>
                    {block.energyLevel && (
                      <span className={styles.energy}>
                        Energy: {block.energyLevel}
                      </span>
                    )}
                    {block.productivity && (
                      <span className={styles.productivity}>
                        {block.productivity}% productive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className={styles.agendaView}>
            <div className={styles.agendaList}>
              {todayBlocks.length > 0 ? (
                todayBlocks.map(block => (
                  <div key={block.id} className={styles.agendaItem}>
                    <div className={styles.agendaTime}>
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                    </div>
                    <div className={styles.agendaContent}>
                      <div className={styles.agendaTitle}>
                        {getTypeIcon(block.type)}
                        <span>{block.title}</span>
                      </div>
                      {block.description && (
                        <p className={styles.agendaDescription}>{block.description}</p>
                      )}
                      {block.location && (
                        <span className={styles.agendaLocation}>📍 {block.location}</span>
                      )}
                      {block.attendees && block.attendees.length > 0 && (
                        <span className={styles.agendaAttendees}>
                          👥 {block.attendees.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyAgenda}>
                  <Calendar size={48} />
                  <h3>No blocks scheduled</h3>
                  <p>Add time blocks to optimize your day</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingBlock) && (
        <TimeBlockModal
          block={editingBlock}
          onSave={editingBlock ? 
            (updates) => updateTimeBlock(editingBlock.id, updates) : 
            addTimeBlock
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingBlock(null);
          }}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

// Time Block Modal Component
interface TimeBlockModalProps {
  block?: TimeBlock | null;
  onSave: (blockData: Partial<TimeBlock>) => void;
  onClose: () => void;
  selectedDate: Date;
}

function TimeBlockModal({ block, onSave, onClose, selectedDate }: TimeBlockModalProps) {
  const [formData, setFormData] = useState({
    title: block?.title || '',
    description: block?.description || '',
    type: block?.type || 'focus' as TimeBlock['type'],
    priority: block?.priority || 'medium' as TimeBlock['priority'],
    startTime: block?.startTime ? 
      `${block.startTime.getHours().toString().padStart(2, '0')}:${block.startTime.getMinutes().toString().padStart(2, '0')}` :
      '09:00',
    endTime: block?.endTime ? 
      `${block.endTime.getHours().toString().padStart(2, '0')}:${block.endTime.getMinutes().toString().padStart(2, '0')}` :
      '10:00',
    energyLevel: block?.energyLevel || 'medium' as TimeBlock['energyLevel'],
    location: block?.location || '',
    attendees: block?.attendees?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startDate = new Date(selectedDate);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    const blockData = {
      ...formData,
      startTime: startDate,
      endTime: endDate,
      attendees: formData.attendees ? 
        formData.attendees.split(',').map(a => a.trim()).filter(Boolean) : 
        undefined
    };
    
    onSave(blockData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{block ? 'Edit Time Block' : 'Add New Time Block'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Enter block title..."
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Block description..."
              rows={3}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as TimeBlock['type']})}
              >
                <option value="focus">Focus Work</option>
                <option value="meeting">Meeting</option>
                <option value="break">Break</option>
                <option value="admin">Admin Tasks</option>
                <option value="creative">Creative Work</option>
                <option value="buffer">Buffer Time</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as TimeBlock['priority']})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Energy Level</label>
              <select
                value={formData.energyLevel}
                onChange={(e) => setFormData({...formData, energyLevel: e.target.value as TimeBlock['energyLevel']})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Meeting room, Remote..."
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Attendees (comma separated)</label>
            <input
              type="text"
              value={formData.attendees}
              onChange={(e) => setFormData({...formData, attendees: e.target.value})}
              placeholder="John Doe, Jane Smith..."
            />
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {block ? 'Update Block' : 'Create Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}