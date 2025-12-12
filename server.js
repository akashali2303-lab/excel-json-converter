const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// --- DATABASE CONNECTION ---
// notice the %40 instead of @ in the password part
const mongoURI = "mongodb+srv://admin:password123%40@cluster0.lh5e8xv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- DEFINE DATABASE SCHEMA ---
const ConversionSchema = new mongoose.Schema({
    fileName: String,
    fileSize: Number,
    convertedAt: { type: Date, default: Date.now }
});

const ConversionLog = mongoose.model('ConversionLog', ConversionSchema);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROUTES ---

app.post('/api/convert', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // 1. Validation Logic
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext !== '.xlsx' && ext !== '.xls') {
            return res.status(400).json({ error: "Invalid file format! Excel only." });
        }

        // 2. Conversion Logic
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        // 3. Save to Database Logic
        const newLog = new ConversionLog({
            fileName: req.file.originalname,
            fileSize: req.file.size
        });
        
        await newLog.save(); 
        console.log(`💾 Saved to Database: ${req.file.originalname}`);

        res.json(jsonData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process file" });
    }
});

// New Route: See History (We can use this later)
app.get('/api/history', async (req, res) => {
    try {
        const logs = await ConversionLog.find().sort({ convertedAt: -1 }).limit(10);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});