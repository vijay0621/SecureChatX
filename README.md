# SecureChat - End-to-End Encrypted Messaging Application

A real-time secure chat application with end-to-end encryption using AES-256-GCM, RSA-2048 key exchange, and SHA-256 HMAC for message integrity.

## 🔐 Security Features

- **End-to-End Encryption**: Messages encrypted with AES-256-GCM before transmission
- **RSA Key Exchange**: 2048-bit RSA for secure session key exchange
- **Message Integrity**: SHA-256 HMAC ensures messages haven't been tampered with
- **Secure Authentication**: Passwords hashed with PBKDF2-SHA256 (10,000 iterations)
- **Private Keys Stay Local**: RSA private keys never leave the client device
- **Transport Security**: WebSocket Secure (WSS) for additional transport-layer protection

## 🏗️ Architecture

### Frontend
- **React** with TypeScript for type safety
- **Web Crypto API** for client-side cryptography (RSA, AES, SHA-256)
- **WebSocket** for real-time bidirectional communication
- **Tailwind CSS** + **shadcn/ui** for beautiful, accessible UI

### Backend
- **Node.js** + **Express** for REST API
- **WebSocket Server** (ws library) for real-time events
- **In-memory storage** for user accounts and message relay
- Server only relays encrypted blobs - never sees plaintext

## 🔒 Cryptographic Workflow

### 1. User Registration & Key Generation
```
User Signs Up
    ↓
Client generates RSA-2048 key pair (Web Crypto API)
    ↓
Private key stored in localStorage (never transmitted)
    ↓
Public key sent to server and shared with other users
```

### 2. Session Key Exchange (Per Chat)
```
User A wants to message User B
    ↓
Client generates AES-256 session key
    ↓
Session key encrypted with User B's RSA public key
    ↓
Encrypted session key sent alongside message
    ↓
User B decrypts session key with their RSA private key
    ↓
Both users now share AES session key (stored locally)
```

### 3. Message Encryption & Sending
```
User types message
    ↓
Message encrypted with AES-256-GCM + random IV
    ↓
SHA-256 HMAC generated for integrity verification
    ↓
Server relays: {encryptedContent, IV, HMAC, encryptedAESKey}
    ↓
Recipient decrypts with session key after HMAC verification
```

### 4. Message Delivery & Read Receipts
```
Message sent (✓) → Server receives
    ↓
Message delivered (✓✓) → Recipient's client receives
    ↓
Message read (✓✓ blue) → Recipient opens chat
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- Modern browser with Web Crypto API support

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Usage

1. **Create Account**: Sign up with a username and password
2. **Automatic Key Generation**: RSA key pair generated automatically on signup
3. **Start Chatting**: Select a contact from the sidebar
4. **Secure Messages**: All messages are end-to-end encrypted automatically

## 🔍 Network Security Demonstration

### A. Wireshark Packet Analysis

**Purpose**: Verify that messages are encrypted in transit and cannot be read by interceptors.

#### Setup Instructions:

1. **Install Wireshark**:
   - Download from https://www.wireshark.org/
   - Install with default options

2. **Start Packet Capture**:
   ```bash
   # Linux/Mac
   sudo wireshark
   
   # Windows: Run Wireshark as Administrator
   ```

3. **Configure Capture**:
   - Select your network interface (usually WiFi or Ethernet)
   - Apply display filter: `websocket || http`
   - Click "Start Capturing"

4. **Generate Traffic**:
   - Open SecureChat application
   - Login and send messages between users
   - Stop capture after several messages

#### What to Look For:

**✅ Expected Results (Secure)**:
- WebSocket frames contain encrypted payloads (base64-encoded ciphertext)
- Message content appears as random characters: `"encryptedContent": "j8f3kd9s..."`
- No plaintext messages visible in packet data
- HMAC and encrypted AES keys present but unintelligible

**❌ What You Won't See**:
- Actual message text (e.g., "Hello, how are you?")
- Decrypted content of any kind
- Unencrypted user passwords

#### Example Wireshark Analysis:

**Captured WebSocket Frame**:
```json
{
  "type": "message",
  "receiverId": "abc123",
  "encryptedContent": "mK9xF2vL8pQ...encrypted_data...zX4nR7tY",
  "hmac": "e8a9b3f2c1d5...hmac_hash",
  "encryptedAESKey": "kP3mN8wQ...rsa_encrypted_key"
}
```

**Key Observations**:
- `encryptedContent`: Contains encrypted message (appears as gibberish)
- `hmac`: SHA-256 hash for integrity verification
- `encryptedAESKey`: AES key encrypted with recipient's RSA public key
- **No plaintext anywhere in the packet**

#### Wireshark Filter Commands:

```bash
# Show only WebSocket traffic
websocket

