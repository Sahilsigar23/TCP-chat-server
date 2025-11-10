const net = require('net');
const readline = require('readline');

// Simple interactive TCP client for testing the chat server
// Usage: node client.js [port]

const port = parseInt(process.argv[2]) || 4000;
const host = 'localhost';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// Create socket connection
const client = net.createConnection(port, host, () => {
  console.log(`Connected to chat server at ${host}:${port}`);
  console.log('Type your commands (LOGIN <username>, MSG <text>, WHO, DM <user> <text>, etc.)');
  console.log('Press Ctrl+C to disconnect\n');
  rl.prompt();
});

let buffer = '';

// Handle incoming data
client.on('data', (data) => {
  buffer += data.toString();
  
  // Process complete lines
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  lines.forEach(line => {
    if (line.trim()) {
      const trimmedLine = line.trim();
      
      // Automatically respond to PING with PONG (heartbeat)
      if (trimmedLine === 'PING') {
        client.write('PONG\n');
        // Don't display PING messages to keep output clean
        return;
      }
      
      // Clear the prompt line and print the message
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      console.log(line);
      rl.prompt();
    }
  });
});

// Handle connection close
client.on('close', () => {
  console.log('\nConnection closed');
  rl.close();
  process.exit(0);
});

// Handle errors
client.on('error', (err) => {
  console.error(`\nConnection error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.error(`Could not connect to ${host}:${port}`);
    console.error('Make sure the server is running!');
  }
  rl.close();
  process.exit(1);
});

// Handle user input
rl.on('line', (input) => {
  const trimmed = input.trim();
  
  if (trimmed) {
    // Send command to server
    client.write(trimmed + '\n');
  }
  
  rl.prompt();
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\nDisconnecting...');
  client.end();
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nDisconnecting...');
  client.end();
});

