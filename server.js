const net = require('net');

// Configuration
const DEFAULT_PORT = 4000;
const IDLE_TIMEOUT = 60000; // 60 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Get port from environment variable, command line argument, or default to 4000
// Priority: 1. Environment variable (PORT), 2. Command line argument, 3. Default (4000)
const port = parseInt(process.env.PORT || process.argv[2] || DEFAULT_PORT, 10);

// Store connected clients
const clients = new Map(); // Map<socket, {username, lastActivity, idleTimer, heartbeatTimer}>

// Server instance
const server = net.createServer((socket) => {
  let username = null;
  let idleTimer = null;
  let heartbeatTimer = null;

  // Helper function to reset idle timer
  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(() => {
      socket.write('INFO You have been disconnected due to inactivity\n');
      socket.end();
    }, IDLE_TIMEOUT);
  };

  // Helper function to setup heartbeat
  const setupHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    heartbeatTimer = setInterval(() => {
      socket.write('PING\n');
    }, HEARTBEAT_INTERVAL);
  };

  // Helper function to cleanup
  const cleanup = () => {
    if (username) {
      // Notify all other users
      broadcast(`INFO ${username} disconnected\n`, socket);
      clients.delete(socket);
      console.log(`${username} disconnected`);
    }
    if (idleTimer) clearTimeout(idleTimer);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  };

  // Handle client disconnect
  socket.on('close', () => {
    cleanup();
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error(`Socket error for ${username || 'unknown'}:`, err.message);
    cleanup();
  });

  // Handle incoming data
  socket.on('data', (data) => {
    resetIdleTimer();
    
    const message = data.toString().trim();
    if (!message) return;

    const parts = message.split(/\s+/);
    const command = parts[0].toUpperCase();

    // Handle PING (heartbeat response)
    if (command === 'PONG') {
      return; // Just acknowledge, no response needed
    }

    // Handle PING (if client sends it)
    if (command === 'PING') {
      socket.write('PONG\n');
      return;
    }

    // If not logged in, only allow LOGIN command
    if (!username) {
      if (command === 'LOGIN') {
        if (parts.length < 2) {
          socket.write('ERR invalid-format\n');
          return;
        }

        const newUsername = parts.slice(1).join(' ').trim();
        
        // Validate username
        if (!newUsername || newUsername.length === 0) {
          socket.write('ERR invalid-username\n');
          return;
        }

        // Check if username is already taken
        const isTaken = Array.from(clients.values()).some(
          client => client.username && client.username.toLowerCase() === newUsername.toLowerCase()
        );

        if (isTaken) {
          socket.write('ERR username-taken\n');
          return;
        }

        // Login successful
        username = newUsername;
        clients.set(socket, { username, lastActivity: Date.now() });
        socket.write('OK\n');
        console.log(`${username} connected`);
        
        // Notify other users
        broadcast(`INFO ${username} connected\n`, socket);
        
        // Setup idle timeout and heartbeat
        resetIdleTimer();
        setupHeartbeat();
      } else {
        socket.write('ERR please-login-first\n');
      }
      return;
    }

    // User is logged in, handle commands
    switch (command) {
      case 'MSG':
        if (parts.length < 2) {
          socket.write('ERR invalid-format\n');
          return;
        }
        const text = parts.slice(1).join(' ').trim();
        if (text) {
          broadcast(`MSG ${username} ${text}\n`, socket);
        }
        break;

      case 'DM':
        if (parts.length < 3) {
          socket.write('ERR invalid-format\n');
          return;
        }
        const targetUsername = parts[1];
        const dmText = parts.slice(2).join(' ').trim();
        
        if (!dmText) {
          socket.write('ERR invalid-format\n');
          return;
        }

        // Find target user
        let targetFound = false;
        for (const [targetSocket, client] of clients.entries()) {
          if (client.username && client.username.toLowerCase() === targetUsername.toLowerCase()) {
            targetSocket.write(`MSG ${username} (private): ${dmText}\n`);
            socket.write(`MSG You (private to ${client.username}): ${dmText}\n`);
            targetFound = true;
            break;
          }
        }

        if (!targetFound) {
          socket.write(`ERR user-not-found: ${targetUsername}\n`);
        }
        break;

      case 'WHO':
        const userList = Array.from(clients.values())
          .filter(client => client.username)
          .map(client => client.username);
        
        if (userList.length === 0) {
          socket.write('INFO No other users connected\n');
        } else {
          userList.forEach(u => {
            socket.write(`USER ${u}\n`);
          });
        }
        break;

      default:
        socket.write(`ERR unknown-command: ${command}\n`);
    }
  });

  // Set encoding
  socket.setEncoding('utf8');
  
  // Initial idle timer
  resetIdleTimer();
});

// Broadcast message to all clients except sender
function broadcast(message, sender) {
  clients.forEach((client, socket) => {
    if (socket !== sender && client.username) {
      socket.write(message);
    }
  });
}

// Start server
server.listen(port, () => {
  console.log(`Chat server listening on port ${port}`);
  console.log(`Connect using: nc localhost ${port} or telnet localhost ${port}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please use a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  clients.forEach((client, socket) => {
    socket.write('INFO Server is shutting down\n');
    socket.end();
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

