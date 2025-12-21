import { useState } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const DocumentPreview = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('file') // file, image, text, url, multi
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [multipleFiles, setMultipleFiles] = useState([])
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [previewMode, setPreviewMode] = useState('upload') // upload, preview, analyzing
  const [currentContent, setCurrentContent] = useState(null)
  const [currentType, setCurrentType] = useState(null)
  const [showFormatError, setShowFormatError] = useState(false)
  const [formatErrorMessage, setFormatErrorMessage] = useState('')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setCurrentContent(file)
    setCurrentType('file')
    setPreviewMode('preview')
  }

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setCurrentContent(file)
    setCurrentType('image')
    setPreviewMode('preview')
  }

  const handleMultipleFilesSelect = (files) => {
    const fileArray = Array.from(files)
    setMultipleFiles(fileArray)
    setCurrentContent(fileArray)
    setCurrentType('multi')
    setPreviewMode('preview')
  }



  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setCurrentContent(textInput)
      setCurrentType('text')
      setPreviewMode('preview')
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setCurrentContent(urlInput)
      setCurrentType('url')
      setPreviewMode('preview')
    }
  }

  // File format validation
  const validateFileFormat = (file, expectedFormats) => {
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const fileName = file.name.toLowerCase()
    
    // Check if file extension matches expected formats
    const isValidFormat = expectedFormats.some(format => {
      const formatLower = format.toLowerCase()
      return fileExtension === formatLower || fileName.endsWith(`.${formatLower}`)
    })
    
    return isValidFormat
  }

  const showFormatErrorPopup = (expectedFormats, actualFormat) => {
    setFormatErrorMessage(`Invalid file format! Expected: ${expectedFormats.join(', ')} but got: ${actualFormat}`)
    setShowFormatError(true)
    setTimeout(() => setShowFormatError(false), 4000)
  }

  const handleFileInput = (e) => {
    if (activeTab === 'multi') {
      const files = e.target.files
      if (files && files.length > 0) {
        // Validate all files for multi-document upload
        const expectedFormats = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'csv']
        const invalidFiles = []
        
        Array.from(files).forEach(file => {
          if (!validateFileFormat(file, expectedFormats)) {
            invalidFiles.push(file.name)
          }
        })
        
        if (invalidFiles.length > 0) {
          showFormatErrorPopup(expectedFormats, `Invalid files: ${invalidFiles.join(', ')}`)
          e.target.value = '' // Clear the input
          return
        }
        
        handleMultipleFilesSelect(files)
      }
    } else {
      const file = e.target.files[0]
      if (file) {
        let expectedFormats = []
        let isValid = false
        
        // Define expected formats for each tab
        switch (activeTab) {
          case 'file':
            expectedFormats = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'csv']
            isValid = validateFileFormat(file, expectedFormats)
            break
          case 'image':
            expectedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']
            isValid = validateFileFormat(file, expectedFormats)
            break
          default:
            isValid = true
        }
        
        if (!isValid) {
          const actualFormat = file.name.split('.').pop().toLowerCase()
          showFormatErrorPopup(expectedFormats, actualFormat)
          e.target.value = '' // Clear the input
          return
        }
        
        // Process valid file
        if (activeTab === 'image') {
          handleImageSelect(file)
        } else {
          handleFileSelect(file)
        }
      }
    }
  }

  const handleAnalyze = () => {
    setPreviewMode('analyzing')
    
    // Determine analysis type and pass documents
    if (currentType === 'multi' && multipleFiles.length > 1) {
      onAnalyze('comparison', multipleFiles)
    } else {
      onAnalyze('single', currentContent ? [currentContent] : [])
    }
  }

  const resetToUpload = () => {
    setPreviewMode('upload')
    setCurrentContent(null)
    setCurrentType(null)
    setSelectedFile(null)
    setSelectedImage(null)
    setMultipleFiles([])
    setTextInput('')
    setUrlInput('')
  }

  const mockDocumentContent = `
TERMS OF SERVICE AGREEMENT

1. ACCEPTANCE OF TERMS
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

2. TERMINATION
The Company may terminate your access to all or any part of the service at any time, with or without cause, with or without notice, effective immediately.

3. LIABILITY LIMITATION
In no event will the Company be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

4. PRIVACY POLICY
Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.

5. MODIFICATIONS
The Company reserves the right to modify or replace these Terms at any time.
  `.trim()

  const renderTabNavigation = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-2)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 'var(--space-6)',
      gap: 'var(--space-1)'
    }}>
      {[
        { id: 'file', label: 'Documents', icon: '📄', color: 'var(--gradient-primary)' },
        { id: 'multi', label: 'Compare Docs', icon: '⚖️', color: 'var(--gradient-info)' },
        { id: 'image', label: 'Images', icon: '🖼️', color: 'var(--gradient-emerald)' },
        { id: 'text', label: 'Text Input', icon: '� ', color: 'var(--gradient-purple)' },
        { id: 'url', label: 'URL Input', icon: '🔗', color: 'var(--gradient-orange)' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: 'var(--space-3) var(--space-2)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            background: activeTab === tab.id ? tab.color : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--gray-600)',
            fontWeight: activeTab === tab.id ? '600' : '500',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all var(--duration-200) var(--ease-out)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-1)',
            minHeight: '60px'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.background = 'var(--gray-100)'
              e.target.style.color = 'var(--gray-700)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.background = 'transparent'
              e.target.style.color = 'var(--gray-600)'
            }
          }}
        >
          <span style={{ fontSize: '18px' }}>{tab.icon}</span>
          <span style={{ fontSize: '12px', textAlign: 'center' }}>{tab.label}</span>
        </button>
      ))}
    </div>
  )

  const renderFileUpload = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `3px dashed ${isDragOver ? 'var(--primary)' : 'var(--gray-300)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-12)',
        textAlign: 'center',
        background: isDragOver ? 'var(--primary-light)' : 'var(--gray-50)',
        transition: 'all var(--duration-300) var(--ease-out)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => document.getElementById(`${activeTab}-input`).click()}
    >
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDragOver ? 'linear-gradient(45deg, transparent 30%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)' : 'none',
        animation: isDragOver ? 'slideInRight 2s ease-in-out infinite' : 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: isDragOver ? 'var(--gradient-primary)' : 'var(--gradient-info)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          fontSize: '32px',
          color: 'white',
          animation: isDragOver ? 'bounce 1s ease-in-out infinite' : 'none'
        }}>
          📄
        </div>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-3)'
        }}>
          {isDragOver ? 'Drop your document here!' : 'Upload Legal Document'}
        </h3>

        <p style={{
          fontSize: '16px',
          color: 'var(--gray-600)',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.6
        }}>
          Drag and drop your PDF, Word, Excel, or text file here, or click to browse
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)'
        }}>
          {['PDF', 'DOCX', 'TXT', 'XLSX', 'CSV'].map((format) => (
            <span
              key={format}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'white',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--gray-600)'
              }}
            >
              {format}
            </span>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ pointerEvents: 'none' }}
        >
          Choose File
        </button>

        <input
          id={`${activeTab}-input`}
          type="file"
          accept={
            activeTab === 'image' ? 'image/*' : 
            activeTab === 'multi' ? '.pdf,.doc,.docx,.txt,.xlsx,.xls,.csv' :
            '.pdf,.doc,.docx,.txt,.xlsx,.xls,.csv'
          }
          multiple={activeTab === 'multi'}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )

  const renderImageUpload = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `3px dashed ${isDragOver ? 'var(--accent-emerald)' : 'var(--gray-300)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-12)',
        textAlign: 'center',
        background: isDragOver ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-50)',
        transition: 'all var(--duration-300) var(--ease-out)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => document.getElementById(`${activeTab}-input`).click()}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: isDragOver ? 'var(--gradient-emerald)' : 'var(--gradient-emerald)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          fontSize: '32px',
          color: 'white',
          animation: isDragOver ? 'bounce 1s ease-in-out infinite' : 'none'
        }}>
          🖼️
        </div>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-3)'
        }}>
          {isDragOver ? 'Drop your image here!' : 'Upload Document Image'}
        </h3>

        <p style={{
          fontSize: '16px',
          color: 'var(--gray-600)',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.6
        }}>
          Upload screenshots, scanned documents, or photos of legal documents
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)'
        }}>
          {['JPG', 'PNG', 'GIF', 'WEBP'].map((format) => (
            <span
              key={format}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'white',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--gray-600)'
              }}
            >
              {format}
            </span>
          ))}
        </div>

        <button className="btn btn-success btn-lg" style={{ pointerEvents: 'none' }}>
          Choose Image
        </button>

        <input
          id={`${activeTab}-input`}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )

  const renderTextInput = () => (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-8)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--gradient-purple)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '32px',
          color: 'white'
        }}>
          📝
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Paste or Type Your Document
        </h3>
        <p style={{
          fontSize: '16px',
          color: 'var(--gray-600)'
        }}>
          Copy and paste your legal document text or type it directly
        </p>
      </div>

      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Paste your legal document text here or start typing...

