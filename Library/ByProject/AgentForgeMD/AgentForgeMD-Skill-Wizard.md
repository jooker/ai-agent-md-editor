# AgentForgeMD Skill Wizard

## Role
You are an elite Software Engineer. Your task is to write clean, maintainable, secure, and highly optimized code based on user requirements.

## Engineering Standards
- **Clean Code**: Follow SOLID principles, write descriptive variable names, and keep functions small and single-purpose.
- **Error Handling**: Always include robust try-catch blocks, input validation, and meaningful error logs.
- **Security**: Prevent SQL injection, XSS, and CSRF. Never hardcode API keys or secrets.

## Task Flow
1. **Requirements Analysis**: Read the prompt and list out dependencies, inputs, and expected outputs.
2. **Architecture Design**: Plan the file structure and data models.
3. **Implementation**: Write the code. Prioritize readability over clever hacks.
4. **Documentation**: Add inline comments for complex logic and write a concise Skills_Project_README.md with setup instructions.

## Constraints
- **No Deprecated Libraries**: Only use stable, actively maintained libraries.
- **Type Safety**: Use TypeScript/strongly-typed constructs where applicable.
- **Testability**: Structure code so that it is easily unit-testable.

## Component Overview
Design, code and implement a new Skill Package Workspace Wizard. You are going to write a component that can be used for other packages or workspace projects in AgentForgeMD similar to VS Code, Antigravity, etc... It will work much like an IDE treats a project workspace. 

An AI agent skill package is a modular directory structure that provides specialized procedural knowledge to an AI agent, typically centered around a mandatory SKILL.md file.  This open standard (agentskills.io) allows agents to load domain expertise on demand via progressive disclosure, reducing token usage and context dilution. 

### Structure

An Agent Skill is a reusable folder that gives an AI agent task-specific instructions, scripts, and supporting files.
The required file is usually SKILL.md, which defines what the skill does and when the agent should use it.
scripts/ should contain executable logic, such as Python, JavaScript, Bash, validation tools, or data processing steps.
resources/ or references/ should contain knowledge files, policies, examples, schemas, and documentation.
assets/ should contain reusable static files, such as templates, brand files, sample data, diagrams, and output formats.

You should research this page for an in-depth overview of the structure and it's importance at https://aiquinta.ai/blog/agent-skill-folder-structure-scripts-resources-assets/



#### The standard package structure includes:

Root Directory: A named folder (e.g., ~/.claude/skills/linear-sprint-planner/) containing the skill assets. 

**SKILL.md (Required):** The core instruction file containing:


- **YAML Frontmatter**: Metadata such as name, description, version, and trigger conditions (when to use).
- **Markdown Body**: Step-by-step instructions, prerequisites, and workflow logic the agent follows. 
- **references/ (Optional)**: A subdirectory for detailed domain knowledge, API specs, or style guides that are loaded only when explicitly referenced by the main instructions. 
- **scripts/ (Optional)**: Executable code or automation scripts that the agent may run during task execution. 
- **assets/ (Optional)**: Static resources such as templates, images, or configuration files used by the skill. 
- **themes/ (Optional)**: UI/UX, Color Palettes, Typography, Design Overview and best used for

The user can add any folders they choose to the skill workspace or create new folders and add any file type that is relevant to the project as long as it adheres to the structure.

This structure enables reusability across platforms like Claude Code, OpenAI Codex, Cursor, Visual Studio Code, Antigravity and misc. other CLI and desktop apps allowing teams to install skills via registries (e.g., npx skills add) or manually place them in project-specific directories. The structure is fundamental in keeping a skill package organized. When the skill package is released it should include the root directory folder of the skill and this folder should be the name of the skill for referencing the skill in the platforms mentioned prior. The user can simply select the folder with the skill.md and additional resources such as scripts, references, any other folders added to the skill workspace easily and organized.

### Versioning
- Adapt SemVer for AI: Semantic Versioning (SemVer) provides a structured framework for managing Major, Minor, and Patch updates across tool schemas, prompts, and execution logic.
- Prioritize Backward Compatibility: Maintaining backward compatibility in agent tool calls ensures existing AI orchestrations continue to function smoothly during system upgrades.
- Structure the Deprecation Lifecycle: A well-defined deprecation policy prevents stranded assets, reduces token bloat, and provides a safe migration path for enterprise AI architectures.
- Enforce Strict Governance: Implementing sandboxing, audit trails, and automated schema validation is essential for secure and reliable developer agent deployment.

To implement versioning you should research the web page at https://aiquinta.ai/blog/versioning-agent-skills-semver-compatibility-deprecation/ there is lots of useful information about skills and versioning skill packages. The skill project should automatically update the versions itself. You can use Git or something similar if that is easier to include and add to the component. You should do your own research and see if there is a better option that is open source or licensed so we can include in our project free of charge. 

### Library
The componenet should include the skill packages already downloaded into a folder named Library in the root directory of AgentForgeMD. The Library already contains a skills folder that can be used as the root of the skills projects created with the component. You can also look at the other skills to get an idea of what is required to implement in this wizard or project workspace. Add a Library button to the toolbar that opens a modal fitting the design of the app witha professionally designed Library browser that allows the user to browse existing folders containing markdown files or relevent files but the skills folder must be scanned to include all files and folders within a skill folder. So list the skill and if the user chooses to open it will open all the files and folders in a sidebar file tree like visual studio code or other ide. I guess it doesn't have to be just skill folder that has other files and folders nested within the user can open any folder into the workspace tree. 

### AI Agent Chat 
Add a chat interface to have the users favorite ai agent help create their new skill package and offer advice to questions, problems, or anything helpful. 
## Future Enhancements
\
1. GitHub integration to install skills from repositories and commit skills to a personal repository on GitHub or initialize a local git
2. Skills.sh browser and downloader straight into the library/skills folder
3. Publish to npm file libraries for easy installation into your ai agent
