// app/api/porflow/tasks/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock user authentication
    const userId = 'user_123';
    
    // Mock tasks data
    const tasks = [
      {
        id: 1,
        title: 'Complete project proposal',
        description: 'Finish the Q1 project proposal document',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2025-08-15',
        estimatedMinutes: 120,
        tags: ['work', 'urgent']
      },
      {
        id: 2,
        title: 'Review marketing materials',
        description: 'Check new campaign assets',
        priority: 'medium',
        status: 'pending',
        dueDate: '2025-08-12',
        estimatedMinutes: 45,
        tags: ['marketing', 'review']
      },
      {
        id: 3,
        title: 'Team meeting preparation',
        description: 'Prepare agenda and materials',
        priority: 'low',
        status: 'completed',
        dueDate: '2025-08-10',
        estimatedMinutes: 30,
        tags: ['meeting', 'team']
      }
    ];

    return NextResponse.json({
      success: true,
      tasks,
      total: tasks.length,
      userId
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, dueDate, estimatedMinutes, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Mock task creation
    const newTask = {
      id: Math.floor(Math.random() * 10000),
      title,
      description: description || '',
      priority: priority || 'medium',
      status: 'pending',
      dueDate,
      estimatedMinutes: estimatedMinutes || 60,
      tags: tags || [],
      createdAt: new Date().toISOString()
    };

    console.log('Creating new task:', newTask);

    return NextResponse.json({
      success: true,
      task: newTask
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Mock task update
    const updatedTask = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      task: updatedTask
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting task:', taskId);

    return NextResponse.json({
      success: true,
      deletedId: taskId
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}