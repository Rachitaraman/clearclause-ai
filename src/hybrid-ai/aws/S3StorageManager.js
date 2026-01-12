/**
 * S3 Storage Manager for Hybrid AWS-Gemini AI System
 * Manages document storage, retrieval, and metadata in AWS S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectVersionsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class S3StorageManager {
  constructor(credentialManager) {
    this.credentialManager = credentialManager;
    this.s3Client = null;
    this.bucket = null;
    this.auditTrail = new Map();
  }

  /**
   * Initialize S3 client with credentials
   * @returns {Promise<boolean>} - True if initialization successful
   */
  async initialize() {
    try {
      if (!this.credentialManager.isAWSValid()) {
        throw new Error('AWS credentials are not valid');
      }

      const credentials = this.credentialManager.getAWSCredentials();
      
      this.s3Client = new S3Client({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        }
      });

      this.bucket = credentials.s3Bucket;
      return true;
    } catch (error) {
      console.error('S3StorageManager initialization failed:', error);
      return false;
    }
  }

  /**
   * Upload document to S3 with unique identifier and metadata
   * @param {File|Buffer} file - Document file to upload
   * @param {Object} metadata - Document metadata
   * @returns {Promise<Object>} - Upload result with S3 location and document ID
   */
  async uploadDocument(file, metadata = {}) {
    try {
      if (!this.s3Client) {
        await this.initialize();
      }

      // Generate unique document ID
      const documentId = generateUUID();
      const timestamp = new Date().toISOString();
      
      // Create S3 key with organized structure
      const s3Key = `documents/${timestamp.split('T')[0]}/${documentId}/${metadata.filename || 'document'}`;
      
      // Prepare document metadata for S3
      const s3Metadata = {
        'document-id': documentId,
        'upload-timestamp': timestamp,
        'original-filename': metadata.filename || 'unknown',
        'document-type': metadata.type || 'unknown',
        'file-size': (file.size || file.length || 0).toString(),
        'content-type': metadata.contentType || 'application/octet-stream'
      };

      // Add optional metadata
      if (metadata.pages) s3Metadata['page-count'] = metadata.pages.toString();
      if (metadata.language) s3Metadata['language'] = metadata.language;
      if (metadata.userId) s3Metadata['user-id'] = metadata.userId;

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file,
        Metadata: s3Metadata,
        ContentType: metadata.contentType || 'application/octet-stream',
        ServerSideEncryption: 'AES256'
      });

      const uploadResult = await this.s3Client.send(uploadCommand);

      // Create S3 location object
      const s3Location = {
        bucket: this.bucket,
        key: s3Key,
        region: this.credentialManager.getAWSCredentials().region,
        etag: uploadResult.ETag,
        versionId: uploadResult.VersionId
      };

      // Record audit trail
      this.auditTrail.set(documentId, {
        documentId,
        s3Location,
        uploadTimestamp: new Date(timestamp),
        metadata: s3Metadata,
        operations: [{
          operation: 'upload',
          timestamp: new Date(),
          success: true,
          details: { etag: uploadResult.ETag }
        }]
      });

      return {
        success: true,
        documentId,
        s3Location,
        uploadTimestamp: timestamp,
        metadata: s3Metadata
      };

    } catch (error) {
      console.error('Document upload failed:', error);
      return {
        success: false,
        error: error.message,
        documentId: null,
        s3Location: null
      };
    }
  }

  /**
   * Generate secure access URL for stored document
   * @param {string} documentId - Document identifier
   * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
   * @returns {Promise<Object>} - Secure URL result
   */
  async getDocumentUrl(documentId, expiresIn = 3600) {
    try {
      if (!this.s3Client) {
        await this.initialize();
      }

      const auditEntry = this.auditTrail.get(documentId);
      if (!auditEntry) {
        throw new Error(`Document ${documentId} not found in audit trail`);
      }

      const { s3Location } = auditEntry;

      // Create signed URL
      const getCommand = new GetObjectCommand({
        Bucket: s3Location.bucket,
        Key: s3Location.key
      });

      const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn });

      // Update audit trail
      auditEntry.operations.push({
        operation: 'get_url',
        timestamp: new Date(),
        success: true,
        details: { expiresIn, urlGenerated: true }
      });

      return {
        success: true,
        documentId,
        signedUrl,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      };

    } catch (error) {
      console.error('URL generation failed:', error);
      return {
        success: false,
        error: error.message,
        documentId,
        signedUrl: null
      };
    }
  }

  /**
   * Retrieve document content with access controls
   * @param {string} documentId - Document identifier
   * @param {Object} accessContext - Access control context
   * @returns {Promise<Object>} - Document content and metadata
   */
  async getDocumentContent(documentId, accessContext = {}) {
    try {
      if (!this.s3Client) {
        await this.initialize();
      }

      const auditEntry = this.auditTrail.get(documentId);
      if (!auditEntry) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Apply access controls
      if (!this.checkAccess(documentId, accessContext)) {
        throw new Error('Access denied to document');
      }

      const { s3Location } = auditEntry;

      // Retrieve document from S3
      const getCommand = new GetObjectCommand({
        Bucket: s3Location.bucket,
        Key: s3Location.key
      });

      const response = await this.s3Client.send(getCommand);

      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      const content = Buffer.concat(chunks);

      // Update audit trail
      auditEntry.operations.push({
        operation: 'retrieve',
        timestamp: new Date(),
        success: true,
        details: { 
          contentLength: content.length,
          accessContext: accessContext.userId || 'anonymous'
        }
      });

      return {
        success: true,
        documentId,
        content,
        contentType: response.ContentType,
        metadata: response.Metadata,
        lastModified: response.LastModified,
        etag: response.ETag
      };

    } catch (error) {
      console.error('Document retrieval failed:', error);
      
      // Update audit trail with failure
      const auditEntry = this.auditTrail.get(documentId);
      if (auditEntry) {
        auditEntry.operations.push({
          operation: 'retrieve',
          timestamp: new Date(),
          success: false,
          details: { error: error.message }
        });
      }

      return {
        success: false,
        error: error.message,
        documentId,
        content: null
      };
    }
  }

  /**
   * Check access permissions for document
   * @param {string} documentId - Document identifier
   * @param {Object} accessContext - Access control context
   * @returns {boolean} - True if access is allowed
   */
  checkAccess(documentId, accessContext) {
    const auditEntry = this.auditTrail.get(documentId);
    if (!auditEntry) return false;

    // Basic access control - can be extended
    if (accessContext.userId && auditEntry.metadata['user-id']) {
      return accessContext.userId === auditEntry.metadata['user-id'];
    }

    // Allow access if no specific user restrictions
    return true;
  }

  /**
   * Handle storage operation failures with retry mechanisms
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} baseDelay - Base delay between retries in ms
   * @returns {Promise<any>} - Operation result
   */
  async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Operation failed, retrying (${attempt}/${maxRetries}):`, error.message);
      }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Maintain document versioning and audit trails
   * @param {string} documentId - Document identifier
   * @returns {Promise<Object>} - Version history
   */
  async getDocumentVersions(documentId) {
    try {
      if (!this.s3Client) {
        await this.initialize();
      }

      const auditEntry = this.auditTrail.get(documentId);
      if (!auditEntry) {
        throw new Error(`Document ${documentId} not found`);
      }

      const { s3Location } = auditEntry;

      // List object versions
      const listCommand = new ListObjectVersionsCommand({
        Bucket: s3Location.bucket,
        Prefix: s3Location.key
      });

      const response = await this.s3Client.send(listCommand);

      const versions = response.Versions?.map(version => ({
        versionId: version.VersionId,
        lastModified: version.LastModified,
        etag: version.ETag,
        size: version.Size,
        isLatest: version.IsLatest
      })) || [];

      return {
        success: true,
        documentId,
        versions,
        auditTrail: auditEntry.operations
      };

    } catch (error) {
      console.error('Version retrieval failed:', error);
      return {
        success: false,
        error: error.message,
        documentId,
        versions: []
      };
    }
  }

  /**
   * Delete document and clean up resources
   * @param {string} documentId - Document identifier
   * @param {Object} deleteContext - Deletion context
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDocument(documentId, deleteContext = {}) {
    try {
      if (!this.s3Client) {
        await this.initialize();
      }

      const auditEntry = this.auditTrail.get(documentId);
      if (!auditEntry) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Check delete permissions
      if (!this.checkAccess(documentId, deleteContext)) {
        throw new Error('Access denied for document deletion');
      }

      const { s3Location } = auditEntry;

      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: s3Location.bucket,
        Key: s3Location.key,
        VersionId: s3Location.versionId
      });

      await this.s3Client.send(deleteCommand);

      // Update audit trail
      auditEntry.operations.push({
        operation: 'delete',
        timestamp: new Date(),
        success: true,
        details: { 
          deletedBy: deleteContext.userId || 'system',
          reason: deleteContext.reason || 'user_request'
        }
      });

      return {
        success: true,
        documentId,
        deletedAt: new Date(),
        auditTrail: auditEntry.operations
      };

    } catch (error) {
      console.error('Document deletion failed:', error);
      return {
        success: false,
        error: error.message,
        documentId
      };
    }
  }

  /**
   * Get comprehensive audit trail for a document
   * @param {string} documentId - Document identifier
   * @returns {Object} - Audit trail information
   */
  getAuditTrail(documentId) {
    const auditEntry = this.auditTrail.get(documentId);
    if (!auditEntry) {
      return {
        found: false,
        documentId,
        message: 'Document not found in audit trail'
      };
    }

    return {
      found: true,
      documentId,
      uploadTimestamp: auditEntry.uploadTimestamp,
      s3Location: auditEntry.s3Location,
      metadata: auditEntry.metadata,
      operations: auditEntry.operations,
      totalOperations: auditEntry.operations.length,
      lastOperation: auditEntry.operations[auditEntry.operations.length - 1]
    };
  }
}