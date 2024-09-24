const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const uploadDir = './uploads';

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Serve static HTML file
app.use(express.static('public'));

// Create uploads folder if not exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Upload a file
app.post('/upload', upload.single('file'), (req, res) => {
    res.send({
        message: 'File uploaded successfully',
        file: req.file,
    });
});

// List all files
app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }
        res.send(files);
    });
});

// Download a file
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Delete a file
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.send({ message: 'File deleted successfully' });
    } else {
        res.status(404).send('File not found');
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`File Manager service running at http://localhost:${port}`);
});
