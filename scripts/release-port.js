const { exec } = require('child_process');

const targetPort = process.argv[2] || 3000;

const command = process.platform === 'win32'
    ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${targetPort}') do taskkill /f /pid %a`
    : `lsof -i :${targetPort} | grep LISTEN | awk '{print $2}' | xargs kill -9`;

exec(command, (err, stdout, stderr) => {
    if (err) {
        // It's okay if no process was found to kill
        return;
    }
    console.log(`Cleared port ${targetPort}.`);
});
