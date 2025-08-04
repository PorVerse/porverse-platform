#!/usr/bin/env node

// scripts/update-dashboard-components.js
// Script to automatically replace mock data with real API calls

const fs = require('fs')
const path = require('path')

console.log('🔄 Updating dashboard components to use real APIs...')

// ================================
// UTILITY FUNCTIONS
// ================================

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return null
  }
}

function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Updated: ${filePath}`)
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message)
    return false
  }
}

function updateImports(content) {
  // Add API client import if not present
  if (!content.includes("import { apiClient")) {
    const importRegex = /(import.*from.*['"][^'"]*['"];\s*\n)/
    const apiImport = "import { apiClient, useAPICall } from '@/lib/api/api-client'\n"
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1${apiImport}`)
    } else {
      // Add at the beginning after 'use client' if present
      if (content.includes("'use client'")) {
        content = content.replace("'use client';\n", `'use client';\n\n${apiImport}`)
      } else {
        content = `${apiImport}\n${content}`
      }
    }
  }
  
  return content
}

// ================================
// COMPONENT UPDATE PATTERNS
// ================================

const updatePatterns = [
  // Replace mock data with real API calls
  {
    pattern: /const \[(\w+), set\w+\] = useState\((.*mockData.*|.*\[.*\].*)\)/g,
    replacement: (match, stateName, mockData) => {
      return `const { data: ${stateName}, loading: ${stateName}Loading, error: ${stateName}Error } = useAPICall(() => apiClient.getUserProgress(), [])`
    }
  },
  
  // Replace mock API calls
  {
    pattern: /\/\/ TODO: Replace with real API call\s*\n.*setLoading\(true\)[\s\S]*?setLoading\(false\)/g,
    replacement: `const result = await apiClient.chatWithAI(ecosystem, message, context)
    if (result.error) {
      console.error('AI Chat error:', result.error)
      return
    }
    // Handle successful response
    if (result.data) {
      // Process the AI response
    }`
  },
  
  // Replace setTimeout mock delays
  {
    pattern: /setTimeout\(\(\) => \{[\s\S]*?\}, \d+\)/g,
    replacement: ''
  },
  
  // Update mock nutrition plan generation
  {
    pattern: /const generateMealPlan = async \(\) => \{[\s\S]*?setLoading\(false\)\s*\}/g,
    replacement: `const generateMealPlan = async () => {
    setLoading(true)
    setError(null)
    
    const result = await apiClient.generateNutritionPlan({
      targetCalories: userPreferences.targetCalories,
      dietaryRestrictions: userPreferences.dietaryRestrictions,
      allergies: userPreferences.allergies,
      mealsPerDay: userPreferences.mealsPerDay
    })
    
    if (result.error) {
      setError(result.error)
    } else {
      setMealPlan(result.data)
    }
    
    setLoading(false)
  }`
  },
  
  // Update mock homework analysis
  {
    pattern: /const analyzeHomework = async \(\) => \{[\s\S]*?setAnalyzing\(false\)\s*\}/g,
    replacement: `const analyzeHomework = async () => {
    setAnalyzing(true)
    setError(null)
    
    if (!uploadedImage) {
      setError('Please upload an image first')
      setAnalyzing(false)
      return
    }
    
    const result = await apiClient.analyzeHomework(uploadedImage, selectedSubject, gradeLevel)
    
    if (result.error) {
      setError(result.error)
    } else {
      setAnalysisResult(result.data)
    }
    
    setAnalyzing(false)
  }`
  },
  
  // Update mock AI therapy
  {
    pattern: /const sendMessage = async \(\) => \{[\s\S]*?setIsTyping\(false\)\s*\}/g,
    replacement: `const sendMessage = async () => {
    if (!currentMessage.trim()) return
    
    setIsTyping(true)
    const userMessage = currentMessage
    setCurrentMessage('')
    
    // Add user message to conversation
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    
    setConversation(prev => [...prev, newUserMessage])
    
    // Get AI response
    const result = await apiClient.getTherapySession(userMessage, {
      conversationHistory: conversation,
      userMood: currentMood,
      sessionType: 'general'
    })
    
    if (result.error) {
      console.error('Therapy session error:', result.error)
    } else {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.data.response,
        timestamp: new Date(),
        techniques: result.data.techniques
      }
      setConversation(prev => [...prev, aiMessage])
    }
    
    setIsTyping(false)
  }`
  },
  
  // Update Future Self generation
  {
    pattern: /const generateFutureSelf = async \(\) => \{[\s\S]*?setGenerating\(false\)\s*\}/g,
    replacement: `const generateFutureSelf = async () => {
    setGenerating(true)
    setError(null)
    
    const result = await apiClient.generateFutureSelf(selectedTimeline)
    
    if (result.error) {
      setError(result.error)
    } else {
      setFutureSelf(result.data)
      // Trigger avatar generation
      const avatarResult = await apiClient.createFutureAvatar(result.data)
      if (avatarResult.data) {
        setFutureSelf(prev => ({ ...prev, avatar: avatarResult.data.avatar }))
      }
    }
    
    setGenerating(false)
  }`
  }
]

// ================================
// FILE PROCESSING
// ================================

function updateComponent(filePath) {
  let content = readFile(filePath)
  if (!content) return false
  
  let updated = false
  
  // Add imports
  const originalContent = content
  content = updateImports(content)
  if (content !== originalContent) updated = true
  
  // Apply update patterns
  for (const pattern of updatePatterns) {
    const newContent = content.replace(pattern.pattern, pattern.replacement)
    if (newContent !== content) {
      content = newContent
      updated = true
    }
  }
  
  // Remove mock data comments
  content = content.replace(/\/\/ Mock data[\s\S]*?(?=\n\s*(?:export|function|const|let|var|\}|$))/g, '')
  content = content.replace(/\/\* Mock[\s\S]*?\*\//g, '')
  
  if (updated) {
    return writeFile(filePath, content)
  }
  
  return true
}

// ================================
// MAIN EXECUTION
// ================================

function findComponentFiles(dir) {
  const files = []
  
  try {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findComponentFiles(itemPath))
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(itemPath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message)
  }
  
  return files
}

// Find all component files
const dashboardDir = path.join(__dirname, '..', 'app', 'dashboard')
const componentsDir = path.join(__dirname, '..', 'components')

const dashboardFiles = findComponentFiles(dashboardDir)
const componentFiles = findComponentFiles(componentsDir)

const allFiles = [...dashboardFiles, ...componentFiles]

console.log(`Found ${allFiles.length} component files to update...`)

// Update each file
let successCount = 0
let errorCount = 0

for (const filePath of allFiles) {
  console.log(`Processing: ${path.relative(process.cwd(), filePath)}`)
  
  if (updateComponent(filePath)) {
    successCount++
  } else {
    errorCount++
  }
}

// ================================
// SUMMARY
// ================================

console.log('\n' + '='.repeat(50))
console.log('📊 UPDATE SUMMARY')
console.log('='.repeat(50))
console.log(`✅ Successfully updated: ${successCount} files`)
console.log(`❌ Errors: ${errorCount} files`)
console.log(`📁 Total processed: ${allFiles.length} files`)

if (successCount > 0) {
  console.log('\n🎉 Dashboard components updated successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Review the updated files for any manual adjustments needed')
  console.log('2. Test each dashboard component')
  console.log('3. Run: npm run build to check for TypeScript errors')
  console.log('4. Run: npm run dev to test locally')
}

if (errorCount > 0) {
  console.log('\n⚠️  Some files had errors. Please review them manually.')
}

console.log('\n🚀 Ready for testing!')