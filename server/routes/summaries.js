const express = require('express');
const Groq = require('groq-sdk');
const Transcript = require('../models/Transcript');
const Summary = require('../models/Summary');

const router = express.Router();

// POST /api/summary - Generate AI summary
router.post('/summary', async (req, res) => {
  try {
    const { transcriptId, transcriptContent, customPrompt } = req.body;

    if (!transcriptContent || !customPrompt) {
      return res.status(400).json({ 
        error: 'Transcript content and custom prompt are required' 
      });
    }

    // Prepare the prompt for AI
    const fullPrompt = `${customPrompt}\n\nTranscript:\n${transcriptContent}`;

    let aiSummary = '';

    // Try Groq API first
    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes meeting transcripts based on user requirements.'
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          model: 'llama-3.1-8b-instant', // Updated to supported model
          max_tokens: 1000,
          temperature: 0.7
        });

        aiSummary = chatCompletion.choices[0].message.content;
      } catch (groqError) {
        console.error('Groq API error:', groqError.message);
        
        // Fallback to a simple text processing summary
        aiSummary = generateFallbackSummary(transcriptContent, customPrompt);
      }
    } else {
      // No API key provided, use fallback
      aiSummary = generateFallbackSummary(transcriptContent, customPrompt);
    }

    // Save summary to database
    const summary = new Summary({
      transcriptId: transcriptId || null,
      originalTranscript: transcriptContent,
      customPrompt,
      aiSummary
    });

    await summary.save();

    res.json({
      message: 'Summary generated successfully',
      summaryId: summary._id,
      summary: aiSummary,
      createdAt: summary.createdAt
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

// Function to generate a simple fallback summary
function generateFallbackSummary(transcript, prompt) {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = transcript.split(/\s+/).length;
  
  let summary = `**Summary based on your request: "${prompt}"**\n\n`;
  
  if (prompt.toLowerCase().includes('bullet') || prompt.toLowerCase().includes('points')) {
    // Generate bullet points
    const keyPoints = sentences
      .filter(s => s.length > 50)
      .slice(0, 5)
      .map(s => `• ${s.trim()}`)
      .join('\n');
    
    summary += `**Key Points:**\n${keyPoints}\n\n`;
  } else if (prompt.toLowerCase().includes('executive')) {
    // Executive summary format
    summary += `**Executive Summary:**\n`;
    summary += `This meeting transcript contains ${wordCount} words across ${sentences.length} main points. `;
    summary += `Key discussion areas include the main topics covered in the conversation.\n\n`;
  }
  
  // Add basic statistics
  summary += `**Meeting Statistics:**\n`;
  summary += `• Total words: ${wordCount}\n`;
  summary += `• Main discussion points: ${sentences.length}\n`;
  summary += `• Estimated reading time: ${Math.ceil(wordCount / 200)} minutes\n\n`;
  
  summary += `**Note:** This is a basic summary. For AI-powered summaries, please configure your OpenAI API key in the server environment variables.`;
  
  return summary;
}

// GET /api/summaries - Get all summaries
router.get('/summaries', async (req, res) => {
  try {
    const summaries = await Summary.find()
      .populate('transcriptId', 'filename')
      .select('customPrompt createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch summaries',
      message: error.message 
    });
  }
});

// GET /api/summary/:id - Get specific summary
router.get('/summary/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id)
      .populate('transcriptId', 'filename');
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch summary',
      message: error.message 
    });
  }
});

// PUT /api/summary/:id - Update summary (for edited content)
router.put('/summary/:id', async (req, res) => {
  try {
    const { editedSummary } = req.body;
    
    if (!editedSummary) {
      return res.status(400).json({ error: 'Edited summary content is required' });
    }

    const summary = await Summary.findByIdAndUpdate(
      req.params.id,
      { 
        editedSummary,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({
      message: 'Summary updated successfully',
      summary
    });

  } catch (error) {
    console.error('Error updating summary:', error);
    res.status(500).json({ 
      error: 'Failed to update summary',
      message: error.message 
    });
  }
});

module.exports = router;
