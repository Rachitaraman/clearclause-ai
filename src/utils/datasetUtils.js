/**
 * CUAD Dataset Utilities
 * Utilities for working with the Contract Understanding Atticus Dataset (CUAD)
 */

/**
 * Load and parse CUAD dataset files
 */
export async function loadCUADDataset() {
  try {
    // In a real implementation, you would load the dataset files
    // For now, we'll provide a structure for working with CUAD data
    
    const datasetInfo = {
      name: 'Contract Understanding Atticus Dataset (CUAD)',
      version: '1.0',
      description: 'A dataset of legal contracts with expert annotations',
      totalContracts: 510,
      categories: [
        'Employment Agreements',
        'Service Agreements', 
        'License Agreements',
        'Purchase Agreements',
        'Lease Agreements',
        'Partnership Agreements',
        'Non-Disclosure Agreements',
        'Terms of Service'
      ],
      annotationTypes: [
        'Document Name',
        'Parties',
        'Agreement Date', 
        'Effective Date',
        'Expiration Date',
        'Renewal Term',
        'Notice Period To Terminate Renewal',
        'Governing Law',
        'Most Favored Nation',
        'Non-Compete',
        'Exclusivity',
        'No-Solicit Of Customers',
        'Competitive Restriction Exception',
        'No-Solicit Of Employees',
        'Non-Disparagement',
        'Termination For Convenience',
        'Rofr/Rofo/Rofn',
        'Change Of Control',
        'Anti-Assignment',
        'Revenue/Customer Sharing',
        'Price Restrictions',
        'Minimum Commitment',
        'Volume Restriction',
        'Ip Ownership Assignment',
        'Joint Ip Ownership',
        'License Grant',
        'Non-Transferable License',
        'Affiliate License-Licensor',
        'Affiliate License-Licensee',
        'Unlimited/All-You-Can-Eat-License',
        'Irrevocable Or Perpetual License',
        'Source Code Escrow',
        'Post-Termination Services',
        'Audit Rights',
        'Uncapped Liability',
        'Cap On Liability',
        'Liquidated Damages',
        'Warranty Duration',
        'Insurance',
        'Covenant Not To Sue'
      ]
    }

    return {
      success: true,
      dataset: datasetInfo
    }
  } catch (error) {
    console.error('Error loading CUAD dataset:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get sample contracts from CUAD for testing
 */
export function getSampleContracts() {
  return [
    {
      id: 'sample_001',
      name: 'Software License Agreement',
      category: 'License Agreements',
      text: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is entered into on [DATE] between TechCorp Inc., a Delaware corporation ("Licensor"), and Client Company, a [STATE] corporation ("Licensee").

1. GRANT OF LICENSE
Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable license to use the Software solely for Licensee's internal business purposes.

2. RESTRICTIONS
Licensee shall not: (a) copy, modify, or create derivative works of the Software; (b) reverse engineer, disassemble, or decompile the Software; (c) distribute, sublicense, or transfer the Software to any third party.

3. TERM AND TERMINATION
This Agreement shall commence on the Effective Date and continue for a period of three (3) years, unless earlier terminated in accordance with this Agreement. Either party may terminate this Agreement for convenience with thirty (30) days written notice.

4. LIMITATION OF LIABILITY
IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, OR USE, INCURRED BY LICENSEE OR ANY THIRD PARTY.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.`,
      annotations: {
        'Parties': ['TechCorp Inc.', 'Client Company'],
        'Governing Law': 'Delaware',
        'Termination For Convenience': 'Yes - 30 days notice',
        'Non-Transferable License': 'Yes',
        'Cap On Liability': 'Yes - excludes indirect damages'
      }
    },
    {
      id: 'sample_002', 
      name: 'Employment Agreement',
      category: 'Employment Agreements',
      text: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made between InnovateCorp, a California corporation ("Company"), and John Smith ("Employee"), effective as of January 1, 2024.

1. EMPLOYMENT
Company hereby employs Employee as Chief Technology Officer, and Employee accepts such employment, subject to the terms and conditions set forth herein.

2. TERM
The term of this Agreement shall commence on January 1, 2024 and shall continue until December 31, 2026, unless earlier terminated in accordance with the provisions hereof.

3. NON-COMPETE
During the term of employment and for a period of twelve (12) months following termination, Employee shall not directly or indirectly engage in any business that competes with Company's business.

4. NON-SOLICITATION
Employee agrees that during employment and for eighteen (18) months thereafter, Employee will not solicit or attempt to solicit any employees of Company to leave their employment.

5. CONFIDENTIALITY
Employee acknowledges that during employment, Employee will have access to confidential information and agrees to maintain the confidentiality of such information.`,
      annotations: {
        'Parties': ['InnovateCorp', 'John Smith'],
        'Agreement Date': 'January 1, 2024',
        'Effective Date': 'January 1, 2024', 
        'Expiration Date': 'December 31, 2026',
        'Non-Compete': 'Yes - 12 months',
        'No-Solicit Of Employees': 'Yes - 18 months'
      }
    }
  ]
}

/**
 * Validate document analysis against CUAD annotations
 */
export function validateAgainstCUAD(analysisResult, cuadAnnotations) {
  const validation = {
    matches: [],
    misses: [],
    accuracy: 0
  }

  try {
    // Compare detected clauses with CUAD annotations
    const detectedClauses = analysisResult.clauses || []
    
    // Check for key CUAD categories
    const cuadCategories = Object.keys(cuadAnnotations)
    
    cuadCategories.forEach(category => {
      const expectedValue = cuadAnnotations[category]
      const detected = findMatchingClause(detectedClauses, category, expectedValue)
      
      if (detected) {
        validation.matches.push({
          category,
          expected: expectedValue,
          detected: detected.content,
          confidence: detected.confidence || 0
        })
      } else {
        validation.misses.push({
          category,
          expected: expectedValue,
          reason: 'Not detected in analysis'
        })
      }
    })

    // Calculate accuracy
    validation.accuracy = validation.matches.length / cuadCategories.length * 100

    return validation
  } catch (error) {
    console.error('Validation error:', error)
    return {
      matches: [],
      misses: [],
      accuracy: 0,
      error: error.message
    }
  }
}

/**
 * Helper function to find matching clauses
 */
function findMatchingClause(clauses, category, expectedValue) {
  // Simple matching logic - in production this would be more sophisticated
  const categoryKeywords = {
    'Parties': ['party', 'parties', 'corporation', 'company'],
    'Governing Law': ['governing', 'law', 'jurisdiction', 'state'],
    'Termination For Convenience': ['terminate', 'termination', 'convenience', 'notice'],
    'Non-Compete': ['non-compete', 'compete', 'competition', 'competing'],
    'No-Solicit Of Employees': ['solicit', 'solicitation', 'employees', 'employment'],
    'Non-Transferable License': ['non-transferable', 'transfer', 'license'],
    'Cap On Liability': ['liability', 'damages', 'limitation', 'limit']
  }

  const keywords = categoryKeywords[category] || []
  
  return clauses.find(clause => {
    const content = clause.content.toLowerCase()
    return keywords.some(keyword => content.includes(keyword.toLowerCase()))
  })
}

/**
 * Generate training examples from CUAD data
 */
export function generateTrainingExamples() {
  const samples = getSampleContracts()
  
  return samples.map(sample => ({
    input: sample.text,
    expectedOutput: {
      documentType: sample.category,
      annotations: sample.annotations,
      clauses: extractClausesFromText(sample.text),
      risks: identifyRisksFromAnnotations(sample.annotations)
    }
  }))
}

/**
 * Extract clauses from contract text
 */
function extractClausesFromText(text) {
  const sections = text.split(/\n\d+\.\s+/)
  return sections.slice(1).map((section, index) => {
    const lines = section.split('\n')
    const title = lines[0].trim()
    const content = lines.slice(1).join('\n').trim()
    
    return {
      id: `clause_${index + 1}`,
      title,
      content,
      category: categorizeClause(title),
      riskLevel: assessRiskLevel(content)
    }
  })
}

/**
 * Categorize clause based on title
 */
function categorizeClause(title) {
  const categories = {
    'license': ['LICENSE', 'GRANT'],
    'termination': ['TERMINATION', 'TERM'],
    'liability': ['LIABILITY', 'DAMAGES'],
    'confidentiality': ['CONFIDENTIAL', 'NON-DISCLOSURE'],
    'employment': ['EMPLOYMENT', 'EMPLOYEE'],
    'governing': ['GOVERNING', 'LAW'],
    'restrictions': ['RESTRICTIONS', 'LIMITATIONS']
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => title.toUpperCase().includes(keyword))) {
      return category
    }
  }
  
  return 'general'
}

/**
 * Assess risk level based on content
 */
function assessRiskLevel(content) {
  const highRiskTerms = ['unlimited', 'uncapped', 'perpetual', 'irrevocable', 'indemnify']
  const mediumRiskTerms = ['terminate', 'breach', 'default', 'penalty']
  
  const contentLower = content.toLowerCase()
  
  if (highRiskTerms.some(term => contentLower.includes(term))) {
    return 'high'
  } else if (mediumRiskTerms.some(term => contentLower.includes(term))) {
    return 'medium'
  }
  
  return 'low'
}

/**
 * Identify risks from CUAD annotations
 */
function identifyRisksFromAnnotations(annotations) {
  const risks = []
  
  // Non-compete clauses are typically high risk
  if (annotations['Non-Compete'] && annotations['Non-Compete'] !== 'No') {
    risks.push({
      id: 'risk_noncompete',
      title: 'Non-Compete Restriction',
      description: `Non-compete clause: ${annotations['Non-Compete']}`,
      severity: 'high',
      category: 'legal'
    })
  }

  // Uncapped liability is critical risk
  if (annotations['Uncapped Liability'] === 'Yes') {
    risks.push({
      id: 'risk_uncapped_liability',
      title: 'Uncapped Liability Exposure',
      description: 'Contract contains uncapped liability provisions',
      severity: 'critical',
      category: 'financial'
    })
  }

  // Termination for convenience
  if (annotations['Termination For Convenience'] === 'No') {
    risks.push({
      id: 'risk_no_convenience_termination',
      title: 'No Convenience Termination',
      description: 'Cannot terminate contract for convenience',
      severity: 'medium',
      category: 'operational'
    })
  }

  return risks
}

/**
 * Export dataset configuration
 */
export const CUAD_CONFIG = {
  datasetPath: './CUAD_v1/',
  annotationCategories: [
    'Document Name', 'Parties', 'Agreement Date', 'Effective Date', 'Expiration Date',
    'Renewal Term', 'Notice Period To Terminate Renewal', 'Governing Law', 'Most Favored Nation',
    'Non-Compete', 'Exclusivity', 'No-Solicit Of Customers', 'Competitive Restriction Exception',
    'No-Solicit Of Employees', 'Non-Disparagement', 'Termination For Convenience', 'Rofr/Rofo/Rofn',
    'Change Of Control', 'Anti-Assignment', 'Revenue/Customer Sharing', 'Price Restrictions',
    'Minimum Commitment', 'Volume Restriction', 'Ip Ownership Assignment', 'Joint Ip Ownership',
    'License Grant', 'Non-Transferable License', 'Affiliate License-Licensor', 'Affiliate License-Licensee',
    'Unlimited/All-You-Can-Eat-License', 'Irrevocable Or Perpetual License', 'Source Code Escrow',
    'Post-Termination Services', 'Audit Rights', 'Uncapped Liability', 'Cap On Liability',
    'Liquidated Damages', 'Warranty Duration', 'Insurance', 'Covenant Not To Sue'
  ]
}