# TCP Chat Server

A simple TCP chat server built with Node.js using only the standard library. This server allows multiple users to connect, login with a username, and chat with each other in real-time.

## 📹 Demo Video

**Watch the demo video to see the server in action:**

🔗 [Demo Video - TCP Chat Server](https://www.loom.com/share/3ecae96c493147a5a9ebe2ee4d5b745f)

The video demonstrates:
- Server startup and configuration
- Multiple clients connecting simultaneously
- Real-time messaging between users
- WHO command to list active users
- Private messaging (DM) functionality
- Disconnect notifications

## Features

### Core Features
- ✅ Multiple client support (handles 5-10+ users simultaneously)
- ✅ Login system with username validation
- ✅ Real-time messaging and broadcasting
- ✅ Automatic disconnect notifications
- ✅ Configurable port (via environment variable or command-line argument)

### Optional Features (Bonus)
- ✅ **WHO command** - List all active users
- ✅ **DM command** - Send private messages to specific users
- ✅ **Idle timeout** - Disconnects users after 60 seconds of inactivity
- ✅ **Heartbeat** - Responds to PING with PONG

## 📋 Requirements

- Node.js (version 12.0.0 or higher)
- No external dependencies (uses only Node.js standard library)
- No database required
- No HTTP server needed (pure TCP sockets)

## 🚀 Quick Start

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. No `npm install` needed - uses only standard library!

### Start the Server

```bash
node server.js
```

The server will start on port 4000 by default.

### Connect a Client

Open a new terminal and run:

```bash
node client.js
```

Then login:
```
LOGIN YourUsername
MSG Hello everyone!
```

## ⚙️ Configuration

### Default Port (4000)
```bash
node server.js
```

### Custom Port via Command Line
```bash
node server.js 5000
```

### Custom Port via Environment Variable
The server checks for the `PORT` environment variable first. If not set, it defaults to port 4000.

```bash
# Windows PowerShell
$env:PORT=5000; node server.js

# Windows CMD
set PORT=5000 && node server.js

# Linux/Mac
PORT=5000 node server.js
```

**Priority order:**
1. Environment variable `PORT` (if set)
2. Command line argument (if provided)
3. Default port 4000 (if neither is set)

**Example:**
```bash
# Uses environment variable PORT=5000
$env:PORT=5000; node server.js

# Uses command line argument (5000)
node server.js 5000

# Uses default port (4000)
node server.js
```

The server will start and display:
```
Chat server listening on port 4000
Connect using: nc localhost 4000 or telnet localhost 4000
```

## 🔌 Connecting Clients

### Using Node.js Client (Recommended - Works on All Platforms)

The easiest way to connect is using the included `client.js` script:

```bash
node client.js
```

This will connect to the server on port 4000. You can specify a different port:
```bash
node client.js 5000
```

### Using netcat (nc)
```bash
# Windows (if installed)
nc localhost 4000

# Linux/Mac
nc localhost 4000
```

### Using telnet
```bash
# Windows (may need to enable Telnet Client first)
telnet localhost 4000

# Linux/Mac
telnet localhost 4000
```

## 📝 Protocol Commands

### 1. Login
When you first connect, you must login with a username:
```
LOGIN <username>
```

**Response:**
- `OK` - Login successful
- `ERR username-taken` - Username already in use

**Example:**
```
LOGIN Alice
OK
```

### 2. Send Message
After logging in, send messages to all users:
```
MSG <text>
```

**Broadcast format:** All other users receive: `MSG <username> <text>`

**Example:**
```
MSG Hello everyone!
```
Other users see: `MSG Alice Hello everyone!`

### 3. Private Message (DM)
Send a private message to a specific user:
```
DM <username> <text>
```

**Example:**
```
DM Bob Hey, how are you?
```

### 4. List Active Users (WHO)
Get a list of all connected users:
```
WHO
```

**Response:** `USER <username>` for each connected user

**Example:**
```
WHO
USER Alice
USER Bob
USER Charlie
```

### 5. Heartbeat
The server sends `PING` periodically. You can respond with:
```
PONG
```

Or send `PING` yourself to test connectivity:
```
PING
```
Server responds with: `PONG`

## 💬 Example Interaction

### Terminal 1 (Client 1)
```bash
$ nc localhost 4000
LOGIN Naman
OK
MSG hi everyone!
MSG how are you?
WHO
USER Naman
USER Yudi
DM Yudi Hey there!
```

### Terminal 2 (Client 2)
```bash
$ nc localhost 4000
LOGIN Yudi
OK
MSG hello Naman!
```

### What Client 1 Sees:
```
MSG Yudi hello Naman!
INFO Yudi connected
```

### What Client 2 Sees:
```
MSG Naman hi everyone!
MSG Naman how are you?
MSG Naman (private): Hey there!
```

### When Client 1 Disconnects:
Client 2 sees:
```
INFO Naman disconnected
```

## ⚠️ Error Messages

- `ERR username-taken` - Username is already in use
- `ERR invalid-format` - Command format is incorrect
- `ERR invalid-username` - Username is empty or invalid
- `ERR please-login-first` - Command requires login first
- `ERR user-not-found: <username>` - User not found for DM command
- `ERR unknown-command: <command>` - Unknown command received

## 🔧 Server Behavior

- **Idle Timeout**: Users are automatically disconnected after 60 seconds of inactivity
- **Heartbeat**: Server sends PING every 30 seconds to check client connectivity
- **Clean Disconnects**: When a user disconnects, all other users are notified
- **Username Validation**: Usernames are case-insensitive for uniqueness checks
- **Message Formatting**: Extra spaces and newlines are handled gracefully

## 🧪 Testing

### Test with Multiple Clients

1. Open multiple terminal windows
2. Connect each terminal to the server using `nc localhost 4000` or `telnet localhost 4000`
3. Login with different usernames
4. Send messages and verify they appear in all other clients

### Test Private Messages

1. Connect two clients with usernames "Alice" and "Bob"
2. From Alice, send: `DM Bob Hello!`
3. Verify Bob receives the private message
4. Verify Alice receives confirmation

### Test WHO Command

1. Connect multiple clients
2. From any client, send: `WHO`
3. Verify all usernames are listed


## Project Structure

```
algokart/
├── server.js              # Main server implementation
├── client.js              # Interactive client for testing
├── package.json           # Project configuration
├── README.md              # This file
├── TESTING.md             # Testing guide      
├── env.example            # Environment variables example
└── .gitignore            # Git ignore file
```

## 🏗️ Implementation Details

- Uses Node.js `net` module for TCP socket communication
- Handles multiple concurrent connections using event-driven architecture
- Implements proper cleanup on client disconnect
- Includes error handling for network issues
- Supports graceful server shutdown (Ctrl+C)
- No external dependencies - pure Node.js standard library
- Thread-safe client management using Map data structure
- Automatic heartbeat and idle timeout management



**Note:** This server uses only Node.js standard library - no frameworks, no external dependencies, no HTTP, no database. Pure TCP socket communication.