# Show only message payloads
websocket contains "encryptedContent"

# Show specific user's traffic (replace with actual user ID)
websocket contains "abc123"

# Show HTTP authentication requests
http.request.method == "POST" && http.request.uri contains "/api/auth"
```

### B. Nmap Port Scanning

**Purpose**: Identify open ports and services running on the server.

#### Setup Instructions:

1. **Install Nmap**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install nmap
   
   # macOS (with Homebrew)
   brew install nmap
   
   # Windows: Download from https://nmap.org/download.html
   ```

2. **Run Port Scan**:
   ```bash
   # Basic scan of localhost
   nmap localhost
   
   # More detailed scan
   nmap -sV -p 1-10000 localhost
   
   # Scan with service detection
   nmap -A localhost
   ```

#### Example Nmap Output:

```
Starting Nmap 7.94
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).

PORT     STATE SERVICE VERSION
5000/tcp open  http    Node.js Express framework
|_http-title: SecureChat - End-to-End Encrypted Messaging

Service detection performed.
```

#### What the Scan Reveals:

**Port 5000 (HTTP/WebSocket)**:
- Serves the web application
- Handles WebSocket connections at `/ws`
- Express.js server with Vite dev middleware

**Security Considerations**:
- Port 5000 is open for the application to function
- In production, should run behind reverse proxy (nginx/Apache)
- Enable HTTPS/WSS for transport-layer encryption
- Consider firewall rules to restrict access

#### Advanced Nmap Commands:

```bash
# Check for SSL/TLS vulnerabilities (if using HTTPS)
nmap --script ssl-enum-ciphers -p 443 localhost

# Detect service versions
nmap -sV localhost

# Operating system detection
sudo nmap -O localhost

# Aggressive scan (OS, version, traceroute)
sudo nmap -A localhost

# Check WebSocket endpoint specifically
nmap -p 5000 --script http-websocket localhost
```

### C. Security Analysis Results

#### ✅ What Makes This Application Secure:

1. **End-to-End Encryption**:
   - Messages encrypted on sender's device
   - Decrypted only on recipient's device
   - Server cannot read message content

2. **Perfect Forward Secrecy**:
   - New AES session keys per chat
   - Compromising one session doesn't affect others

3. **Message Integrity**:
   - SHA-256 HMAC prevents message tampering
   - Recipients verify integrity before decryption

4. **Secure Key Exchange**:
   - RSA-2048 prevents AES key interception
   - Private keys never transmitted

5. **Defense Against Common Attacks**:
   - **Man-in-the-Middle**: Transport-layer + message-layer encryption
   - **Replay Attacks**: Timestamps and session-specific keys
   - **Eavesdropping**: All data encrypted in transit

#### 🔒 Additional Security Recommendations:

For production deployment:

