# SecureChat - End-to-End Encrypted Messaging Application

## Overview

SecureChat is a real-time secure messaging application that provides end-to-end encryption using industry-standard cryptographic protocols. The application uses AES-256-GCM for message encryption, RSA-2048 for secure key exchange, and SHA-256 HMAC for message integrity verification. Messages are encrypted on the sender's device and can only be decrypted by the intended recipient, with the server acting purely as a relay for encrypted data blobs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **TanStack Query (React Query)** for server state management and data fetching
- **Tailwind CSS** with **shadcn/ui** component library for UI design

**Design Philosophy:**
- Conversation-centric messaging interface inspired by WhatsApp, Telegram, and Signal
- Function-first approach prioritizing readability and real-time feedback
- Security indicators naturally integrated into the UI
- Support for both light and dark themes

**Cryptographic Implementation:**
- All cryptography performed client-side using **Web Crypto API**
- RSA-2048 key pair generation during user registration
- Private keys stored exclusively in browser localStorage (never transmitted)
- AES-256-GCM session keys generated per chat session
- SHA-256 HMAC for message integrity verification

**Client-Side Key Management:**
- RSA key pairs generated on signup and stored in localStorage
- Session keys (AES) cached per recipient to avoid regeneration overhead
- Public keys exchanged through server but private keys never leave the client
- Encryption/decryption workflow isolated in dedicated crypto utility modules

### Backend Architecture

**Technology Stack:**
- **Node.js** with **Express** for REST API endpoints
- **WebSocket Server** (ws library) for real-time bidirectional communication
- **TypeScript** for type safety across the entire stack

**Design Approach:**
- **Zero-knowledge architecture**: Server never sees plaintext messages
- **In-memory storage** for user accounts, online status, and message relay
- Server acts as a dumb relay, forwarding encrypted blobs between authenticated clients
- No persistent message storage on server (messages stored client-side only)

**Authentication:**
- Username/password authentication with PBKDF2-SHA256 hashing (10,000 iterations)
- Salt generated per user for password security
- UUID-based session tokens for authenticated requests

**Real-Time Features:**
- WebSocket connections for instant message delivery
- Online/offline status tracking with last seen timestamps
- Typing indicators broadcast to relevant chat participants
- Message delivery and read receipts

### Data Flow

**Message Encryption Flow:**
1. Sender generates or retrieves AES-256 session key for recipient
2. Message encrypted with AES-256-GCM, producing ciphertext and IV
3. HMAC-SHA256 generated over ciphertext for integrity
4. Session key encrypted with recipient's RSA public key
5. Encrypted bundle (ciphertext, IV, HMAC, encrypted session key) sent via WebSocket

**Message Decryption Flow:**
1. Recipient receives encrypted bundle
2. Encrypted session key decrypted using recipient's RSA private key
3. HMAC verified to ensure message integrity
4. Ciphertext decrypted with AES-256-GCM using session key and IV
5. Plaintext message displayed in UI

**User Registration:**
1. Client collects username and password
2. RSA-2048 key pair generated in browser
3. Private key stored in localStorage
4. Public key and hashed credentials sent to server
5. Server stores public key for key exchange with other users

### Security Architecture

**Cryptographic Standards:**
- **AES-256-GCM**: Symmetric encryption with authenticated encryption mode
- **RSA-2048 with OAEP padding**: Asymmetric key exchange with SHA-256 hash
- **HMAC-SHA256**: Message authentication codes for integrity
- **PBKDF2-SHA256**: Password hashing with 10,000 iterations and unique salt per user

**Security Guarantees:**
- End-to-end encryption: Only sender and recipient can decrypt messages
- Perfect forward secrecy: Session keys unique per chat session
- Message integrity: HMAC verification prevents tampering
- Transport security: WebSocket Secure (WSS) for production deployments

**Threat Model:**
- Server compromise does not reveal message contents (zero-knowledge design)
- Man-in-the-middle attacks mitigated by RSA key exchange and HMAC
- Replay attacks prevented through HMAC and timestamp verification
- Client-side storage isolation prevents cross-user key access

## External Dependencies

### UI Component Library
- **shadcn/ui**: Radix UI primitives with Tailwind CSS styling for accessible components
- **Radix UI**: Headless UI components (dialogs, dropdowns, popovers, etc.)
- **Lucide React**: Icon library for consistent iconography

### State Management & Data Fetching
- **TanStack Query (React Query)**: Server state management, caching, and data synchronization

### Real-Time Communication
- **ws (WebSocket library)**: Native WebSocket implementation for Node.js server
- **Browser WebSocket API**: Client-side WebSocket connections for real-time events

### Form Handling & Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and API requests
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Styling & Theming
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwindcss-animate**: Animation utilities for Tailwind

### Cryptography
- **Web Crypto API**: Browser-native cryptographic operations (RSA, AES, SHA)
- **Node.js Crypto Module**: Server-side password hashing (PBKDF2) and random UUID generation

### Database & ORM
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL
- **@neondatabase/serverless**: PostgreSQL client for Neon serverless database
- **drizzle-zod**: Schema validation integration between Drizzle and Zod

**Note:** While Drizzle is configured for PostgreSQL in the codebase, the current implementation uses in-memory storage. The database configuration is present for future persistence requirements.

### Date/Time Utilities
- **date-fns**: Date formatting and manipulation for timestamps and "last seen" displays

### Development Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static type checking across client and server
- **ESBuild**: Fast JavaScript bundler for production builds