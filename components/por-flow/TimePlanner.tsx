// components/por-flow/TimePlanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { Calendar, Clock, Plus, Edit, Trash2, Play, CheckCircle } from 'lucide-react';

interface TimeBlock {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  type: 'work' | 'break' | 'meeting' | 'focus' | 'personal' | 'deep-work';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  productivity_score?: number;
  task_ids?: string[]; // Related task IDs
  created_at?: string;
  updated_at?: string;
}

interface TimePlannerProps {
  className?: string;
  selectedDate?: Date;
}

const BLOCK_TYPES = {
  work: { color: '#06b6d4', icon: '💼', name: 'Work' },
  'deep-work': { color: '#7c3aed', icon: '🧠', name: 'Deep Work' },
  focus: { color: '#059669', icon: '🎯', name: 'Focus Session' },
  meeting: { color: '#f59e0b', icon: '👥', name: 'Meeting' },
  break: { color: '#10b981', icon: '☕', name: 'Break' },
  personal: { color: '#ef4444', icon: '🏠', name: 'Personal' }
};

export default function TimePlanner({ className, selectedDate = new Date() }: TimePlannerProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [userId, setUserId] = useState<string | null>(null);
  const [dayStats, setDayStats] = useState({
    totalBlocks: 0,
    completedBlocks: 0,
    totalTime: 0,
    productiveTime: 0,
    averageProductivity: 0
  });

  const supabase = createClientSupabase();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Load time blocks for selected date
  useEffect(() => {
    const loadTimeBlocks = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Get start and end of day
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Load from user_progress table where progress_type is 'time_block'
        const { data, error: fetchError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'time_block')
          .gte('progress_data->start_time', startOfDay.toISOString())
          .lte('progress_data->start_time', endOfDay.toISOString())
          .order('progress_data->start_time', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Transform progress data to time blocks
        const blocks: TimeBlock[] = (data || []).map(progress => ({
          id: progress.id,
          user_id: progress.user_id,
          title: progress.progress_data.title,
          description: progress.progress_data.description,
          start_time: progress.progress_data.start_time,
          end_time: progress.progress_data.end_time,
          type: progress.progress_data.type,
          status: progress.progress_data.status || 'scheduled',
          productivity_score: progress.progress_data.productivity_score,
          task_ids: progress.progress_data.task_ids || [],
          created_at: progress.created_at,
          updated_at: progress.created_at
        }));

        setTimeBlocks(blocks);
        calculateDayStats(blocks);
      } catch (err) {
        console.error('Error loading time blocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load time blocks');
      } finally {
        setLoading(false);
      }
    };

    loadTimeBlocks();
  }, [userId, currentDate, supabase]);

  // Calculate day statistics
  const calculateDayStats = (blocks: TimeBlock[]) => {
    const totalBlocks = blocks.length;
    const completedBlocks = blocks.filter(b => b.status === 'completed').length;
    
    const totalTime = blocks.reduce((sum, block) => {
      const start = new Date(block.start_time);
      const end = new Date(block.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }, 0);

    const productiveTime = blocks
      .filter(b => b.type === 'work' || b.type === 'deep-work' || b.type === 'focus')
      .reduce((sum, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

    const avgProductivity = blocks
      .filter(b => b.productivity_score)
      .reduce((sum, block, _, arr) => {
        return sum + (block.productivity_score! / arr.length);
      }, 0);

    setDayStats({
      totalBlocks,
      completedBlocks,
      totalTime,
      productiveTime,
      averageProductivity: avgProductivity || 0
    });
  };

  // Save time block to Supabase
  const saveTimeBlock = async (blockData: Partial<TimeBlock>) => {
    if (!userId) return;

    try {
      const progressData = {
        title: blockData.title!,
        description: blockData.description,
        start_time: blockData.start_time!,
        end_time: blockData.end_time!,
        type: blockData.type!,
        status: blockData.status || 'scheduled',
        productivity_score: blockData.productivity_score,
        task_ids: blockData.task_ids || []
      };

      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          ecosystem: 'por-flow',
          progress_type: 'time_block',
          progress_data: progressData,
          score: blockData.productivity_score || 0,
          date_recorded: new Date(blockData.start_time!).toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform back to time block format and add to state
      const newBlock: TimeBlock = {
        id: data.id,
        user_id: userId,
        title: progressData.title,
        description: progressData.description,
        start_time: progressData.start_time,
        end_time: progressData.end_time,
        type: progressData.type,
        status: progressData.status,
        productivity_score: progressData.productivity_score,
        task_ids: progressData.task_ids,
        created_at: data.created_at
      };

      setTimeBlocks(prev => [...prev, newBlock].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));

      return newBlock;
    } catch (err) {
      console.error('Error saving time block:', err);
      throw err;
    }
  };

  // Update time block
  const updateTimeBlock = async (blockId: string, updates: Partial<TimeBlock>) => {
    try {
      const currentBlock = timeBlocks.find(b => b.id === blockId);
      if (!currentBlock) return;

      const updatedProgressData = {
        title: updates.title || currentBlock.title,
        description: updates.description !== undefined ? updates.description : currentBlock.description,
        start_time: updates.start_time || currentBlock.start_time,
        end_time: updates.end_time || currentBlock.end_time,
        type: updates.type || currentBlock.type,
        status: updates.status || currentBlock.status,
        productivity_score: updates.productivity_score !== undefined ? updates.productivity_score : currentBlock.productivity_score,
        task_ids: updates.task_ids || currentBlock.task_ids
      };

      const { error } = await supabase
        .from('user_progress')
        .update({
          progress_data: updatedProgressData,
          score: updatedProgressData.productivity_score || 0
        })
        .eq('id', blockId);

      if (error) throw error;

      // Update local state
      setTimeBlocks(prev => prev.map(block => 
        block.id === blockId 
          ? { ...block, ...updates }
          : block
      ));

      // Recalculate stats
      const updatedBlocks = timeBlocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      );
      calculateDayStats(updatedBlocks);

    } catch (err) {
      console.error('Error updating time block:', err);
      throw err;
    }
  };

  // Delete time block
  const deleteTimeBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setTimeBlocks(prev => {
        const newBlocks = prev.filter(block => block.id !== blockId);
        calculateDayStats(newBlocks);
        return newBlocks;
      });
    } catch (err) {
      console.error('Error deleting time block:', err);
      throw err;
    }
  };

  // Start a time block (mark as active)
  const startTimeBlock = async (blockId: string) => {
    await updateTimeBlock(blockId, { status: 'active' });
  };

  // Complete a time block
  const completeTimeBlock = async (blockId: string, productivityScore?: number) => {
    await updateTimeBlock(blockId, { 
      status: 'completed',
      productivity_score: productivityScore 
    });
  };

  // Get blocks for current time
  const getCurrentTimeBlocks = () => {
    const now = new Date();
    return timeBlocks.filter(block => {
      const start = new Date(block.start_time);
      const end = new Date(block.end_time);
      return start <= now && end >= now;
    });
  };

  // Get upcoming blocks
  const getUpcomingBlocks = () => {
    const now = new Date();
    return timeBlocks.filter(block => {
      const start = new Date(block.start_time);
      return start > now;
    }).slice(0, 3); // Next 3 blocks
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration
  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  // Check for time conflicts
  const hasTimeConflict = (startTime: string, endTime: string, excludeId?: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return timeBlocks.some(block => {
      if (excludeId && block.id === excludeId) return false;
      
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      
      return (start < blockEnd && end > blockStart);
    });
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Auto-schedule blocks using AI suggestions
  const autoScheduleBlocks = async () => {
    // This would integrate with your AI service to suggest optimal time blocks
    // For now, we'll show a placeholder
    alert('AI auto-scheduling feature coming soon! 🤖');
  };

  if (loading) {
    return (
      <div className={`time-planner ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`time-planner ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading schedule</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-700 underline text-sm hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const currentBlocks = getCurrentTimeBlocks();
  const upcomingBlocks = getUpcomingBlocks();

  return (
    <div className={`time-planner ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Time Planner</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ←
            </button>
            <span className="text-gray-300 font-medium min-w-32 text-center">
              {currentDate.toLocaleDateString('ro-RO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={autoScheduleBlocks}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🤖 AI Schedule
          </button>
          <button
            onClick={() => setShowAddBlock(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Block
          </button>
        </div>
      </div>

      {/* Day Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-cyan-400 text-xl font-bold">{dayStats.totalBlocks}</div>
          <div className="text-gray-400 text-sm">Total Blocks</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-green-400 text-xl font-bold">{dayStats.completedBlocks}</div>
          <div className="text-gray-400 text-sm">Completed</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-blue-400 text-xl font-bold">
            {Math.round(dayStats.totalTime / 60 * 10) / 10}h
          </div>
          <div className="text-gray-400 text-sm">Total Time</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-purple-400 text-xl font-bold">
            {Math.round(dayStats.productiveTime / 60 * 10) / 10}h
          </div>
          <div className="text-gray-400 text-sm">Productive</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-yellow-400 text-xl font-bold">
            {dayStats.averageProductivity.toFixed(1)}
          </div>
          <div className="text-gray-400 text-sm">Avg Score</div>
        </div>
      </div>

      {/* Current Activity */}
      {currentBlocks.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Currently Active
          </h3>
          {currentBlocks.map(block => (
            <div key={block.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{BLOCK_TYPES[block.type].icon}</span>
                <div>
                  <div className="text-white font-medium">{block.title}</div>
                  <div className="text-gray-300 text-sm">
                    {formatTime(block.start_time)} - {formatTime(block.end_time)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => completeTimeBlock(block.id, 8)} // Default score
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Blocks Preview */}
      {upcomingBlocks.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Coming Up
          </h3>
          <div className="space-y-2">
            {upcomingBlocks.map(block => (
              <div key={block.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{BLOCK_TYPES[block.type].icon}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{block.title}</div>
                    <div className="text-gray-400 text-xs">
                      {formatTime(block.start_time)} ({formatDuration(block.start_time, block.end_time)})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startTimeBlock(block.id)}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-2 py-1 rounded text-xs transition-colors"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Timeline */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Schedule
        </h3>
        
        {timeBlocks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-xl font-medium mb-2">No blocks scheduled</h4>
            <p>Start planning your day by adding time blocks!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeBlocks.map(block => (
              <TimeBlockCard
                key={block.id}
                block={block}
                onUpdate={updateTimeBlock}
                onDelete={deleteTimeBlock}
                onEdit={setEditingBlock}
                onStart={startTimeBlock}
                onComplete={completeTimeBlock}
                formatTime={formatTime}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Block Modal */}
      {(showAddBlock || editingBlock) && (
        <TimeBlockModal
          block={editingBlock}
          onSave={editingBlock ? 
            (updates) => updateTimeBlock(editingBlock.id, updates) : 
            saveTimeBlock
          }
          onClose={() => {
            setShowAddBlock(false);
            setEditingBlock(null);
          }}
          hasTimeConflict={hasTimeConflict}
          currentDate={currentDate}
        />
      )}
    </div>
  );
}

// Time Block Card Component
interface TimeBlockCardProps {
  block: TimeBlock;
  onUpdate: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (block: TimeBlock) => void;
  onStart: (id: string) => Promise<void>;
  onComplete: (id: string, score?: number) => Promise<void>;
  formatTime: (dateString: string) => string;
  formatDuration: (start: string, end: string) => string;
}

function TimeBlockCard({ 
  block, 
  onUpdate, 
  onDelete, 
  onEdit, 
  onStart, 
  onComplete,
  formatTime, 
  formatDuration 
}: TimeBlockCardProps) {
  const [loading, setLoading] = useState(false);
  const blockType = BLOCK_TYPES[block.type];
  
  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const score = prompt('Rate productivity (1-10):', '8');
    const numScore = score ? parseInt(score) : 8;
    handleAction(() => onComplete(block.id, Math.max(1, Math.min(10, numScore))));
  };

  const handleDelete = () => {
    if (confirm('Delete this time block?')) {
      handleAction(() => onDelete(block.id));
    }
  };

  const getStatusColor = () => {
    switch (block.status) {
      case 'active': return 'border-green-500 bg-green-500/10';
      case 'completed': return 'border-gray-600 bg-gray-600/10';
      case 'cancelled': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-700 bg-gray-800/50';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-colors ${getStatusColor()}`}
      style={{ borderLeftColor: blockType.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{blockType.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${
                block.status === 'completed' 
                  ? 'line-through text-gray-500' 
                  : 'text-white'
              }`}>
                {block.title}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                block.status === 'active' ? 'bg-green-500/20 text-green-400' :
                block.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                block.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {block.status}
              </span>
            </div>
            
            {block.description && (
              <p className="text-gray-400 text-sm mt-1">{block.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>⏰ {formatTime(block.start_time)} - {formatTime(block.end_time)}</span>
              <span>⏱️ {formatDuration(block.start_time, block.end_time)}</span>
              <span>📂 {blockType.name}</span>
              {block.productivity_score && (
                <span>⭐ {block.productivity_score}/10</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {block.status === 'scheduled' && (
            <button
              onClick={() => handleAction(() => onStart(block.id))}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Start
            </button>
          )}
          
          {block.status === 'active' && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Complete
            </button>
          )}
          
          <button
            onClick={() => onEdit(block)}
            disabled={loading}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Time Block Modal Component
interface TimeBlockModalProps {
  block?: TimeBlock | null;
  onSave: (blockData: Partial<TimeBlock>) => Promise<any>;
  onClose: () => void;
  hasTimeConflict: (start: string, end: string, excludeId?: string) => boolean;
  currentDate: Date;
}

function TimeBlockModal({ 
  block, 
  onSave, 
  onClose, 
  hasTimeConflict, 
  currentDate 
}: TimeBlockModalProps) {
  const [formData, setFormData] = useState({
    title: block?.title || '',
    description: block?.description || '',
    type: block?.type || 'work' as keyof typeof BLOCK_TYPES,
    start_time: block?.start_time || '',
    end_time: block?.end_time || '',
    task_ids: block?.task_ids || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default times if creating new block
  useEffect(() => {
    if (!block && !formData.start_time) {
      const now = new Date();
      const nextHour = new Date(currentDate);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const endTime = new Date(nextHour);
      endTime.setHours(endTime.getHours() + 1);

      setFormData(prev => ({
        ...prev,
        start_time: nextHour.toISOString().slice(0, 16),
        end_time: endTime.toISOString().slice(0, 16)
      }));
    }
  }, [block, currentDate, formData.start_time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) return;

    setLoading(true);
    setError(null);

    try {
      // Check for time conflicts
      if (hasTimeConflict(formData.start_time, formData.end_time, block?.id)) {
        throw new Error('Time conflict with existing block');
      }

      // Validate time order
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        throw new Error('End time must be after start time');
      }

      await onSave({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        task_ids: formData.task_ids
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time block');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {block ? 'Edit Time Block' : 'Add Time Block'}
        </h3>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter block title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none h-20 resize-none"
              placeholder="Optional description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as keyof typeof BLOCK_TYPES 
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              {Object.entries(BLOCK_TYPES).map(([key, type]) => (
                <option key={key} value={key}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-2 px-4 rounded-md font-medium transition-colors"
            >
              {loading ? 'Saving...' : (block ? 'Update' : 'Add Block')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}