const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public')); // Serves the frontend files

// Configure Multer (Store files in memory, not on disk, for speed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Route: Convert
app.post('/api/convert', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Read the buffer from memory
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        // Send response
        res.json(jsonData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process file" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});