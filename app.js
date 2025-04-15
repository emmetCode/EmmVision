//declare imports
const express = require('express');
const app = express();
const multer = require('multer');
const { createWorker } = require('tesseract.js');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, file.originalname),
});

//specified upload
const upload = multer({ storage: storage }).single('avatar');

app.set('view engine', 'ejs');
app.use(express.static("public"));

//Routes
app.get('/', (req, res) => {
    res.render('index');  // Renders EJS file
});

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).send('Upload error: ' + err.message);

        const worker = await createWorker(); // Create the worker

        try {
            // No need to load or initialize anymore
            const {
                data: { text, pdf }
            } = await worker.recognize(`./uploads/${req.file.originalname}`, {
                tessjs_create_pdf: '1'
            });  // Perform OCR directly

            res.send(`<pre>${text}</pre>`);  // Return OCR'd text to the client
        } catch (error) {
            console.error('OCR Error:', error);
            res.status(500).send('OCR failed.');
        } finally {
            await worker.terminate();  // Clean up the worker
        }
    });
});

//start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
