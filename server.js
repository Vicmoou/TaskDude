require('dotenv').config({ path: './ai.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('./'));

// Helper function to format task context efficiently
function formatTaskContext(taskContext) {
    if (!taskContext) return '';
    
    const context = [];
    if (taskContext.totalTasks) context.push(`Total tasks: ${taskContext.totalTasks}`);
    if (taskContext.todayTasks) context.push(`Today's tasks: ${taskContext.todayTasks}`);
    if (taskContext.highPriorityTasks) context.push(`High priority: ${taskContext.highPriorityTasks}`);
    if (taskContext.mediumPriorityTasks) context.push(`Medium priority: ${taskContext.mediumPriorityTasks}`);
    if (taskContext.lowPriorityTasks) context.push(`Low priority: ${taskContext.lowPriorityTasks}`);
    if (taskContext.completedTasks) context.push(`Completed: ${taskContext.completedTasks}`);
    
    return context.join(', ');
}

// Simple response generator
function generateResponse(query, taskContext) {
    const formattedContext = formatTaskContext(taskContext);
    
    // Convert query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Basic response patterns
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
        return `Hi! I can see you have ${taskContext.totalTasks || 0} tasks.`;
    }
    
    if (lowerQuery.includes('today')) {
        const todayTasks = taskContext.todayTasks || 0;
        if (todayTasks === 0) {
            return "You don't have any tasks scheduled for today.";
        }
        return `You have ${todayTasks} task${todayTasks === 1 ? '' : 's'} due today.`;
    }
    
    if (lowerQuery.includes('priority')) {
        const high = taskContext.highPriorityTasks || 0;
        const medium = taskContext.mediumPriorityTasks || 0;
        const low = taskContext.lowPriorityTasks || 0;
        return `You have ${high} high priority, ${medium} medium priority, and ${low} low priority tasks.`;
    }
    
    if (lowerQuery.includes('last week')) {
        return "I don't have information about last week's tasks.";
    }
    
    if (lowerQuery.includes('help')) {
        return "I can tell you about your tasks, their priorities, and what's due today.";
    }
    
    if (lowerQuery.includes('what') && lowerQuery.includes('task')) {
        const total = taskContext.totalTasks || 0;
        const today = taskContext.todayTasks || 0;
        const completed = taskContext.completedTasks || 0;
        return `You have ${total} total tasks, with ${today} due today and ${completed} completed.`;
    }
    
    // Default response
    return `I can help you with your tasks. You have ${taskContext.totalTasks || 0} tasks in total. What would you like to know about them?`;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { query, taskContext } = req.body;
        console.log('Received query:', query);
        
        const response = generateResponse(query, taskContext);
        console.log('Response:', response);
        
        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            response: "I'm having trouble processing your request. Please try again."
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 