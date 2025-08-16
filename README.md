# AI Meeting Notes Summarizer

A full-stack MERN application that transforms meeting transcripts into structured summaries using AI and allows you to send them via email.

## Features

- 📁 **Upload Transcripts**: Upload .txt files or paste text directly
- 🧠 **AI Summarization**: Generate structured summaries with custom prompts using Groq API
- ✏️ **Edit Summaries**: Edit AI-generated summaries before sending
- 📧 **Email Integration**: Send summaries to multiple recipients via email
- 💾 **Data Storage**: Store transcripts, summaries, and email logs in MongoDB

## Tech Stack

- **Frontend**: React.js with modern UI
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **AI Integration**: Groq API with Llama models (with fallback for basic summaries)
- **Email**: Nodemailer
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Groq API key (free tier available - app works with fallback summaries)
- Gmail account for email sending (or other email service)

## Installation

1. **Clone and setup the project**:
   ```bash
   cd ai-meeting-notes-summarizer
   npm run install-all
   ```

2. **Configure environment variables**:
   ```bash
   cd server
   cp .env.example .env
   ```

3. **Edit the `.env` file** with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-summarizer
   GROQ_API_KEY=gsk_your-groq-api-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_SERVICE=gmail
   ```

## Setup Instructions

### MongoDB Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env`

### Groq API Setup (Free Tier Available)
1. Sign up at [Groq Console](https://console.groq.com)
2. Go to API Keys → Create new key
3. Add it to your `.env` file as `GROQ_API_KEY`
4. Note: App works without this - uses fallback summaries

### Email Setup
1. For Gmail, enable 2-factor authentication
2. Generate an "App Password" in your Google Account settings
3. Use your Gmail address and the app password in `.env`

## Running the Application

1. **Start both frontend and backend**:
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Transcripts
- `POST /api/upload` - Upload transcript file or text
- `GET /api/transcripts` - Get all transcripts
- `GET /api/transcript/:id` - Get specific transcript

### Summaries
- `POST /api/summary` - Generate AI summary
- `GET /api/summaries` - Get all summaries
- `GET /api/summary/:id` - Get specific summary
- `PUT /api/summary/:id` - Update summary

### Email
- `POST /api/send-email` - Send summary via email
- `GET /api/email-logs` - Get email logs

## Usage

1. **Upload Transcript**: 
   - Upload a .txt file or paste meeting transcript text
   
2. **Generate Summary**:
   - Enter a custom prompt (e.g., "Summarize for executives in bullet points")
   - Click "Generate Summary"
   
3. **Edit & Send**:
   - Review and edit the AI-generated summary
   - Add email recipients
   - Send the summary via email

## Sample Prompts

- "Summarize this meeting in bullet points for executives"
- "Create a list of action items with owners and deadlines"
- "Extract key decisions made in this meeting"
- "Provide a technical summary for the development team"
- "Create meeting minutes in formal format"

## Project Structure

```
ai-meeting-notes-summarizer/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   │   ├── Transcript.js
│   │   ├── Summary.js
│   │   └── EmailLog.js
│   ├── routes/            # API routes
│   │   ├── transcripts.js
│   │   ├── summaries.js
│   │   └── email.js
│   ├── index.js           # Server entry point
│   ├── .env.example       # Environment variables template
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check your connection string in `.env`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Email Not Sending**:
   - Verify email credentials in `.env`
   - For Gmail, use App Password, not regular password
   - Check if 2FA is enabled

3. **AI Summary Not Working**:
   - App works without OpenAI API key (uses fallback)
   - Check API key validity if using OpenAI
   - Monitor API usage limits

4. **File Upload Issues**:
   - Only .txt files are supported
   - File size limit is 10MB
   - Check file encoding (UTF-8 recommended)

## Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Update `client/src/App.js`
3. **Database**: Add models in `server/models/`

### Testing

- Test file upload with various .txt files
- Test text paste functionality
- Test AI summarization with different prompts
- Test email sending to multiple recipients
- Verify data persistence in MongoDB

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify your environment variables
3. Check the console logs for detailed error messages
4. Ensure all dependencies are installed correctly
