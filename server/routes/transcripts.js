const express = require('express');
const multer = require('multer');
const Transcript = require('../models/Transcript');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'), false);
    }
  }
});

// POST /api/upload - Handle transcript upload
router.post('/upload', upload.single('transcript'), async (req, res) => {
  try {
    let transcriptContent = '';
    let filename = '';
    let fileSize = 0;

    if (req.file) {
      // File upload
      transcriptContent = req.file.buffer.toString('utf8');
      filename = req.file.originalname;
      fileSize = req.file.size;
    } else if (req.body.content) {
      // Text paste
      transcriptContent = req.body.content;
      filename = req.body.filename || `pasted-text-${Date.now()}.txt`;
      fileSize = Buffer.byteLength(transcriptContent, 'utf8');
    } else {
      return res.status(400).json({ error: 'No transcript content provided' });
    }

    if (!transcriptContent.trim()) {
      return res.status(400).json({ error: 'Transcript content is empty' });
    }

    // Save to database
    const transcript = new Transcript({
      filename,
      content: transcriptContent,
      fileSize
    });

    await transcript.save();

    res.json({
      message: 'Transcript uploaded successfully',
      transcriptId: transcript._id,
      filename: transcript.filename,
      fileSize: transcript.fileSize,
      uploadedAt: transcript.uploadedAt
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload transcript',
      message: error.message 
    });
  }
});

// GET /api/transcripts - Get all transcripts
router.get('/transcripts', async (req, res) => {
  try {
    const transcripts = await Transcript.find()
      .select('filename fileSize uploadedAt')
      .sort({ uploadedAt: -1 });
    
    res.json(transcripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transcripts',
      message: error.message 
    });
  }
});

// GET /api/transcript/:id - Get specific transcript
router.get('/transcript/:id', async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    res.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transcript',
      message: error.message 
    });
  }
});

module.exports = router;
