// app/api/por-kids/upload-homework/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('homework') as File;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!subject || !grade) {
      return NextResponse.json(
        { error: 'Subject and grade are required' },
        { status: 400 }
      );
    }

    // Mock file processing
    const analysisId = 'hw_' + Math.random().toString(36).substring(7);
    
    // Simulate file upload and OCR processing
    const mockAnalysis = {
      id: analysisId,
      subject,
      grade: parseInt(grade),
      fileName: file.name,
      fileSize: file.size,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      solution: {
        steps: [
          'Read the problem carefully',
          'Identify what we need to find',
          'Apply the appropriate method',
          'Solve step by step',
          'Check the answer'
        ],
        explanation: `This ${subject} problem for grade ${grade} can be solved using standard methods.`,
        confidence: 0.85
      }
    };

    console.log('Homework uploaded:', {
      file: file.name,
      subject,
      grade,
      analysisId
    });

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      needsParentApproval: parseInt(grade) <= 6
    });

  } catch (error) {
    console.error('Error uploading homework:', error);
    return NextResponse.json(
      { error: 'Failed to upload homework' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Mock analysis retrieval
    const mockAnalysis = {
      id: analysisId,
      status: 'completed',
      solution: {
        steps: ['Step 1', 'Step 2', 'Step 3'],
        explanation: 'Detailed solution explanation',
        confidence: 0.92
      },
      parentApproved: true
    };

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis
    });

  } catch (error) {
    console.error('Error fetching homework analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}