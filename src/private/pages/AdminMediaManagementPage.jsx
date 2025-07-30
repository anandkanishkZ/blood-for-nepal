import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Settings, Database, Shield, Bell, Globe, 
  FolderOpen, Upload, Trash2, Download, Copy, 
  Image, FileText, File, RefreshCw, Search,
  Grid, List, X, Info, Edit, Check, UploadCloud,
  Filter, Calendar, HardDrive, Maximize, Minimize,
  CheckCircle, AlertTriangle, Eye, XCircle
} from 'lucide-react';
import AdminSidebar from '../AdminSidebar';
import apiClient from '../../utils/api';
import { showToast } from '../../utils/toast';

const MediaManagementComponent = () => {
  const [media, setMedia] = useState([]);
  const [groupedMedia, setGroupedMedia] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, totalSize: '0 Bytes' });

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, []);

  // Fetch media from API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get('/admin/media');
      
      if (data.success) {
        setMedia(data.data.files);
        setGroupedMedia(data.data.grouped);
        setStats({
          total: data.data.total,
          totalSize: data.data.totalSize
        });
      } else {
        throw new Error(data.message || 'Failed to fetch media');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch media';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete media file
  const handleDeleteMedia = async (filepath) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }
    
    try {
      const filePathWithoutLeadingSlash = filepath.startsWith('/') ? filepath.substring(1) : filepath;
      const encodedPath = encodeURIComponent(filePathWithoutLeadingSlash.replace('/uploads/', ''));
      
      const data = await apiClient.delete(`/admin/media/${encodedPath}`);
      
      if (data.success) {
        showToast.success('File deleted successfully');
        fetchMedia(); // Refresh the media list
        if (selectedMedia?.path === filepath) {
          setSelectedMedia(null);
        }
      } else {
        throw new Error(data.message || 'Failed to delete file');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete file';
      showToast.error(errorMessage);
    }
  };

  // Copy file URL to clipboard
  const copyToClipboard = async (url) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      const fullUrl = `${baseUrl}${url}`;
      
      await navigator.clipboard.writeText(fullUrl);
      showToast.success('URL copied to clipboard');
    } catch (err) {
      showToast.error('Failed to copy URL to clipboard');
    }
  };
  
  // Handle folder change
  const handleFolderChange = (folderName) => {
    setCurrentFolder(folderName);
    setSelectedMedia(null);
    setIsModalOpen(false);
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedMedia(file);
    setIsModalOpen(true);
  };
  
  // Filter media by search term
  const filteredMedia = media.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get current folder's media files
  const currentFolderMedia = currentFolder === 'all' 
    ? filteredMedia 
    : filteredMedia.filter(file => {
        const dirPath = file.path.split('/').slice(0, -1).join('/').replace(/^\/uploads\/?/, '') || 'root';
        return dirPath === currentFolder;
      });
  
  // Get unique folders for navigation
  const folders = Object.keys(groupedMedia).sort();
  
  // Determine file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FolderOpen className="w-5 h-5 mr-2" />
        Media Management
      </h3>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMedia} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh media list"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 ${viewType === 'grid' ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-2 ${viewType === 'list' ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {stats.total} file(s) • {stats.totalSize}
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => handleFolderChange('all')}
          className={`px-3 py-1 text-sm rounded-full ${currentFolder === 'all' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          All Files
        </button>
        
        {folders.map(folder => (
          <button 
            key={folder}
            onClick={() => handleFolderChange(folder)}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${currentFolder === folder ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            {folder}
            {groupedMedia[folder] && (
              <span className="ml-1 text-xs">{groupedMedia[folder].length}</span>
            )}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading media...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : currentFolderMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm ? 'No files matching your search' : 'No files in this folder'}
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {currentFolderMedia.map(file => (
            <div 
              key={file.path} 
              className={`border rounded-md overflow-hidden flex flex-col cursor-pointer hover:border-red-300 dark:hover:border-red-700 ${selectedMedia?.path === file.path ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500' : 'border-gray-200 dark:border-gray-700'}`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="h-24 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png' ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${file.path.startsWith('/') ? file.path : '/' + file.path}`} 
                    alt={file.name} 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZS1vZmYiPjxsaW5lIHgxPSIyIiB5MT0iMiIgeDI9IjIyIiB5Mj0iMjIiLz48cGF0aCBkPSJNMTAuNSA3LjVhMi41IDIuNSAwIDEgMC01IDB2OS04LjVhMi41IDIuNSAwIDAgMSA1IDB2OEwxOS41IDE2di04YTIuNSAyLjUgMCAwIDEgNSAwdjQuNSIvPjxwYXRoIGQ9Ik03IDdoMG0xMCAxMGgwIi8+PC9zdmc+';
                      console.log('Image failed to load:', file.path);
                    }}
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {file.sizeFormatted}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="overflow-x-auto w-full">
            <div className="min-w-max">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Size
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Modified
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentFolderMedia.map(file => (
                <tr 
                  key={file.path}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${selectedMedia?.path === file.path ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                        {file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png' ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${file.path.startsWith('/') ? file.path : '/' + file.path}`} 
                            alt={file.name} 
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZS1vZmYiPjxsaW5lIHgxPSIyIiB5MT0iMiIgeDI9IjIyIiB5Mj0iMjIiLz48cGF0aCBkPSJNMTAuNSA3LjVhMi41IDIuNSAwIDEgMC01IDB2OS04LjVhMi41IDIuNSAwIDAgMSA1IDB2OEwxOS41IDE2di04YTIuNSAyLjUgMCAwIDEgNSAwdjQuNSIvPjxwYXRoIGQ9Ik03IDdoMG0xMCAxMGgwIi8+PC9zdmc+';
                              console.log('Image failed to load:', file.path);
                            }}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {file.path}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {file.sizeFormatted}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(file.modified).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => copyToClipboard(file.path)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        title="Copy URL to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a 
                        href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${file.path.startsWith('/') ? file.path : '/' + file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a 
                        href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${file.path.startsWith('/') ? file.path : '/' + file.path}`}
                        download={file.name}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDeleteMedia(file.path)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </div>
        </div>
      )}
      
      {/* File details modal */}
      {isModalOpen && selectedMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  File Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                        {selectedMedia.type === 'jpg' || selectedMedia.type === 'jpeg' || selectedMedia.type === 'png' ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${selectedMedia.path.startsWith('/') ? selectedMedia.path : '/' + selectedMedia.path}`} 
                            alt={selectedMedia.name} 
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZS1vZmYiPjxsaW5lIHgxPSIyIiB5MT0iMiIgeDI9IjIyIiB5Mj0iMjIiLz48cGF0aCBkPSJNMTAuNSA3LjVhMi41IDIuNSAwIDEgMC01IDB2OS04LjVhMi41IDIuNSAwIDAgMSA1IDB2OEwxOS41IDE2di04YTIuNSAyLjUgMCAwIDEgNSAwdjQuNSIvPjxwYXRoIGQ9Ik03IDdoMG0xMCAxMGgwIi8+PC9zdmc+';
                              console.log('Detail image failed to load:', selectedMedia.path);
                            }}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">
                            {getFileIcon(selectedMedia.type)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          {selectedMedia.name}
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Type:</span> {selectedMedia.type.toUpperCase()} file
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Size:</span> {selectedMedia.sizeFormatted}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Created:</span> {new Date(selectedMedia.created).toLocaleString()}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Modified:</span> {new Date(selectedMedia.modified).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      File URL
                    </h5>
                    <div className="relative mb-4">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${selectedMedia.path}`}
                        className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button 
                        onClick={() => copyToClipboard(selectedMedia.path)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        title="Copy URL to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${selectedMedia.path.startsWith('/') ? selectedMedia.path : '/' + selectedMedia.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </a>
                      <a 
                        href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${selectedMedia.path.startsWith('/') ? selectedMedia.path : '/' + selectedMedia.path}`}
                        download={selectedMedia.name}
                        className="px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1.5" /> Download
                      </a>
                      <button 
                        onClick={() => {
                          handleDeleteMedia(selectedMedia.path);
                          setIsModalOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminMediaManagementPage = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('media');

  // Handle URL query parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const tabs = [
    {
      id: 'media',
      label: 'Media Files',
      icon: <FolderOpen className="w-5 h-5" />,
    }
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'media':
        return <MediaManagementComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Media Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all uploaded media files in one place
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                Media
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span className="ml-3">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="lg:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminMediaManagementPage;
