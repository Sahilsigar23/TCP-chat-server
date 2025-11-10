# Testing Guide for TCP Chat Server

## Quick Start Testing

### Step 1: Start the Server

Open a terminal and run:
```bash
node server.js
```

You should see:
```
Chat server listening on port 4000
Connect using: nc localhost 4000 or telnet localhost 4000
```

### Step 2: Connect Multiple Clients

Open **2-3 additional terminal windows** and connect to the server:

**Terminal 2 (Client 1):**
```bash
node client.js
```

**Terminal 3 (Client 2):**
```bash
node client.js
```

**Terminal 4 (Client 3 - optional):**
```bash
node client.js
```

> **Note:** This uses the Node.js client script (`client.js`) which works on all platforms including Windows. If you prefer, you can also use `telnet localhost 4000` (if enabled) or `nc localhost 4000` (if installed).

## Testing Scenarios

### Test 1: Basic Login and Messaging

**In Terminal 2:**
```
LOGIN Alice
OK
MSG Hello everyone!
```

**In Terminal 3:**
```
LOGIN Bob
OK
MSG Hi Alice!
```

**Expected Result:**
- Terminal 2 should see: `MSG Bob Hi Alice!`
- Terminal 3 should see: `MSG Alice Hello everyone!`

### Test 2: Username Validation

**In Terminal 2:**
```
LOGIN Alice
OK
```

**In Terminal 3:**
```
LOGIN Alice
ERR username-taken
```

**In Terminal 3 (try again):**
```
LOGIN Bob
OK
```

### Test 3: WHO Command

**In Terminal 2 (after logging in as Alice):**
```
WHO
```

**Expected Result:**
```
USER Alice
USER Bob
```

### Test 4: Private Messages (DM)

**In Terminal 2 (Alice):**
```
DM Alice This is a private message
```

**Expected Result:**
- Terminal 2 (Alice) sees: `MSG You (private to Bob): This is a private message`
- Terminal 3 (Bob) sees: `MSG Alice (private): This is a private message`
- Terminal 4 (if connected) should NOT see this message

### Test 5: Disconnect Notification

**In Terminal 2 (Alice):**
- Close the terminal or press `Ctrl+C`

**Expected Result:**
- Terminal 3 (Bob) sees: `INFO Alice disconnected`

### Test 6: Heartbeat (PING/PONG)

**In Terminal 2:**
```
PING
```

**Expected Result:**
```
PONG
```

The server also sends PING automatically every 30 seconds. You can respond with `PONG` (though it's optional).

### Test 7: Idle Timeout

**In Terminal 2:**
- Login and then don't send any messages for 60 seconds

**Expected Result:**
- After 60 seconds, you should see: `INFO You have been disconnected due to inactivity`
- Connection closes automatically

### Test 8: Multiple Users Chatting

Connect 3-4 clients and have them all chat simultaneously:

**Terminal 2 (Alice):**
```
LOGIN Alice
OK
MSG Hello!
```

**Terminal 3 (Bob):**
```
LOGIN Bob
OK
MSG Hey Alice!
```

**Terminal 4 (Charlie):**
```
LOGIN Charlie
OK
MSG Hi everyone!
```

**Expected Result:**
- All clients should see messages from all other users
- Messages appear in real-time

## Using the Node.js Client (Recommended for Windows)

The easiest way to test on Windows is using the included `client.js` script:

```bash
node client.js
```

This will connect to the server on port 4000. You can specify a different port:
```bash
node client.js 5000
```

The client provides an interactive prompt where you can type commands:
- `LOGIN <username>` - Login with a username
- `MSG <text>` - Send a message to all users
- `WHO` - List all active users
- `DM <username> <text>` - Send a private message
- `PING` - Test connection

## Alternative: Using Telnet (Windows)

If you prefer, you can enable and use `telnet`:

1. Enable Telnet Client:
   - Open "Turn Windows features on or off"
   - Check "Telnet Client"
   - Click OK

2. Connect:
```bash
telnet localhost 4000
```

## Alternative: Using netcat (nc)

If you have `nc` installed:
```bash
nc localhost 4000
```

## Common Issues

### Port Already in Use
If you see "Port 4000 is already in use":
- Change the port: `node server.js 5000`
- Or kill the process using port 4000

### Connection Refused
- Make sure the server is running first
- Check if the port number is correct
- Verify firewall settings

### No Response from Server
- Check server terminal for error messages
- Verify you're connected (you should see the login prompt)
- Try reconnecting

## Screen Recording Tips

For your screen recording:

1. **Show the server terminal** - Start the server
2. **Open 2-3 client terminals** - Show them connecting
3. **Demonstrate login** - Show different usernames
4. **Show real-time messaging** - Type messages in one terminal, show them appearing in others
5. **Show WHO command** - List active users
6. **Show DM** - Send a private message
7. **Show disconnect** - Close one client and show the notification in others

Keep the recording to 1-2 minutes as required!

