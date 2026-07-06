# Simple Post-it Note App

1. Project Description
This project will create a basic web-based "Post-it Note" application. Users can type a note, add it to a collection of sticky notes displayed on the page, and then edit or delete individual notes. All notes will be stored in the browser's localStorage so they persist even if the user closes and reopens the browser tab.

2. Architectural Design Decisions
**Technology Stack:** Pure client-side web application using HTML, CSS, and vanilla JavaScript. This minimizes setup complexity and allows for immediate interaction.

## Data Persistence:
**localStorage**
will be used to store notes directly in the user's browser. Each note will be a simple object containing its ID and content. This eliminates the need for a backend server or database, keeping the project truly "simple." User Interface: A single index.html file will serve as the entry point. Notes will be dynamically rendered as styled div elements, resembling physical post-it notes. An input field will be provided for new note creation.

## Core Features:
**Add Note:** A text input and a button to create a new note.
Display Notes: Render all stored notes on the page.
**Edit Note:** Allow users to click on a note's text to directly edit its content.
**Delete Note:** A button or icon on each note to remove it.
Persistence: Load notes from localStorage on startup and save changes (add, edit, delete) back to localStorage

3. Proposed Directory Structure

├── README.md                 # Project overview and instructions
├── index.html                # The main application entry point (HTML structure)
└── src/                      # Source code directory
    ├── css/                  # Stylesheets
    │   └── style.css         # Main stylesheet for the application
    ─ js/                   # JavaScript files
        └── script.js         # Core application logic and DOM manipulation

4. File Content Outline
**README.md**
**Purpose:** Introduce the project, explain how to run it, and briefly describe its features.
**Content:** Project title, a short description, setup instructions (open index.html ), features list, and future possible enhancements.
**index.html**
**Purpose:** The main HTML document that structures the web page.
**Content:**
Basic HTML5 boilerplate (
<!DOCTYPE html>
<html>
<head>
<body>
).

Title for the browser tab.
Link to src/css/style.css

A container div for the entire app. An input field ( <textarea> ) and an "Add Note" button. A main container div where all the notes will be displayed dynamically by JavaScript. Link to src/js/script.js (preferably at the end of <body> for performance).
src/css/style.css
**Purpose:** Defines the visual appearance of the application.
**Content:**
Basic global styles (font, body background).
Styling for the main app container.
Styling for the input area (textarea, button).
Styling for individual "post-it" notes (background color, shadow, padding, font, position, make them look like sticky notes).
Styling for the delete button on each note.
src/js/script.js
**Purpose:** Contains all the JavaScript logic for the application.

**Content:** Constants/Variables: DOM element references (input, add button, notes container).
notes array: An array to hold all note objects { id: ..., content: ... }

**loadNotes()** function: Reads notes from localStorage and populates the notes array.
saveNotes() function: Saves the current notes array to localStorage

**createNoteElement(note)**
function: Takes a note object and returns a div element representing that note, including its content, edit functionality, and a delete button.

**addNote(content)**
function: Creates a new note object, adds it to the notes array, saves notes, and re-renders all notes. 
**updateNote(id, newContent) **function: Finds a note by ID, updates its content, and saves notes.
**deleteNote(id) **function: Filters out a note by ID from the notes array, saves notes, and re-renders all notes.

**renderNotes()** function: Clears the notes container and then calls createNoteElement for each note in the notes array, appending them to the DOM.

**Event Listeners:**
For the "Add Note" button: Calls addNote with the textarea content.

**Delegated event** listeners on the notes container for:
Delete button clicks: Calls deleteNote Note content clicks (for editing): Makes the content editable, saves on blur.
**
Initialization:** Calls loadNotes() and renderNotes() when the DOM is fully loaded to display existing notes.