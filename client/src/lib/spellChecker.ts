const DICTIONARY = new Set([
  // common English words
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", 
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", 
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", 
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", 
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", 
  "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", 
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", 
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "are", "is", "was", "were",
  "been", "has", "had", "done", "does", "did", "said", "says", "going", "gone", "went",
  
  // Markdown & Editor Terms
  "markdown", "editor", "workspace", "folder", "file", "skill", "package", "agent", "prompt", 
  "template", "scaffold", "library", "git", "commit", "branch", "repository", "extension", 
  "dialog", "button", "input", "textarea", "context", "menu", "spellcheck", "suggestion",
  "project", "automation", "scripts", "assets", "versioning", "react", "vue", "angular", 
  "node", "python", "typescript", "javascript", "bash", "terminal", "console", "server", "client",
  "component", "components", "interface", "class", "function", "variable", "constant", "import", "export"
]);

function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 1; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

export function checkSpelling(word: string): { misspelled: boolean; suggestions: string[] } {
  const cleanWord = word.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanWord || cleanWord.length <= 2) {
    return { misspelled: false, suggestions: [] };
  }
  
  if (DICTIONARY.has(cleanWord)) {
    return { misspelled: false, suggestions: [] };
  }

  // Find suggestions with Levenshtein distance <= 2
  const suggestions: Array<{ word: string; dist: number }> = [];
  for (const dictWord of DICTIONARY) {
    if (Math.abs(dictWord.length - cleanWord.length) > 2) continue;
    
    const dist = getLevenshteinDistance(cleanWord, dictWord);
    if (dist <= 2) {
      suggestions.push({ word: dictWord, dist });
    }
  }

  const topSuggestions = suggestions
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map(s => s.word);

  return {
    misspelled: true,
    suggestions: topSuggestions
  };
}
