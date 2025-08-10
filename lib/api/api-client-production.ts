// Add these methods to your ProductionAPIClient class

export class ProductionAPIClient {
  // ... existing code ...

  async getConversationHistory(ecosystem: string): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch(`/api/ai/conversations/${ecosystem}`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to get conversation history')
      
      const data = await response.json()
      return { success: true, data: data.conversations || [] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async startAIConversation(ecosystem: string, message?: string): Promise<APIResponse<{ response: string }>> {
    try {
      const response = await fetch(`/api/ai/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ecosystem, message })
      })
      
      if (!response.ok) throw new Error('Failed to start AI conversation')
      
      const data = await response.json()
      return { success: true, data: { response: data.response || data.aiResponse } }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getProgress(ecosystem: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/ecosystems/${ecosystem}/progress`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to get progress')
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async saveProgress(ecosystem: string, progressData: any): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`/api/ecosystems/${ecosystem}/progress`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(progressData)
      })
      
      if (!response.ok) throw new Error('Failed to save progress')
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getMoodHistory(days: number): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch(`/api/ecosystems/por-well/mood/history?days=${days}`, {
        headers: this.getHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to get mood history')
      
      const data = await response.json()
      return { success: true, data: data.moods || [] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createChildProfile(childData: any): Promise<APIResponse<any>> {
    try {
      const response = await fetch('/api/ecosystems/por-kids/children', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(childData)
      })
      
      if (!response.ok) throw new Error('Failed to create child profile')
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getChildProfiles(): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch('/api/ecosystems/por-kids/children', {
        headers: this.getHeaders()
      })
      
      if (!response.ok) throw new Error('Failed to get child profiles')
      
      const data = await response.json()
      return { success: true, data: data.children || [] }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any): APIResponse<any> {
    console.error('API Error:', error)
    return {
      success: false,
      error: error.message || 'An error occurred'
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      // Add auth headers if needed
    }
  }
}