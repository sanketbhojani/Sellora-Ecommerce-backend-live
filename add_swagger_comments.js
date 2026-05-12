import fs from 'fs';
import path from 'path';

const routesDir = './routes';

const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js') && file !== 'router.js');

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Tag name based on file name
    const tagName = file.replace('.js', '');
    const capitalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    
    const lines = content.split('\n');
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Check if the line is a router definition
        const match = line.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
        
        if (match) {
            const method = match[1];
            const routePath = match[2].replace(/:([a-zA-Z0-9_]+)/g, '{$1}'); // convert :id to {id}
            
            // Check if there is already a swagger comment above it
            let hasComment = false;
            for(let j = 1; j <= 5; j++) {
                if (i - j >= 0 && lines[i - j].includes('@swagger')) {
                    hasComment = true;
                    break;
                }
            }
            
            if (!hasComment) {
                // Generate comment
                const comment = `
/**
 * @swagger
 * /${tagName}${routePath === '/' ? '' : routePath}:
 *   ${method}:
 *     summary: ${method.toUpperCase()} ${routePath}
 *     tags: [${capitalizedTag}]
 *     responses:
 *       200:
 *         description: Success
 */`;
                newLines.push(comment.trim());
            }
        }
        newLines.push(line);
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Added comments to ${file}`);
});