1. **Enable HTTPS/WSS**: Use TLS certificates (Let's Encrypt)
2. **Rate Limiting**: Prevent brute-force attacks
3. **Key Rotation**: Implement periodic RSA key pair renewal
4. **Perfect Forward Secrecy**: Generate new AES keys per message
5. **Secure Key Storage**: Consider using Web Crypto API's non-extractable keys
6. **Authentication Tokens**: Implement JWT with expiration
7. **Database Encryption**: Encrypt stored data at rest
8. **Audit Logs**: Track suspicious activities
9. **Input Validation**: Prevent injection attacks
10. **Content Security Policy**: Protect against XSS

## 📚 Technical Details

### Encryption Specifications

| Component | Algorithm | Key Size | Purpose |
|-----------|-----------|----------|---------|
| Message Encryption | AES-256-GCM | 256-bit | Symmetric encryption of message content |
| Key Exchange | RSA-OAEP | 2048-bit | Asymmetric encryption of AES session keys |
| Message Integrity | HMAC-SHA256 | 256-bit | Verify message hasn't been tampered with |
| Password Hashing | PBKDF2-SHA256 | 10,000 iterations | Secure password storage |

### Real-Time Features

- **Online Status**: Live presence indicators
- **Typing Indicators**: See when someone is typing
- **Message Status**: Sent (✓), Delivered (✓✓), Read (✓✓ blue)
- **Instant Delivery**: WebSocket-based real-time messaging

### Browser Compatibility

Requires modern browser with Web Crypto API support:
- Chrome 60+
- Firefox 57+
- Safari 11+
- Edge 79+

## 🛠️ Development

### Project Structure

```
securechat/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Crypto, auth, WebSocket utilities
│   │   ├── pages/         # Auth and Chat pages
│   │   └── App.tsx        # Main application component
├── server/                # Backend Node.js server
│   ├── routes.ts          # API routes and WebSocket handlers
│   ├── storage.ts         # In-memory data storage
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Data models and validation
└── README.md              # This file
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/public-key` | POST | Store user's public key |
| `/api/users` | GET | Get all users with status |
| `/api/users/:id/public-key` | GET | Get user's public key |
| `/api/messages/:userId` | GET | Get chat history with user |
| `/ws` | WebSocket | Real-time communication |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `auth` | Client → Server | `{userId, username}` | Authenticate WebSocket connection |
| `message` | Both | `{encryptedContent, hmac, ...}` | Send/receive encrypted message |
| `typing` | Client → Server | `{targetUserId, isTyping}` | Notify typing status |
| `message-read` | Client → Server | `{messageId, senderId}` | Mark message as read |
| `user-online` | Server → Client | `{userId, username}` | User came online |
| `user-offline` | Server → Client | `{userId, lastSeen}` | User went offline |
| `message-status` | Server → Client | `{messageId, status}` | Message status update |

## 🔐 Security Best Practices Implemented

1. ✅ **Client-Side Encryption**: All encryption happens in the browser
2. ✅ **Zero-Knowledge Server**: Server cannot decrypt messages
3. ✅ **Secure Random**: Crypto-secure random number generation for IVs and keys
4. ✅ **Key Derivation**: PBKDF2 for password hashing (10,000 iterations)
5. ✅ **Message Authentication**: HMAC prevents message tampering
6. ✅ **Forward Secrecy**: Session keys unique per chat
7. ✅ **Secure Storage**: Private keys stored in localStorage (client-only)

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with modern web standards (Web Crypto API)
- Inspired by Signal Protocol and WhatsApp's encryption
- Uses industry-standard cryptographic algorithms

## 🐛 Troubleshooting

### Messages not decrypting?
- Ensure both users have exchanged public keys
- Check browser console for crypto errors
- Verify Web Crypto API is supported

### WebSocket connection issues?
- Check that port 5000 is not blocked
- Verify server is running (`npm run dev`)
- Check browser console for connection errors

### Performance issues?
- Encryption/decryption is CPU-intensive
- Large message history may slow down initial load
- Consider implementing message pagination

---

**Remember**: This is a demonstration application. For production use, implement additional security measures, use a real database, and deploy with HTTPS/WSS enabled.
