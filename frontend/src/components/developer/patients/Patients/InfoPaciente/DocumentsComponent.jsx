import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile, faFileAlt, faFilePdf, faFileImage, faFileArchive, 
  faFileExcel, faFilePowerpoint, faFileWord, faFileCode,
  faDownload, faTrashAlt, faEye, faPlus, faUpload, faSearch,
  faTimes, faCheck, faInfoCircle, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../../../../../styles/developer/Patients/InfoPaciente/DocumentsComponent.scss';

const DocumentsComponent = ({ patient, onUpdateDocuments }) => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const fileInputRef = useRef(null);
  
  // Document categories
  const categories = [
    'All',
    'Medical Reports',
    'Assessments',
    'Progress Notes',
    'Insurance',
    'Prescriptions',
    'Discharge Forms',
    'Other'
  ];

  // Fetch documents data when component mounts
  useEffect(() => {
    if (patient?.documents) {
      setDocuments(patient.documents || []);
    } else {
      // Mock data for demonstration purposes
      const mockDocuments = [
        {
          id: 1,
          name: 'Evaluation Report.pdf',
          type: 'pdf',
          size: 2456000,
          category: 'Medical Reports',
          uploadedBy: 'Dr. Michael Chen',
          uploadDate: '2025-02-15T14:30:00',
          description: 'Initial evaluation report by PT',
          url: '/documents/eval-report.pdf'
        },
        {
          id: 2,
          name: 'Insurance Approval.pdf',
          type: 'pdf',
          size: 1240000,
          category: 'Insurance',
          uploadedBy: 'Admin Staff',
          uploadDate: '2025-02-10T09:15:00',
          description: 'Insurance approval for therapy sessions',
          url: '/documents/insurance-approval.pdf'
        },
        {
          id: 3,
          name: 'Progress Notes - Week 1.docx',
          type: 'docx',
          size: 350000,
          category: 'Progress Notes',
          uploadedBy: 'Dr. Michael Chen',
          uploadDate: '2025-02-20T16:45:00',
          description: 'Weekly progress notes after first week of therapy',
          url: '/documents/progress-notes-w1.docx'
        },
        {
          id: 4,
          name: 'Exercise Program.jpg',
          type: 'jpg',
          size: 1750000,
          category: 'Assessments',
          uploadedBy: 'Maria Gonzalez',
          uploadDate: '2025-02-25T10:20:00',
          description: 'Custom exercise program illustration',
          url: '/documents/exercise-program.jpg'
        }
      ];
      
      setDocuments(mockDocuments);
    }
  }, [patient]);

  const getFileIcon = (fileType) => {
    switch(fileType.toLowerCase()) {
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="file-icon pdf" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FontAwesomeIcon icon={faFileImage} className="file-icon image" />;
      case 'doc':
      case 'docx':
        return <FontAwesomeIcon icon={faFileWord} className="file-icon word" />;
      case 'xls':
      case 'xlsx':
        return <FontAwesomeIcon icon={faFileExcel} className="file-icon excel" />;
      case 'ppt':
      case 'pptx':
        return <FontAwesomeIcon icon={faFilePowerpoint} className="file-icon powerpoint" />;
      case 'zip':
      case 'rar':
        return <FontAwesomeIcon icon={faFileArchive} className="file-icon archive" />;
      case 'js':
      case 'html':
      case 'css':
      case 'json':
        return <FontAwesomeIcon icon={faFileCode} className="file-icon code" />;
      default:
        return <FontAwesomeIcon icon={faFileAlt} className="file-icon default" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelected = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    // Start upload simulation
    handleFileUpload(files[0]);
  };

  const handleFileUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Add new document to list after upload completes
            const newDocument = {
              id: documents.length + 1,
              name: file.name,
              type: file.name.split('.').pop(),
              size: file.size,
              category: 'Other', // Default category that can be changed later
              uploadedBy: 'Current User', // In a real app, get from auth context
              uploadDate: new Date().toISOString(),
              description: '',
              url: URL.createObjectURL(file) // This is temporary and would be a server URL in production
            };
            
            setDocuments(prevDocs => [...prevDocs, newDocument]);
            setIsUploading(false);
            
            // Notify parent component
            if (onUpdateDocuments) {
              onUpdateDocuments([...documents, newDocument]);
            }
          }, 500);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 100);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (document) => {
    setSelectedDocument(document);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedDocuments = documents.filter(doc => doc.id !== selectedDocument.id);
    setDocuments(updatedDocuments);
    setIsDeleteModalOpen(false);
    
    // Notify parent component
    if (onUpdateDocuments) {
      onUpdateDocuments(updatedDocuments);
    }
  };

  const handleDownload = (document) => {
    // In a real app, this would be a proper download link
    const link = document.url;
    window.open(link, '_blank');
  };

  const filterDocuments = () => {
    let filteredDocs = [...documents];
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      filteredDocs = filteredDocs.filter(doc => doc.category === categoryFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.name.toLowerCase().includes(term) || 
        doc.description.toLowerCase().includes(term) ||
        doc.uploadedBy.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filteredDocs.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredDocs;
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredDocuments = filterDocuments();

  return (
    <div className="documents-component">
      <div className="documents-header">
        <div className="header-icon">
          <FontAwesomeIcon icon={faFile} />
        </div>
        <h2 className="header-title">Patient Documents</h2>
        <div className="header-actions">
          <button className="action-button upload-btn" onClick={handleFileUploadClick}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload Document</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelected}
          />
        </div>
      </div>
      
      <div className="documents-toolbar">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <div className="sort-container">
            <label>Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            <button className="sort-order-btn" onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {isUploading && (
        <div className="upload-progress-container">
          <div className="upload-info">
            <FontAwesomeIcon icon={faUpload} className="upload-icon pulse" />
            <div className="upload-details">
              <div className="upload-title">Uploading document...</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress}% Complete</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="documents-list">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(document => (
            <div className="document-card" key={document.id}>
              <div className="document-icon">
                {getFileIcon(document.type)}
              </div>
              <div className="document-details">
                <div className="document-name">{document.name}</div>
                <div className="document-meta">
                  <span className="document-category">{document.category}</span>
                  <span className="document-size">{formatFileSize(document.size)}</span>
                  <span className="document-date">{formatDate(document.uploadDate)}</span>
                </div>
                <div className="document-uploader">
                  <span>Uploaded by: </span>
                  <strong>{document.uploadedBy}</strong>
                </div>
                {document.description && (
                  <div className="document-description">{document.description}</div>
                )}
              </div>
              <div className="document-actions">
                <button 
                  className="action-btn view-btn" 
                  onClick={() => handleViewDocument(document)}
                  title="View Document"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button 
                  className="action-btn download-btn" 
                  onClick={() => handleDownload(document)}
                  title="Download Document"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteClick(document)}
                  title="Delete Document"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-documents">
            <FontAwesomeIcon icon={faFile} className="no-documents-icon" />
            <p className="no-documents-text">No documents found</p>
            <button className="upload-document-btn" onClick={handleFileUploadClick}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Upload New Document</span>
            </button>
          </div>
        )}
      </div>
      
      {/* View Document Modal */}
      {isViewModalOpen && selectedDocument && (
        <div className="modal-overlay">
          <div className="document-view-modal">
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsViewModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="document-preview">
                {selectedDocument.type === 'pdf' ? (
                  <iframe 
                    src={selectedDocument.url} 
                    title={selectedDocument.name} 
                    width="100%" 
                    height="500px"
                  />
                ) : selectedDocument.type.match(/jpe?g|png|gif/i) ? (
                  <img 
                    src={selectedDocument.url} 
                    alt={selectedDocument.name} 
                    className="preview-image" 
                  />
                ) : (
                  <div className="no-preview">
                    <FontAwesomeIcon icon={faFile} className="no-preview-icon" />
                    <p>Preview not available for this file type</p>
                    <button 
                      className="download-btn"
                      onClick={() => handleDownload(selectedDocument)}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      <span>Download to View</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="document-info">
                <div className="info-row">
                  <div className="info-label">File Type:</div>
                  <div className="info-value">{selectedDocument.type.toUpperCase()}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Size:</div>
                  <div className="info-value">{formatFileSize(selectedDocument.size)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Category:</div>
                  <div className="info-value">{selectedDocument.category}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Uploaded By:</div>
                  <div className="info-value">{selectedDocument.uploadedBy}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Upload Date:</div>
                  <div className="info-value">{formatDate(selectedDocument.uploadDate)}</div>
                </div>
                {selectedDocument.description && (
                  <div className="info-row">
                    <div className="info-label">Description:</div>
                    <div className="info-value description">{selectedDocument.description}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
              <button 
                className="modal-btn download-btn"
                onClick={() => handleDownload(selectedDocument)}
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedDocument && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <FontAwesomeIcon icon={faTrashAlt} className="delete-icon" />
              <h3>Delete Document</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedDocument.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete-btn"
                onClick={handleConfirmDelete}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsComponent;