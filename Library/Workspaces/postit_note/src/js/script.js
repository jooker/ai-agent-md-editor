document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const noteTextInput = document.getElementById('note-text-input');
    const addNoteButton = document.getElementById('add-note-button');
    const notesContainer = document.getElementById('notes-container');

    // --- State Variable ---
    // An array to hold all note objects { id: ..., content: ... }
    let notes = [];

    // --- Persistence Functions ---

    /**
     * Loads notes from localStorage and populates the 'notes' array.
     */
    function loadNotes() {
        const storedNotes = localStorage.getItem('postitNotes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        }
    }

    /**
     * Saves the current 'notes' array to localStorage.
     */
    function saveNotes() {
        localStorage.setItem('postitNotes', JSON.stringify(notes));
    }

    // --- DOM Manipulation & Note Management Functions ---

    /**
     * Creates a new div element representing a single post-it note.
     * @param {object} note - The note object { id: string, content: string }.
     * @returns {HTMLElement} The created div element.
     */
    function createNoteElement(note) {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.dataset.id = note.id; // Store ID for easy reference

        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.contentEditable = true; // Make text editable
        noteContent.innerText = note.content;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note-button');
        deleteButton.innerText = 'X';
        deleteButton.title = 'Delete Note';

        noteItem.appendChild(noteContent);
        noteItem.appendChild(deleteButton);

        return noteItem;
    }

    /**
     * Clears the notes container and then renders all notes from the 'notes' array.
     */
    function renderNotes() {
        notesContainer.innerHTML = ''; // Clear existing notes

        if (notes.length === 0) {
            const message = document.createElement('p');
            message.classList.add('no-notes-message');
            message.innerText = 'No notes yet! Start by typing a note above.';
            notesContainer.appendChild(message);
            return;
        }

        notes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
    }

    /**
     * Adds a new note to the 'notes' array, saves, and re-renders.
     * @param {string} content - The content of the new note.
     */
    function addNote(content) {
        if (!content.trim()) return; // Don't add empty notes

        const newNote = {
            id: Date.now().toString(), // Simple unique ID
            content: content.trim()
        };
        notes.push(newNote);
        saveNotes();
        renderNotes();
        noteTextInput.value = ''; // Clear input field
    }

    /**
     * Updates the content of an existing note.
     * @param {string} id - The ID of the note to update.
     * @param {string} newContent - The new content for the note.
     */
    function updateNote(id, newContent) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex > -1) {
            notes[noteIndex].content = newContent.trim();
            saveNotes();
            // No need to re-render all notes, as contentEditable directly updates the DOM
        }
    }

    /**
     * Deletes a note from the 'notes' array, saves, and re-renders.
     * @param {string} id - The ID of the note to delete.
     */
    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    }

    // --- Event Listeners ---

    // Add Note button click
    addNoteButton.addEventListener('click', () => {
        addNote(noteTextInput.value);
    });

    // Allow adding note with Enter key in the textarea (Shift+Enter for new line)
    noteTextInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default new line behavior
            addNote(noteTextInput.value);
        }
    });

    // Delegated event listener for notes container (for delete and edit functionality)
    notesContainer.addEventListener('click', (event) => {
        const target = event.target;

        // Handle delete button click
        if (target.classList.contains('delete-note-button')) {
            const noteItem = target.closest('.note-item');
            if (noteItem) {
                deleteNote(noteItem.dataset.id);
            }
        }
    });

    notesContainer.addEventListener('blur', (event) => {
        const target = event.target;

        // Handle note content editing (when blur happens after editing)
        if (target.classList.contains('note-content') && target.isContentEditable) {
            const noteItem = target.closest('.note-item');
            if (noteItem) {
                updateNote(noteItem.dataset.id, target.innerText);
            }
        }
    }, true); // Use capture phase for blur event

    // Optional: Save on 'Enter' while editing a note
    notesContainer.addEventListener('keypress', (event) => {
        const target = event.target;
        if (event.key === 'Enter' && target.classList.contains('note-content') && target.isContentEditable) {
            event.preventDefault(); // Prevent new line in contentEditable
            target.blur(); // Trigger blur to save changes
        }
    });

    // --- Initialization ---
    loadNotes();
    renderNotes();
});