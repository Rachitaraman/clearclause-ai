import { useState } from 'react'
import '../../styles/theme.css'
import '../../styles/animations.css'

const DocumentPreview = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('file') // file, image, text, url
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [previewMode, setPreviewMode] = useState('upload') // upload, preview, analyzing
  const [currentContent, setCurrentContent] = useState(null)
  const [currentType, setCurrentType] = useState(null)

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

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (activeTab === 'image') {
        handleImageSelect(file)
      } else {
        handleFileSelect(file)
      }
    }
  }

  const handleAnalyze = () => {
    setPreviewMode('analyzing')
    onAnalyze()
  }

  const resetToUpload = () => {
    setPreviewMode('upload')
    setCurrentContent(null)
    setCurrentType(null)
    setSelectedFile(null)
    setSelectedImage(null)
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
      display: 'flex',
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-2)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 'var(--space-6)',
      gap: 'var(--space-1)'
    }}>
      {[
        { id: 'file', label: 'File Upload', icon: '📄', color: 'var(--gradient-primary)' },
        { id: 'image', label: 'Image Upload', icon: '🖼️', color: 'var(--gradient-emerald)' },
        { id: 'text', label: 'Text Input', icon: '📝', color: 'var(--gradient-purple)' },
        { id: 'url', label: 'URL Input', icon: '🔗', color: 'var(--gradient-orange)' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            background: activeTab === tab.id ? tab.color : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--gray-600)',
            fontWeight: activeTab === tab.id ? '600' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all var(--duration-200) var(--ease-out)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)'
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
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
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
          Drag and drop your PDF, Word, or text file here, or click to browse
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-6)'
        }}>
          {['PDF', 'DOCX', 'TXT', 'RTF'].map((format) => (
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
          accept={activeTab === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt,.rtf'}
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
      case 'text': return '📝'
      case 'url': return '🔗'
      default: return '📄'
    }
  }

  const getPreviewColor = () => {
    switch (currentType) {
      case 'image': return 'var(--gradient-emerald)'
      case 'text': return 'var(--gradient-purple)'
      case 'url': return 'var(--gradient-orange)'
      default: return 'var(--gradient-primary)'
    }
  }

  const getPreviewTitle = () => {
    switch (currentType) {
      case 'image': return selectedImage?.name || 'document-image.jpg'
      case 'text': return 'Text Document'
      case 'url': return new URL(currentContent).hostname
      default: return selectedFile?.name || 'terms-of-service.pdf'
    }
  }

  const getPreviewSubtitle = () => {
    switch (currentType) {
      case 'image': return selectedImage ? `${(selectedImage.size / 1024).toFixed(1)} KB • Image ready for OCR analysis` : 'Image ready for OCR analysis'
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
        {currentType === 'image' ? (
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
          Choose Different {currentType === 'image' ? 'Image' : currentType === 'text' ? 'Text' : currentType === 'url' ? 'URL' : 'File'}
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
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Upload your legal document and watch our AI identify risks, 
          simplify complex clauses, and provide actionable insights in real-time.
        </p>
      </div>

      {previewMode === 'upload' && (
        <>
          {renderTabNavigation()}
          {renderUploadArea()}
        </>
      )}
      {previewMode === 'preview' && renderPreview()}
    </div>
  )
}

export default DocumentPreview