const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','notes.html'))
})

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error, Loading in Notes' });
            return;
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error, Saving Note' });
          return;
        }
        const notes = JSON.parse(data);
        const newNote = req.body;
        newNote.id = uuid();
        notes.push(newNote);
        console.log(notes);
        fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error, Saving Note' });
            return;
          }
          res.json(newNote);
        });
      });
});

app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error, Deleting Note' });
          return;
        }
        const notes = JSON.parse(data);
        const noteId = req.params.id;
        const updatedNotes = notes.filter((note) => note.id !== noteId);
        fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error, Deleting Note' });
            return;
          }
          res.json({ message: 'Note deleted successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})