'use client'

import React, { useState, useCallback, useEffect } from 'react';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode based on user preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileName = droppedFile.name;
      
      // Check if file has .html extension
      if (fileName.toLowerCase().endsWith('.html')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid .html file.');
      }
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name;
      
      if (fileName.toLowerCase().endsWith('.html')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a valid .html file.');
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return alert("No file selected");
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/web', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (res.ok) {
        // Now we directly use the URL from Vercel Blob
        setShareLink(data.link);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      setUploading(false);
      console.error('Upload error:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  // Handle copy link
  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <div className="w-full max-w-md mb-6 flex justify-end">
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-300 text-gray-800'
          }`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <h1 className={`text-2xl font-bold mb-6 ${
        darkMode ? 'text-white' : 'text-gray-800'
      }`}>
        HTML File Uploader
      </h1>
      
      <div
        onClick={() => document.getElementById('fileInput')?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`w-full max-w-md h-40 border-4 cursor-pointer transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' 
            : `border-dashed ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-400 bg-white'}`
        } flex items-center justify-center rounded-lg p-4`}
      >
        {file ? (
          <div className="text-center">
            <span className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{file.name}</span>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Click to select a different file
            </p>
          </div>
        ) : (
          <div className="text-center">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Drag & drop your .html file here or click to select
            </span>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Only .html files are accepted
            </p>
          </div>
        )}
      </div>
      
      <input
        id="fileInput"
        type="file"
        accept=".html"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`mt-6 px-6 py-2 rounded font-medium transition-colors ${
          darkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-900 disabled:text-gray-400' 
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
        } disabled:cursor-not-allowed`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {shareLink && (
        <div className={`mt-8 p-4 rounded-lg text-center ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <p className={darkMode ? 'text-green-400 font-medium' : 'text-green-600 font-medium'}>
            File uploaded successfully!
          </p>
          
          <a
            href={shareLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`block mt-2 break-all ${
              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {shareLink}
          </a>
          
          <button
            onClick={handleCopy}
            className={`mt-4 px-4 py-2 rounded transition-colors ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-800 text-white'
            }`}
          >
            Copy Link
          </button>
        </div>
      )}
    </main>
  );
}