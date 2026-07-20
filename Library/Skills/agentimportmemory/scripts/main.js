/**
 * Main entry point for the agentimportmemory skill.
 * This file exposes the core functionalities for importing different types of memory.
 */

// Example in-memory store for demonstration purposes
const memoryStore = {};
let memoryIdCounter = 0;

/**
 * Imports raw text content into the agent's memory.
 * @param {string} content The text content to be imported.
 * @param {string} [context] Optional context or tag for the memory.
 * @returns {Promise<object>} An object indicating success/failure and the assigned memory ID.
 */
async function import_text_memory(content, context = 'general') {
    try {
        const id = `text_mem_${memoryIdCounter++}`;
        memoryStore[id] = { type: 'text', content, context, timestamp: new Date().toISOString() };
        console.log(`[agentimportmemory] Text memory imported: ID=${id}, Context=${context}`);
        return { success: true, id, message: "Text memory imported successfully." };
    } catch (error) {
        console.error(`[agentimportmemory] Error importing text memory: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Imports structured JSON data into the agent's memory.
 * @param {object} data The JSON object to be imported.
 * @param {object} [schema] Optional JSON schema for validating the imported data.
 * @returns {Promise<object>} An object indicating success/failure and the assigned memory ID.
 */
async function import_json_memory(data, schema = null) {
    try {
        // Basic schema validation example (can be expanded with a library like 'ajv')
        if (schema && !isValidJson(data, schema)) {
            return { success: false, message: "JSON data does not conform to the provided schema." };
        }

        const id = `json_mem_${memoryIdCounter++}`;
        memoryStore[id] = { type: 'json', data, timestamp: new Date().toISOString() };
        console.log(`[agentimportmemory] JSON memory imported: ID=${id}`);
        return { success: true, id, message: "JSON memory imported successfully." };
    } catch (error) {
        console.error(`[agentimportmemory] Error importing JSON memory: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Imports a code snippet into the agent's memory for reference.
 * @param {string} code The code snippet string.
 * @param {string} language The programming language of the code (e.g., 'javascript', 'python').
 * @param {string} [description] An optional description or purpose of the code snippet.
 * @returns {Promise<object>} An object indicating success/failure and the assigned memory ID.
 */
async function import_code_snippet(code, language, description = null) {
    try {
        if (!code || !language) {
            return { success: false, message: "Code and language are required for importing code snippets." };
        }
        const id = `code_mem_${memoryIdCounter++}`;
        memoryStore[id] = { type: 'code', code, language, description, timestamp: new Date().toISOString() };
        console.log(`[agentimportmemory] Code snippet imported: ID=${id}, Language=${language}`);
        return { success: true, id, message: "Code snippet imported successfully." };
    } catch (error) {
        console.error(`[agentimportmemory] Error importing code snippet: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Helper function for basic JSON schema validation.
 * In a real-world scenario, you'd use a dedicated library.
 * @param {object} data
 * @param {object} schema
 * @returns {boolean}
 */
function isValidJson(data, schema) {
    // This is a very basic placeholder. A real implementation would use a library like 'ajv'.
    // For demonstration, let's just check if data has all required properties from schema.
    if (schema.required) {
        for (const prop of schema.required) {
            if (!(prop in data)) {
                console.warn(`[agentimportmemory] Schema validation failed: Missing required property "${prop}"`);
                return false;
            }
        }
    }
    return true;
}


// Export the functions for the agent to call
module.exports = {
    import_text_memory,
    import_json_memory,
    import_code_snippet,
    // Add other functions here as you implement them
};
