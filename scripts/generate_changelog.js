const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8' }).trim();
    } catch (e) {
        return null;
    }
}

function calculateTimeSpent(currentDate, prevDate) {
    if (!prevDate) return "Initial Commit";
    const current = new Date(currentDate);
    const prev = new Date(prevDate);
    const diffMs = current - prev;
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `~${diffMins} Minutes`;
    
    const diffHours = (diffMins / 60).toFixed(1);
    if (diffHours < 24) return `~${diffHours} Hours`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `~${diffDays} Days`;
}

function generate() {
    console.log("Generating Automated Changelog...");
    
    // Get latest commit info
    const latestCommit = runCommand('git log -1 --format="%H|%s|%cI"');
    if (!latestCommit) {
        console.log("No commits found.");
        return;
    }

    const [hash, message, currentDate] = latestCommit.split('|');

    // Get previous commit date to calculate time
    const prevCommitDate = runCommand('git log -2 --format="%cI"').split('\n')[1];
    const timeSpent = calculateTimeSpent(currentDate, prevCommitDate);

    // Get modified files (High-level summary)
    const stats = runCommand(`git show --name-status --format="" ${hash}`);
    
    const dateFormatted = new Date(currentDate).toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    let newEntry = `## [Commit: ${hash.substring(0,7)}] - ${dateFormatted}\n`;
    newEntry += `**Message:** ${message}\n`;
    newEntry += `**Time Tracked Since Last Save:** ${timeSpent}\n\n`;
    newEntry += `### High-Level Summary of Changes:\n`;
    
    if (stats) {
        const files = stats.split('\n').filter(Boolean);
        files.forEach(fileLine => {
            const parts = fileLine.split(/\s+/);
            const status = parts[0];
            const file = parts.slice(1).join(' ');
            
            let statusText = "Modified";
            if (status.startsWith('A')) statusText = "Added";
            if (status.startsWith('D')) statusText = "Deleted";
            if (status.startsWith('R')) statusText = "Renamed";
            
            newEntry += `- **${statusText}:** \`${file}\`\n`;
        });
    } else {
        newEntry += `- No files changed.\n`;
    }
    
    newEntry += `\n---\n\n`;

    // Append to Changelog
    let currentChangelog = "";
    if (fs.existsSync(CHANGELOG_PATH)) {
        currentChangelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    }

    if (currentChangelog.trim() === "") {
        fs.writeFileSync(CHANGELOG_PATH, `# Automated Changelog\n\n${newEntry}`);
    } else {
        // Append to the end of the file instead of prepending
        const newContent = currentChangelog.endsWith('\n') 
            ? `${currentChangelog}\n${newEntry}` 
            : `${currentChangelog}\n\n${newEntry}`;
        fs.writeFileSync(CHANGELOG_PATH, newContent);
    }

    console.log("Changelog successfully updated!");
}

generate();
