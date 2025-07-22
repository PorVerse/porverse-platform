interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'running';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_data?: any;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
}

interface WorkflowAutomationProps {
  className?: string;
}

const TRIGGER_TYPES = {
  time: { icon: Clock, name: 'Scheduled', color: '#06b6d4' },
  task_completion: { icon: BarChart3, name: 'Task Complete', color: '#10b981' },
  email_received: { icon: Mail, name: 'Email Received', color: '#f59e0b' },
  calendar_event: { icon: Calendar, name: 'Calendar Event', color: '#8b5cf6' },
  manual: { icon: Play, name: 'Manual Trigger', color: '#ef4444' }
} as const;

const ACTION_TYPES = {
  create_task: { icon: Plus, name: 'Create Task', color: '#06b6d4' },
  send_email: { icon: Mail, name: 'Send Email', color: '#f59e0b' },
  update_calendar: { icon: Calendar, name: 'Update Calendar', color: '#8b5cf6' },
  send_notification: { icon: MessageSquare, name: 'Send Notification', color: '#10b981' },
  api_call: { icon: Zap, name: 'API Call', color: '#ef4444' }
} as const;

export default function WorkflowAutomation({ className }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'runs' | 'templates'>('workflows');
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalRuns: 0,
    successRate: 0,
    timeSaved: 0
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

  // Load workflows and runs
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Load workflows from user_progress table
        const { data: workflowData, error: workflowError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'workflow')
          .order('created_at', { ascending: false });

        if (workflowError) {
          throw new Error(workflowError.message);
        }

        // Transform progress data to workflows
        const transformedWorkflows: Workflow[] = (workflowData || []).map(progress => ({
          id: progress.id,
          user_id: progress.user_id,
          name: progress.progress_data.name,
          description: progress.progress_data.description,
          triggers: progress.progress_data.triggers || [],
          actions: progress.progress_data.actions || [],
          conditions: progress.progress_data.conditions || [],
          status: progress.progress_data.status || 'inactive',
          runs_count: progress.progress_data.runs_count || 0,
          success_rate: progress.progress_data.success_rate || 0,
          last_run: progress.progress_data.last_run,
          created_at: progress.created_at,
          updated_at: progress.created_at
        }));

        setWorkflows(transformedWorkflows);

        // Load workflow runs
        const { data: runsData, error: runsError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'workflow_run')
          .order('created_at', { ascending: false })
          .limit(50);

        if (runsError) {
          console.error('Error loading workflow runs:', runsError);
        } else {
          const transformedRuns: WorkflowRun[] = (runsData || []).map(progress => ({
            id: progress.id,
            workflow_id: progress.progress_data.workflow_id,
            status: progress.progress_data.status,
            started_at: progress.progress_data.started_at,
            completed_at: progress.progress_data.completed_at,
            error_message: progress.progress_data.error_message,
            execution_data: progress.progress_data.execution_data
          }));
          setWorkflowRuns(transformedRuns);
        }

        calculateStats(transformedWorkflows, transformedRuns);
      } catch (err) {
        console.error('Error loading workflow data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, supabase]);

  // Calculate statistics
  const calculateStats = (workflows: Workflow[], runs: WorkflowRun[]) => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const totalRuns = runs.length;
    const successfulRuns = runs.filter(r => r.status === 'success').length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
    
    // Estimate time saved (rough calculation based on automation types)
    const timeSaved = workflows.reduce((total, workflow) => {
      const estimatedSavingPerRun = workflow.actions.length * 5; // 5 minutes per action
      return total + (workflow.runs_count * estimatedSavingPerRun);
    }, 0);

    setStats({
      totalWorkflows,
      activeWorkflows,
      totalRuns,
      successRate,
      timeSaved
    });
  };

  // Save workflow to Supabase
  const saveWorkflow = async (workflowData: Partial<Workflow>) => {
    if (!userId) return;

    try {
      const progressData = {
        name: workflowData.name!,
        description: workflowData.description,
        triggers: workflowData.triggers || [],
        actions: workflowData.actions || [],
        conditions: workflowData.conditions || [],
        status: workflowData.status || 'inactive',
        runs_count: 0,
        success_rate: 0,
        last_run: null
      };

      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          ecosystem: 'por-flow',
          progress_type: 'workflow',
          progress_data: progressData,
          score: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const newWorkflow: Workflow = {
        id: data.id,
        user_id: userId,
        name: progressData.name,
        description: progressData.description,
        triggers: progressData.triggers,
        actions: progressData.actions,
        conditions: progressData.conditions,
        status: progressData.status,
        runs_count: 0,
        success_rate: 0,
        created_at: data.created_at,
        updated_at: data.created_at
      };

      setWorkflows(prev => [newWorkflow, ...prev]);
      return newWorkflow;
    } catch (err) {
      console.error('Error saving workflow:', err);
      throw err;
    }
  };

  // Update workflow
  const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      const currentWorkflow = workflows.find(w => w.id === workflowId);
      if (!currentWorkflow) return;

      const updatedProgressData = {
        name: updates.name || currentWorkflow.name,
        description: updates.description !== undefined ? updates.description : currentWorkflow.description,
        triggers: updates.triggers || currentWorkflow.triggers,
        actions: updates.actions || currentWorkflow.actions,
        conditions: updates.conditions || currentWorkflow.conditions,
        status: updates.status || currentWorkflow.status,
        runs_count: updates.runs_count !== undefined ? updates.runs_count : currentWorkflow.runs_count,
        success_rate: updates.success_rate !== undefined ? updates.success_rate : currentWorkflow.success_rate,
        last_run: updates.last_run !== undefined ? updates.last_run : currentWorkflow.last_run
      };

      const { error } = await supabase
        .from('user_progress')
        .update({
          progress_data: updatedProgressData
        })
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, ...updates }
          : workflow
      ));
    } catch (err) {
      console.error('Error updating workflow:', err);
      throw err;
    }
  };

  // Delete workflow
  const deleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (err) {
      console.error('Error deleting workflow:', err);
      throw err;
    }
  };

  // Toggle workflow status
  const toggleWorkflowStatus = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newStatus = workflow.status === 'active' ? 'inactive' : 'active';
    await updateWorkflow(workflowId, { status: newStatus });
  };

  // Run workflow manually
  const runWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    try {
      // Create workflow run record
      const runData = {
        workflow_id: workflowId,
        status: 'running',
        started_at: new Date().toISOString(),
        execution_data: {}
      };

      const { data: runRecord, error: runError } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId!,
          ecosystem: 'por-flow',
          progress_type: 'workflow_run',
          progress_data: runData,
          score: 0
        }])
        .select()
        .single();

      if (runError) throw runError;

      // Simulate workflow execution (in real implementation, this would execute the actual workflow)
      setTimeout(async () => {
        const success = Math.random() > 0.1; // 90% success rate
        const completedRunData = {
          ...runData,
          status: success ? 'success' : 'failed',
          completed_at: new Date().toISOString(),
          error_message: success ? undefined : 'Simulated error for demo'
        };

        await supabase
          .from('user_progress')
          .update({
            progress_data: completedRunData
          })
          .eq('id', runRecord.id);

        // Update workflow stats
        const newRunsCount = workflow.runs_count + 1;
        const successfulRuns = success ? 
          Math.floor(workflow.success_rate * workflow.runs_count / 100) + 1 : 
          Math.floor(workflow.success_rate * workflow.runs_count / 100);
        const newSuccessRate = (successfulRuns / newRunsCount) * 100;

        await updateWorkflow(workflowId, {
          runs_count: newRunsCount,
          success_rate: newSuccessRate,
          last_run: new Date().toISOString()
        });

        // Refresh data
        window.location.reload(); // In a real app, you'd refresh the data more elegantly
      }, 2000);

      alert('Workflow started! Check the runs tab to see progress.');
    } catch (err) {
      console.error('Error running workflow:', err);
      alert('Failed to start workflow');
    }
  };

  // Get workflow templates
  const getWorkflowTemplates = (): WorkflowTemplate[] => [
    {
      name: 'Daily Task Review',
      description: 'Automatically review and prioritize tasks every morning',
      triggers: [{ type: 'time', config: { schedule: '09:00', repeat: 'daily' } }],
      actions: [
        { type: 'create_task', config: { title: 'Review daily priorities', category: 'Planning' } },
        { type: 'send_notification', config: { message: 'Time for daily task review!' } }
      ]
    },
    {
      name: 'Meeting Follow-up',
      description: 'Create follow-up tasks after calendar meetings',
      triggers: [{ type: 'calendar_event', config: { event: 'meeting_ended' } }],
      actions: [
        { type: 'create_task', config: { title: 'Follow up on meeting action items', category: 'Follow-up' } }
      ]
    },
    {
      name: 'Weekly Report',
      description: 'Generate and send weekly productivity report',
      triggers: [{ type: 'time', config: { schedule: 'Friday 17:00', repeat: 'weekly' } }],
      actions: [
        { type: 'send_email', config: { subject: 'Weekly Productivity Report', template: 'weekly_report' } }
      ]
    }
  ];

  if (loading) {
    return (
      <div className={`workflow-automation ${className}`}>
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
      <div className={`workflow-automation ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading workflows</h3>
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

  return (
    <div className={`workflow-automation ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Workflow Automation</h2>
        <button
          onClick={() => setShowCreateWorkflow(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Workflow
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-cyan-400 text-xl font-bold">{stats.totalWorkflows}</div>
          <div className="text-gray-400 text-sm">Total Workflows</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-green-400 text-xl font-bold">{stats.activeWorkflows}</div>
          <div className="text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-blue-400 text-xl font-bold">{stats.totalRuns}</div>
          <div className="text-gray-400 text-sm">Total Runs</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-purple-400 text-xl font-bold">{stats.successRate.toFixed(1)}%</div>
          <div className="text-gray-400 text-sm">Success Rate</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-yellow-400 text-xl font-bold">{Math.round(stats.timeSaved / 60)}h</div>
          <div className="text-gray-400 text-sm">Time Saved</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {(['workflows', 'runs', 'templates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No workflows created</h3>
              <p>Start automating your tasks by creating your first workflow!</p>
            </div>
          ) : (
            workflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onToggleStatus={toggleWorkflowStatus}
                onEdit={setEditingWorkflow}
                onDelete={deleteWorkflow}
                onRun={runWorkflow}
                onSelect={setSelectedWorkflow}
                isSelected={selectedWorkflow === workflow.id}
              />
            ))
          )}
        </div>
      )}

      {/* Runs Tab */}
      {activeTab === 'runs' && (
        <div className="space-y-3">
          {workflowRuns.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No workflow runs</h3>
              <p>Run some workflows to see execution history here!</p>
            </div>
          ) : (
            workflowRuns.map(run => (
              <WorkflowRunCard
                key={run.id}
                run={run}
                workflow={workflows.find(w => w.id === run.workflow_id)}
              />
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4 md:grid-cols-2">
          {getWorkflowTemplates().map((template, index) => (
            <WorkflowTemplateCard
              key={index}
              template={template}
              onUse={(templateData) => {
                setShowCreateWorkflow(true);
                // You'd pre-fill the form with template data
              }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Workflow Modal */}
      {(showCreateWorkflow || editingWorkflow) && (
        <WorkflowModal
          workflow={editingWorkflow}
          onSave={editingWorkflow ? 
            (updates) => updateWorkflow(editingWorkflow.id, updates) : 
            saveWorkflow
          }
          onClose={() => {
            setShowCreateWorkflow(false);
            setEditingWorkflow(null);
          }}
        />
      )}
    </div>
  );
}

// Workflow Card Component
interface WorkflowCardProps {
  workflow: Workflow;
  onToggleStatus: (id: string) => Promise<void>;
  onEdit: (workflow: Workflow) => void;
  onDelete: (id: string) => Promise<void>;
  onRun: (id: string) => Promise<void>;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function WorkflowCard({ 
  workflow, 
  onToggleStatus, 
  onEdit, 
  onDelete, 
  onRun, 
  onSelect,
  isSelected 
}: WorkflowCardProps) {
  const [loading, setLoading] = useState(false);

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

  const handleDelete = () => {
    if (confirm(`Delete workflow "${workflow.name}"?`)) {
      handleAction(() => onDelete(workflow.id));
    }
  };

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'active': return 'border-green-500 bg-green-500/10';
      case 'paused': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'active': return <Play className="w-4 h-4 text-green-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      default: return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-colors cursor-pointer ${getStatusColor()} ${
        isSelected ? 'ring-2 ring-cyan-500' : ''
      }`}
      onClick={() => onSelect(workflow.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{workflow.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
                workflow.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {workflow.status}
              </span>
            </div>
            
            {workflow.description && (
              <p className="text-gray-400 text-sm mt-1">{workflow.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>🎯 {workflow.triggers.length} trigger{workflow.triggers.length !== 1 ? 's' : ''}</span>
              <span>⚡ {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}</span>
              <span>📊 {workflow.runs_count} runs</span>
              <span>✅ {workflow.success_rate.toFixed(0)}% success</span>
              {workflow.last_run && (
                <span>🕐 Last: {new Date(workflow.last_run).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleAction(() => onToggleStatus(workflow.id))}
            disabled={loading}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              workflow.status === 'active'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {workflow.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          
          <button
            onClick={() => handleAction(() => onRun(workflow.id))}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Run
          </button>
          
          <button
            onClick={() => onEdit(workflow)}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Workflow Run Card Component
interface WorkflowRunCardProps {
  run: WorkflowRun;
  workflow?: Workflow;
}

function WorkflowRunCard({ run, workflow }: WorkflowRunCardProps) {
  const getStatusColor = () => {
    switch (run.status) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'failed': return 'border-red-500 bg-red-500/10';
      case 'running': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (run.status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      default: return '⏸️';
    }
  };

  const formatDuration = () => {
    if (!run.completed_at) return 'Running...';
    const start = new Date(run.started_at);
    const end = new Date(run.completed_at);
    const seconds = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${seconds}s`;
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <div className="text-white font-medium">
              {workflow?.name || 'Unknown Workflow'}
            </div>
            <div className="text-gray-400 text-sm">
              Started: {new Date(run.started_at).toLocaleString('ro-RO')}
            </div>
            {run.error_message && (
              <div className="text-red-400 text-sm mt-1">
                Error: {run.error_message}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-gray-400 text-sm">
          Duration: {formatDuration()}
        </div>
      </div>
    </div>
  );
}

// Workflow Template Card Component
interface WorkflowTemplateCardProps {
  template: WorkflowTemplate;
  onUse: (template: WorkflowTemplate) => void;
}

function WorkflowTemplateCard({ template, onUse }: WorkflowTemplateCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-white">{template.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{template.description}</p>
        </div>
        <FileText className="w-5 h-5 text-cyan-400" />
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>🎯 {template.triggers.length} triggers</span>
        <span>⚡ {template.actions.length} actions</span>
      </div>
      
      <button
        onClick={() => onUse(template)}
        className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 px-4 rounded-md transition-colors"
      >
        Use Template
      </button>
    </div>
  );
}

// Workflow Modal Component
interface WorkflowModalProps {
  workflow?: Workflow | null;
  onSave: (workflowData: Partial<Workflow>) => Promise<any>;
  onClose: () => void;
}

function WorkflowModal({ workflow, onSave, onClose }: WorkflowModalProps) {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    triggers: workflow?.triggers || [],
    actions: workflow?.actions || [],
    conditions: workflow?.conditions || [],
    status: workflow?.status || 'inactive' as const
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'basic' | 'triggers' | 'actions' | 'conditions'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Validation
      if (formData.triggers.length === 0) {
        throw new Error('At least one trigger is required');
      }
      if (formData.actions.length === 0) {
        throw new Error('At least one action is required');
      }

      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        triggers: formData.triggers,
        actions: formData.actions,
        conditions: formData.conditions,
        status: formData.status
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const addTrigger = (trigger: WorkflowTrigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, trigger]
    }));
  };

  const removeTrigger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  const addAction = (action: WorkflowAction) => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, action]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Enter workflow name..."
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
                placeholder="Describe what this workflow does..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as Workflow['status']
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        );

      case 'triggers':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Triggers</h4>
              <button
                type="button"
                onClick={() => addTrigger({ 
                  type: 'time', 
                  config: { schedule: '09:00', repeat: 'daily' } 
                })}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-1 rounded text-sm transition-colors"
              >
                Add Trigger
              </button>
            </div>
            
            {formData.triggers.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-8">
                No triggers added. Click "Add Trigger" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.triggers.map((trigger, index) => {
                  const TriggerIcon = TRIGGER_TYPES[trigger.type].icon;
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <TriggerIcon 
                            className="w-4 h-4"
                            style={{ color: TRIGGER_TYPES[trigger.type].color }}
                          />
                          <span className="text-white font-medium">
                            {TRIGGER_TYPES[trigger.type].name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTrigger(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        {JSON.stringify(trigger.config)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'actions':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Actions</h4>
              <button
                type="button"
                onClick={() => addAction({ 
                  type: 'create_task', 
                  config: { title: 'New task', category: 'Automated' } 
                })}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-1 rounded text-sm transition-colors"
              >
                Add Action
              </button>
            </div>
            
            {formData.actions.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-8">
                No actions added. Click "Add Action" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.actions.map((action, index) => {
                  const ActionIcon = ACTION_TYPES[action.type].icon;
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ActionIcon 
                            className="w-4 h-4"
                            style={{ color: ACTION_TYPES[action.type].color }}
                          />
                          <span className="text-white font-medium">
                            {ACTION_TYPES[action.type].name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAction(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        {JSON.stringify(action.config)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'conditions':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">Conditions (Optional)</h4>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  conditions: [...prev.conditions, {
                    field: 'task_priority',
                    operator: 'equals',
                    value: 'high'
                  }]
                }))}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-1 rounded text-sm transition-colors"
              >
                Add Condition
              </button>
            </div>
            
            {formData.conditions.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-8">
                No conditions set. Workflow will run for all trigger events.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-white">
                        {condition.field} {condition.operator} {condition.value}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          conditions: prev.conditions.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 'basic', name: 'Basic Info', icon: Settings },
    { id: 'triggers', name: 'Triggers', icon: Zap },
    { id: 'actions', name: 'Actions', icon: Play },
    { id: 'conditions', name: 'Conditions', icon: BarChart3 }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </h3>
        
        {/* Step Navigation */}
        <div className="flex space-x-1 mb-6">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeStep === step.id
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <StepIcon className="w-4 h-4" />
                {step.name}
              </button>
            );
          })}
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>
          
          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            
            {activeStep !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (currentIndex > 0) {
                    setActiveStep(steps[currentIndex - 1].id);
                  }
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Previous
              </button>
            )}
            
            {activeStep !== 'conditions' ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex(s => s.id === activeStep);
                  if (currentIndex < steps.length - 1) {
                    setActiveStep(steps[currentIndex + 1].id);
                  }
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-black py-2 px-4 rounded-md font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || formData.triggers.length === 0 || formData.actions.length === 0}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-2 px-4 rounded-md font-medium transition-colors"
              >
                {loading ? 'Saving...' : (workflow ? 'Update Workflow' : 'Create Workflow')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}// components/por-flow/WorkflowAutomation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  Calendar,
  Mail,
  MessageSquare,
  FileText,
  Clock
} from 'lucide-react';

interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  status: 'active' | 'inactive' | 'paused';
  runs_count: number;
  success_rate: number;
  last_run?: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowTrigger {
  type: 'time' | 'task_completion' | 'email_received' | 'calendar_event' | 'manual';
  config: any;
}

interface WorkflowAction {
  type: 'create_task' | 'send_email' | 'update_calendar' | 'send_notification' | 'api_call';
  config: any;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'running';