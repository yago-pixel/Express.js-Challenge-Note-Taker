// server-side code
// import express, path, fs, unqid packages
const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

// define PORT
const PORT = process.env.PORT || 3001;

// init app
const app = express();

// use middleware functions to parse information
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve all files from the public directory
app.use(express.static('public'));

// send the notes.html file inside the public folder, when link path is called
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// use the api notes to get the data within the db.json file
app.get('/api/notes', (req, res) => {
    // readFile function from the fs package, using the directory db/db.json and parsed in utf8
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        // error handling
        if (err) {
            // console error
            console.error(err);
            // get response Internal server error with errorcode 500
            res.status(500).json({ error: 'Internal server error'});
        } else {
            // parse the data with JSON
            const parsedData = JSON.parse(data);
            // get the parsed data from the response object
            res.json(parsedData);
        }
    });
});

// post request to add new notes to the array of note objects
app.post('/api/notes', (req, res) => {
    // display request in the console
    console.info(`${req.method} request received to add a review`);

    // deconstruct response body into two parts
    const { title, text } = req.body;

    // title and text are needed for the newNote that is being create
    if (title && text) {
        const newNote = {
            title,
            text,
            // add a uniqid with the uniqid package
            noteId: uniqid()
        };

        // readFile on the db.json object first, parsed as utf8
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            // if error return
            if(err) {
                return;
            }

            // const for the parsedData from the db.json file
            const parsedData = JSON.parse(data);

            // push the newNote object, that is written to the parsedData array
            parsedData.push(newNote);

            // write to the db.json file the new parsedData which is stringified if ther is no error
            fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
            err
            ? console.error(err)
            // message that new Note is added to the notes db
            : console.log(
                `New Note with the title ${newNote.title} has been added to Notes database.`
            )
        );
    });


    // response with success and shows the body with the newNote
    const response = {
        status: 'success',
        body: newNote,
    }; 

    // logs response object in the console
    console.log(response);
    // json response will be parsed with a 201 response
    res.status(201).json(response);
    } else {
        // error 
        res.status(500).json('Error in posting notes');
    }
});

// get the single notes by their id
app.get('/api/notes/:id', (req, res) => {
    // show message in the console to get the complete note
   console.info(`${req.method} request received to get complete note`);

//    readFile db.json in utf8
   fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err,data) => {
    // error
    if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        // parsedData parsed with JSON
        const parsedData = JSON.parse(data);
        // get from the response object the Id
        const noteId = req.params.id;
        // use function to find the note based on the Id
        const note = parsedData.find((note) => note.noteId === noteId);

        // if noteId equals noteId of the noteobject
        if (note) {
            // json response note 
            res.json(note);
        } else {
            // 404 error
            res.status(404).send('Note not found')
        }
    }
   });
});

// delete note based on id
app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received to delete a note`);
    // get noteId
    const noteId = req.params.id;
    // readfile db.json in utf8
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        // error
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            let parsedData = JSON.parse(data); 
            // const for the updatedData --> filter the note to be deleted
            const updatedData = parsedData.filter((note) => note.noteId !== noteId);

            // write new updatedData to the db.json file
            fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(updatedData, null, 4), (err) => {
                if(err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                } else {
                    // respond with 204 status code and end the writeFile
                    res.status(204).end();
                }
            });
        }
    });
});

// wildcard route to get the index.html from the public folder
app.get('*', (req, res) => 
// send the index file
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// when app is running, show message with link to the running application
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);