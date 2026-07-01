#!/bin/bash
# Automated Skill Arsenal Installer
# This script sets up your 71-skill arsenal in any terminal automatically

set -e

echo "🎯 Installing Skill Arsenal..."
echo "========================================"
echo ""

# Configuration
SKILLS_DIR="$HOME/skills"
SKILLS_REPO="https://github.com/abcnuts/manus-skills.git"
SHELL_RC="$HOME/.bashrc"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

echo "📦 Step 1: Installing Skills Repository"
echo "----------------------------------------"

# Clone or update skills repository
if [ -d "$SKILLS_DIR" ]; then
    echo "✓ Skills directory exists, updating..."
    cd "$SKILLS_DIR"
    git pull origin main
else
    echo "✓ Cloning skills repository..."
    git clone "$SKILLS_REPO" "$SKILLS_DIR"
fi

echo ""
echo "🔧 Step 2: Setting up Shell Integration"
echo "----------------------------------------"

# Create skills integration script
cat > "$HOME/.skills-integration.sh" << 'INTEGRATION_EOF'
# Skill Arsenal Integration
# Auto-loaded in every terminal

export SKILLS_DIR="$HOME/skills"
export SKILLS_PATH="$SKILLS_DIR/skills"

# Skill command - view a skill
skill() {
    if [ -z "$1" ]; then
        echo "Usage: skill <skill-name>"
        echo "Example: skill systematic-debugging"
        echo ""
        echo "Available skills:"
        ls "$SKILLS_PATH"
        return 1
    fi
    
    local skill_name="$1"
    local skill_file=""
    
    # Search for the skill in all categories
    skill_file=$(find "$SKILLS_PATH" -type f -name "SKILL.md" -path "*/$skill_name/SKILL.md" | head -1)
    
    if [ -z "$skill_file" ]; then
        echo "❌ Skill '$skill_name' not found"
        echo ""
        echo "Try: skills-list"
        return 1
    fi
    
    echo "📖 Viewing skill: $skill_name"
    echo "========================================"
    cat "$skill_file"
}

# List all skills
skills-list() {
    echo "🎯 Your Skill Arsenal (71 skills)"
    echo "========================================"
    echo ""
    
    for category in "$SKILLS_PATH"/*; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            echo "📁 $category_name:"
            for skill_dir in "$category"/*; do
                if [ -d "$skill_dir" ] && [ -f "$skill_dir/SKILL.md" ]; then
                    skill_name=$(basename "$skill_dir")
                    echo "   - $skill_name"
                fi
            done
            echo ""
        fi
    done
}

# Search skills by keyword
skills-search() {
    if [ -z "$1" ]; then
        echo "Usage: skills-search <keyword>"
        return 1
    fi
    
    echo "🔍 Searching for: $1"
    echo "========================================"
    grep -r -i "$1" "$SKILLS_PATH"/*/SKILL.md | while read -r line; do
        skill_path=$(echo "$line" | cut -d: -f1)
        skill_name=$(dirname "$skill_path" | xargs basename)
        echo "✓ $skill_name"
    done
}

# Get skill path
skills-path() {
    if [ -z "$1" ]; then
        echo "$SKILLS_PATH"
        return 0
    fi
    
    local skill_name="$1"
    local skill_dir=""
    
    skill_dir=$(find "$SKILLS_PATH" -type d -name "$skill_name" | head -1)
    
    if [ -z "$skill_dir" ]; then
        echo "❌ Skill '$skill_name' not found"
        return 1
    fi
    
    echo "$skill_dir"
}

# Update skills from GitHub
skills-update() {
    echo "📥 Updating skills from GitHub..."
    cd "$SKILLS_DIR"
    git pull origin main
    echo "✅ Skills updated!"
}

# Show skill stats
skills-stats() {
    echo "📊 Skill Arsenal Statistics"
    echo "========================================"
    echo ""
    
    local total_skills=0
    
    for category in "$SKILLS_PATH"/*; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            count=$(find "$category" -name "SKILL.md" | wc -l)
            total_skills=$((total_skills + count))
            echo "📁 $category_name: $count skills"
        fi
    done
    
    echo ""
    echo "🎯 Total: $total_skills skills"
}

# Quick access aliases
alias sk='skill'
alias skl='skills-list'
alias sks='skills-search'
alias sku='skills-update'
alias skst='skills-stats'
alias skp='skills-path'

INTEGRATION_EOF

# Add to shell RC if not already present
if ! grep -q ".skills-integration.sh" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# Skill Arsenal Integration" >> "$SHELL_RC"
    echo "if [ -f ~/.skills-integration.sh ]; then" >> "$SHELL_RC"
    echo "    source ~/.skills-integration.sh" >> "$SHELL_RC"
    echo "fi" >> "$SHELL_RC"
    echo "✓ Added to $SHELL_RC"
else
    echo "✓ Already integrated in $SHELL_RC"
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================================"
echo ""
echo "Available commands:"
echo ""
echo "  skill <name>          - View a skill"
echo "  skills-list           - List all skills"
echo "  skills-search <word>  - Search skills"
echo "  skills-update         - Update from GitHub"
echo "  skills-stats          - Show statistics"
echo "  skills-path [name]    - Get skill path"
echo ""
echo "Shortcuts:"
echo "  sk, skl, sks, sku, skst, skp"
echo ""
echo "🚀 To activate in this terminal:"
echo "  source ~/.skills-integration.sh"
echo ""
echo "Or restart your terminal!"
echo ""
