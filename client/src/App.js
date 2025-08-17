import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// API base URL - use environment variable or fallback to localhost
const API_BASE_URL = process.env.production.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize this meeting in bullet points for executives');
  const [summary, setSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summaryId, setSummaryId] = useState(null);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      setError('Please upload a .txt file only');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('transcript', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Read the file content to display
      const reader = new FileReader();
      reader.onload = (e) => {
        setTranscript(e.target.result);
      };
      reader.readAsText(file);

      setSuccess(`File uploaded successfully: ${response.data.filename}`);
      setActiveTab('summarize');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  // Handle text paste
  const handleTextSubmit = () => {
    if (!transcript.trim()) {
      setError('Please enter transcript content');
      return;
    }
    setSuccess('Transcript content ready for summarization');
    setActiveTab('summarize');
  };

  // Generate summary
  const generateSummary = async () => {
    if (!transcript.trim() || !customPrompt.trim()) {
      setError('Please provide both transcript content and custom prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/summary`, {
        transcriptContent: transcript,
        customPrompt: customPrompt
      });

      setSummary(response.data.summary);
      setEditedSummary(response.data.summary);
      setSummaryId(response.data.summaryId);
      setSuccess('Summary generated successfully!');
      setActiveTab('edit');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  // Add email recipient
  const addRecipient = () => {
    const email = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) return;
    
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (recipients.includes(email)) {
      setError('Email already added');
      return;
    }

    setRecipients([...recipients, email]);
    setEmailInput('');
    setError('');
  };

  // Remove email recipient
  const removeRecipient = (email) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  // Send email
  const sendEmail = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one email recipient');
      return;
    }

    if (!emailSubject.trim()) {
      setError('Please enter email subject');
      return;
    }

    if (!editedSummary.trim()) {
      setError('No summary content to send');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/send-email`, {
        summaryId: summaryId,
        recipients: recipients,
        subject: emailSubject,
        emailContent: editedSummary
      });

      setSuccess(`Email sent successfully to ${recipients.length} recipient(s)!`);
      setRecipients([]);
      setEmailInput('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Meeting Notes Summarizer</h1>
        <p>Transform your meeting transcripts into structured summaries with AI</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload Transcript
        </button>
        <button 
          className={`tab ${activeTab === 'summarize' ? 'active' : ''}`}
          onClick={() => setActiveTab('summarize')}
        >
          🧠 Generate Summary
        </button>
        <button 
          className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          ✏️ Edit & Send
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="section">
          <h2>Upload Transcript</h2>
          
          <div className="form-group">
            <label>Upload .txt file:</label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="form-control file-input"
              disabled={loading}
            />
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
            <strong>OR</strong>
          </div>

          <div className="form-group">
            <label>Paste transcript text:</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              className="form-control"
              rows="10"
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleTextSubmit}
            className="btn"
            disabled={loading || !transcript.trim()}
          >
            Use This Text
            {loading && <div className="loading"><div className="spinner"></div></div>}
          </button>
        </div>
      )}

      {activeTab === 'summarize' && (
        <div className="section">
          <h2>Generate AI Summary</h2>
          
          <div className="form-group">
            <label>Custom Prompt:</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Summarize for executives in bullet points, Create action items, etc."
              className="form-control"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Transcript Preview:</label>
            <div className="summary-display">
              <div className="summary-content">
                {transcript.substring(0, 500)}
                {transcript.length > 500 && '...'}
              </div>
            </div>
          </div>

          <button 
            onClick={generateSummary}
            className="btn"
            disabled={loading || !transcript.trim() || !customPrompt.trim()}
          >
            Generate Summary
            {loading && <div className="loading"><div className="spinner"></div></div>}
          </button>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="section">
          <h2>Edit Summary & Send Email</h2>
          
          {summary && (
            <>
              <div className="form-group">
                <label>Generated Summary (Edit as needed):</label>
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="form-control"
                  rows="15"
                  disabled={loading}
                />
              </div>

              <div className="email-section">
                <h3>Send via Email</h3>
                
                <div className="form-group">
                  <label>Email Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="form-control"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Add Recipients:</label>
                  <div className="email-inputs">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className="form-control"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    />
                    <button 
                      onClick={addRecipient}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {recipients.length > 0 && (
                  <div className="recipients-list">
                    {recipients.map((email, index) => (
                      <div key={index} className="recipient-tag">
                        {email}
                        <button onClick={() => removeRecipient(email)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={sendEmail}
                  className="btn btn-success"
                  disabled={loading || recipients.length === 0}
                >
                  Send Email
                  {loading && <div className="loading"><div className="spinner"></div></div>}
                </button>
              </div>
            </>
          )}

          {!summary && (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              <p>No summary generated yet. Please go back to generate a summary first.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