Example:
TERMS OF SERVICE AGREEMENT

1. ACCEPTANCE OF TERMS
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement..."
        style={{
          width: '100%',
          minHeight: '300px',
          padding: 'var(--space-4)',
          border: '2px solid var(--gray-300)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          transition: 'all var(--duration-200) var(--ease-out)',
          background: 'var(--gray-50)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent-purple)'
          e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'
          e.target.style.background = 'white'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--gray-300)'
          e.target.style.boxShadow = 'none'
          e.target.style.background = 'var(--gray-50)'
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'var(--space-4)',
        padding: 'var(--space-3)',
        background: 'var(--gray-100)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '14px',
        color: 'var(--gray-600)'
      }}>
        <span>Characters: {textInput.length}</span>
        <span>Words: {textInput.trim() ? textInput.trim().split(/\s+/).length : 0}</span>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'var(--space-6)'
      }}>
        <button
          onClick={handleTextSubmit}
          disabled={!textInput.trim()}
          className="btn btn-purple btn-lg hover-lift"
          style={{
            background: 'var(--gradient-purple)',
            fontWeight: '700'
          }}
        >
          📝 Analyze Text
        </button>
      </div>
    </div>
  )





  const renderMultiDocumentUpload = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `3px dashed ${isDragOver ? 'var(--accent-cyan)' : 'var(--gray-300)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-12)',
        textAlign: 'center',
        background: isDragOver ? 'rgba(6, 182, 212, 0.1)' : 'var(--gray-50)',
        transition: 'all var(--duration-300) var(--ease-out)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => document.getElementById(`${activeTab}-input`).click()}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: isDragOver ? 'var(--gradient-info)' : 'var(--gradient-info)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          fontSize: '32px',
          color: 'white',
          animation: isDragOver ? 'bounce 1s ease-in-out infinite' : 'none'
        }}>
          ⚖️
        </div>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-3)'
        }}>
          {isDragOver ? 'Drop multiple documents here!' : 'Compare Multiple Documents'}
        </h3>

        <p style={{
          fontSize: '16px',
          color: 'var(--gray-600)',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.6
        }}>
          Upload 2-5 documents to compare terms, clauses, and identify differences
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
              📊 AI Comparison Features:
            </h4>
            <div className="space-y-1">
              {['Key differences analysis', 'Risk level comparison', 'Term variations'].map((feature, index) => (
                <div key={index} style={{ fontSize: '13px', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
              📋 Results Format:
            </h4>
            <div className="space-y-1">
              {['Side-by-side comparison', 'Tabulated key points', 'Actionable insights'].map((feature, index) => (
                <div key={index} style={{ fontSize: '13px', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-info btn-lg" style={{ pointerEvents: 'none' }}>
          Select Multiple Documents
        </button>

        <input
          id={`${activeTab}-input`}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )

  const renderUrlInput = () => (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-8)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--gradient-orange)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '32px',
          color: 'white'
        }}>
          🔗
        </div>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Analyze Document from URL
        </h3>
        <p style={{
          fontSize: '16px',
          color: 'var(--gray-600)'
        }}>
          Enter a URL to a publicly accessible legal document
        </p>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--gray-700)',
          marginBottom: 'var(--space-2)'
        }}>
          🌐 Document URL
        </label>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/terms-of-service.pdf"
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            border: '2px solid var(--gray-300)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '16px',
            outline: 'none',
            transition: 'all var(--duration-200) var(--ease-out)',
            background: 'var(--gray-50)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-orange)'
            e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'
            e.target.style.background = 'white'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--gray-300)'
            e.target.style.boxShadow = 'none'
            e.target.style.background = 'var(--gray-50)'
          }}
        />
      </div>

      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        marginBottom: 'var(--space-6)'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--gray-700)',
          marginBottom: 'var(--space-3)'
        }}>
          📋 Supported URL Types:
        </h4>
        <div className="space-y-2">
          {[
            '📄 Direct PDF links (.pdf)',
            '📝 Google Docs (public)',
            '🌐 Web pages with legal content',
            '📋 Online terms of service pages',
            '🔗 Document sharing platforms'
          ].map((item, index) => (
            <div key={index} style={{
              fontSize: '13px',
              color: 'var(--gray-600)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        textAlign: 'center'
      }}>
        <button
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
          className="btn btn-warning btn-lg hover-lift"
          style={{
            background: 'var(--gradient-orange)',
            fontWeight: '700'
          }}
        >
          🔗 Analyze URL
        </button>
      </div>
    </div>
  )

  const renderUploadArea = () => {
    switch (activeTab) {
      case 'image':
        return renderImageUpload()
      case 'multi':
        return renderMultiDocumentUpload()
      case 'text':
        return renderTextInput()
      case 'url':
        return renderUrlInput()
      default:
        return renderFileUpload()
    }
  }

  const getPreviewIcon = () => {
    switch (currentType) {
      case 'image': return '🖼️'
      case 'multi': return '⚖️'
      case 'text': return '📝'
      case 'url': return '🔗'
      default: return '�'
    }
  }

  const getPreviewColor = () => {
    switch (currentType) {
      case 'image': return 'var(--gradient-emerald)'
      case 'multi': return 'var(--gradient-info)'
      case 'text': return 'var(--gradient-purple)'
      case 'url': return 'var(--gradient-orange)'
      default: return 'var(--gradient-primary)'
    }
  }

  const getPreviewTitle = () => {
    switch (currentType) {
      case 'image': return selectedImage?.name || 'document-image.jpg'
      case 'multi': return `${multipleFiles.length} Documents for Comparison`
      case 'text': return 'Text Document'
      case 'url': return new URL(currentContent).hostname
      default: return selectedFile?.name || 'terms-of-service.pdf'
    }
  }

  const getPreviewSubtitle = () => {
    switch (currentType) {
      case 'image': return selectedImage ? `${(selectedImage.size / 1024).toFixed(1)} KB • Image ready for OCR analysis` : 'Image ready for OCR analysis'
      case 'multi': return `${multipleFiles.length} files • Ready for comparative analysis`
      case 'text': return `${currentContent.length} characters • ${currentContent.trim().split(/\s+/).length} words`
      case 'url': return `URL • Ready for web scraping analysis`
      default: return selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis` : '24.5 KB • Ready for analysis'
    }
  }

  const renderPreview = () => (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid var(--gray-200)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Content Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--gray-50)',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: getPreviewColor(),
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'white'
          }}>
            {getPreviewIcon()}
          </div>
          <div>
            <div style={{
              fontWeight: '600',
              color: 'var(--gray-900)',
              fontSize: '16px'
            }}>
              {getPreviewTitle()}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--gray-500)'
            }}>
              {getPreviewSubtitle()}
            </div>
          </div>
        </div>

        <button
          onClick={resetToUpload}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gray-500)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 'var(--space-2)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content Preview */}
      <div style={{
        padding: 'var(--space-6)',
        maxHeight: '400px',
        overflowY: 'auto',
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--gray-700)',
        background: 'var(--gray-50)'
      }}>
        {currentType === 'multi' ? (
          <div style={{
            padding: 'var(--space-4)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--space-6)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--gradient-info)',
                borderRadius: 'var(--radius-2xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '32px',
                color: 'white'
              }}>
                ⚖️
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: 'var(--space-2)'
              }}>
                Documents Ready for Comparison
              </h4>
              <p style={{
                color: 'var(--gray-600)',
                marginBottom: 'var(--space-4)'
              }}>
                AI will analyze and compare all documents, highlighting key differences
              </p>
            </div>
            
            <div className="space-y-3">
              {multipleFiles.map((file, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--gray-200)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: index === 0 ? 'var(--gradient-primary)' : 
                                index === 1 ? 'var(--gradient-emerald)' :
                                index === 2 ? 'var(--gradient-purple)' :
                                index === 3 ? 'var(--gradient-orange)' : 'var(--gradient-pink)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                    </div>
                  </div>
                  <div style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--gray-100)',
                    borderRadius: 'var(--radius)',
                    fontSize: '11px',
                    color: 'var(--gray-600)',
                    fontWeight: '500'
                  }}>
                    Doc {index + 1}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'rgba(6, 182, 212, 0.1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--accent-cyan)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '500' }}>
                🔍 AI will compare these documents and provide:
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--gray-600)', 
                marginTop: 'var(--space-2)',
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                flexWrap: 'wrap'
              }}>
                <span>• Key Differences</span>
                <span>• Risk Comparison</span>
                <span>• Tabulated Results</span>
              </div>
            </div>
          </div>
        ) : currentType === 'image' ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'var(--gradient-emerald)',
              borderRadius: 'var(--radius-2xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              fontSize: '48px',
              color: 'white'
            }}>
              🖼️
            </div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-2)'
            }}>
              Image Ready for OCR Analysis
            </h4>
            <p style={{
              color: 'var(--gray-600)',
              marginBottom: 'var(--space-4)'
            }}>
              Our AI will extract text from your image using advanced OCR technology
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--gray-500)'
            }}>
              <span>✓ Text Recognition</span>
              <span>✓ Layout Detection</span>
              <span>✓ Multi-language Support</span>
            </div>
          </div>
        ) : currentType === 'url' ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'var(--gradient-orange)',
              borderRadius: 'var(--radius-2xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              fontSize: '48px',
              color: 'white'
            }}>
              🔗
            </div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-2)'
            }}>
              URL Ready for Web Analysis
            </h4>
            <p style={{
              color: 'var(--gray-600)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              background: 'white',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-200)'
            }}>
              {currentContent}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'var(--gray-500)'
            }}>
              <span>✓ Web Scraping</span>
              <span>✓ Content Extraction</span>
              <span>✓ Link Analysis</span>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            {(currentType === 'text' ? currentContent : mockDocumentContent).split('\n').map((line, index) => (
              <div
                key={index}
                style={{
                  marginBottom: line.trim() === '' ? 'var(--space-4)' : 'var(--space-2)',
                  padding: line.includes('TERMINATION') || line.includes('LIABILITY') ? 
                    'var(--space-2) var(--space-3)' : '0',
                  background: line.includes('TERMINATION') || line.includes('LIABILITY') ? 
                    'rgba(239, 68, 68, 0.1)' : 'transparent',
                  borderLeft: line.includes('TERMINATION') || line.includes('LIABILITY') ? 
                    '3px solid var(--accent-red)' : 'none',
                  borderRadius: line.includes('TERMINATION') || line.includes('LIABILITY') ? 
                    'var(--radius)' : '0',
                  fontWeight: line.includes('.') && line.length < 50 ? '600' : '400'
                }}
              >
                {line || '\u00A0'}
                {(line.includes('TERMINATION') || line.includes('LIABILITY')) && (
                  <span style={{
                    marginLeft: 'var(--space-2)',
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--accent-red)',
                    color: 'white',
                    borderRadius: 'var(--radius)',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    HIGH RISK
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: 'var(--space-6)',
        background: 'white',
        borderTop: '1px solid var(--gray-200)',
        display: 'flex',
        gap: 'var(--space-3)',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleAnalyze}
          className="btn btn-primary btn-xl hover-lift"
          style={{
            background: 'var(--gradient-rainbow)',
            fontWeight: '700'
          }}
        >
          🚀 Analyze with AI
        </button>
        <button
          onClick={resetToUpload}
          className="btn btn-secondary btn-lg"
        >
          Choose Different {
            currentType === 'image' ? 'Image' : 
            currentType === 'multi' ? 'Documents' :
            currentType === 'text' ? 'Text' : 
            currentType === 'url' ? 'URL' : 'File'
          }
        </button>
      </div>
    </div>
  )

  return (
    <div className="content-section" style={{
      maxWidth: '900px',
      margin: '0 auto var(--space-8)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--space-8)'
      }}>
        <div style={{
          width: '96px',
          height: '96px',
          background: 'var(--gradient-rainbow)',
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          fontSize: '40px',
          color: 'white',
          boxShadow: 'var(--shadow-lg)',
          animation: 'float 3s ease-in-out infinite'
        }}>
          📄
        </div>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--gray-900)',
          marginBottom: 'var(--space-2)'
        }}>
          Smart Document Analysis
        </h2>
        <p style={{
          color: 'var(--gray-600)',
          fontSize: '18px',
          lineHeight: '1.6',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Upload documents, compare multiple files, or enter text/URLs to get instant AI-powered analysis. 
          Identify risks, simplify complex clauses, and get tabulated comparison results in real-time.
        </p>
      </div>

      {previewMode === 'upload' && (
        <>
          {renderTabNavigation()}
          {renderUploadArea()}
        </>
      )}
      {previewMode === 'preview' && renderPreview()}

      {/* Format Error Popup */}
      {showFormatError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--gradient-danger)',
          color: 'white',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              ⚠️
            </div>
            <div>
              <div style={{
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: 'var(--space-1)'
              }}>
                Invalid File Format
              </div>
              <div style={{
                fontSize: '13px',
                opacity: 0.9,
                lineHeight: 1.4
              }}>
                {formatErrorMessage}
              </div>
            </div>
            <button
              onClick={() => setShowFormatError(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: 'var(--space-1)',
                marginLeft: 'auto'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentPreview