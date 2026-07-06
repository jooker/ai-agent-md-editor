# Simple Post-it Note App

## Project Description
This project creates a basic web-based "Post-it Note" application. Users can type a note, add it to a collection of sticky notes displayed on the page, and then edit or delete individual notes. All notes are stored in the browser's `localStorage` so they persist even if the user closes and reopens the browser tab.

## Features
*   **Add Note:** A text input and a button to create a new note.
*   **Display Notes:** Render all stored notes on the page.
*   **Edit Note:** Allow users to click on a note's text to directly edit its content.
*   **Delete Note:** A button or icon on each note to remove it.
*   **Persistence:** Load notes from `localStorage` on startup and save changes (add, edit, delete) back to `localStorage`.

## Technologies Used
*   HTML5
*   CSS3
*   Vanilla JavaScript

## Setup Instructions
1.  **Clone or Download:** Get the project files onto your local machine.
2.  **Open `index.html`:** Simply open the `index.html` file in your preferred web browser. There's no server setup required.

## Usage
1.  Type your note into the text area.
2.  Click the "Add Note" button to add it to the display.
3.  To **edit** a note, click directly on its text. The text will become editable. Click outside or press Enter to save changes.
4.  To **delete** a note, click the 'X' button in the top right corner of the note.

## Future Enhancements
*   Drag-and-drop functionality for notes.
*   Color options for notes.
*   Search functionality.
*   User accounts for cloud storage (requires backend).