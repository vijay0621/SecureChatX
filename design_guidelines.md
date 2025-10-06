# Design Guidelines: Secure Chat Application

## Design Approach: Reference-Based (Messaging Leaders)

**Primary References**: WhatsApp, Telegram, Signal  
**Design Philosophy**: Function-first messaging interface with clear visual hierarchy, instant readability, and security transparency. Prioritize conversation flow and real-time feedback over decorative elements.

**Core Principles**:
- Conversation-centric layout with minimal chrome
- Instant visual feedback for all real-time events
- Security indicators integrated naturally into UI
- Clear sender/receiver message distinction
- Distraction-free reading experience

---

## Color Palette

### Light Mode
- **Background**: 235 18% 96% (soft warm gray)
- **Surface**: 0 0% 100% (white)
- **Chat Background**: 45 15% 92% (subtle beige, WhatsApp-inspired)
- **Primary Brand**: 142 70% 45% (secure green, encryption trust)
- **Sender Bubble**: 142 70% 45% (primary green)
- **Receiver Bubble**: 0 0% 100% (white)
- **Text Primary**: 0 0% 13%
- **Text Secondary**: 0 0% 45%
- **Border/Divider**: 0 0% 88%

### Dark Mode
- **Background**: 220 13% 12%
- **Surface**: 220 13% 16%
- **Chat Background**: 220 13% 14%
- **Primary Brand**: 142 60% 55% (adjusted green)
- **Sender Bubble**: 142 50% 35% (darker green)
- **Receiver Bubble**: 220 13% 20%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 65%
- **Border/Divider**: 220 10% 25%

### Status Indicators
- **Online**: 142 70% 45%
- **Typing**: 142 70% 45%
- **Delivered**: 0 0% 60%
- **Read**: 214 100% 50% (blue checkmarks)
- **Encryption Active**: 142 70% 45%

---

## Typography

**Font Families**: System font stack for optimal performance  
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, sans-serif`

**Hierarchy**:
- **App Title/Branding**: 600 weight, 1.25rem
- **Contact Names**: 500 weight, 1rem
- **Message Text**: 400 weight, 0.9375rem (15px)
- **Timestamps**: 400 weight, 0.75rem, secondary color
- **Status Text**: 400 weight, 0.8125rem
- **Input Text**: 400 weight, 0.9375rem

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 3, 4, 6, 8** for consistent rhythm  
- Tight spacing: `p-2`, `gap-2` (status indicators, inline elements)
- Standard spacing: `p-4`, `gap-4` (message bubbles, list items)
- Section spacing: `p-6`, `gap-6` (panel headers, major sections)
- Large spacing: `p-8` (empty states, onboarding)

**Grid Structure**:
- **Sidebar**: Fixed 320px width (contact list)
- **Chat Area**: Flexible `flex-1`
- **Message Bubbles**: Max-width 65% of chat area
- **Mobile**: Full-width stack, slide transitions between views

---

## Component Library

### 1. Authentication Screens
- **Centered card layout**: max-w-md, rounded-lg, elevated shadow
- **Logo/Branding**: Top center with encryption shield icon
- **Form Fields**: Rounded inputs, clear labels, password strength indicator
- **CTA Button**: Full-width primary green, 44px height
- **Security Badge**: Small "End-to-End Encrypted" indicator at bottom

### 2. Contact Sidebar
- **Header**: User profile with online status dot, settings icon
- **Search Bar**: Rounded, subtle background, search icon
- **Contact List Items**:
  - Avatar (40px circle) with online status indicator
  - Name (bold), last message preview (truncated)
  - Timestamp (top-right), unread badge (green circle)
  - Hover state: subtle background change

### 3. Chat Header
- **Left**: Contact avatar + name + status ("online" / "typing..." / "last seen")
- **Right**: Encryption status icon (green lock), info icon
- **Background**: Surface color with bottom border
- **Height**: 64px fixed

### 4. Message Bubbles
- **Sender (Right-aligned)**:
  - Background: Primary green
  - Text: White
  - Rounded: `rounded-2xl rounded-br-sm` (tail effect)
  - Padding: `px-4 py-2`
  - Max-width: 65%
  
- **Receiver (Left-aligned)**:
  - Background: White (light) / Dark surface (dark)
  - Text: Primary text color
  - Rounded: `rounded-2xl rounded-bl-sm`
  - Same padding and max-width

- **Timestamp + Status**: Below bubble, small text, right-aligned for sender
- **Read Receipts**: Double checkmark icon, blue when read
- **Encryption Indicator**: Small lock icon in message context menu

### 5. Message Input Area
- **Container**: Fixed bottom, background matches surface
- **Input Field**: 
  - Rounded-full, flexible width
  - Padding: `px-6 py-3`
  - Min-height: 44px, grows with content (max 120px)
- **Attachment Icon**: Left side, subtle gray
- **Send Button**: Right side, primary green circle with arrow icon
- **Typing Indicator**: Above input when other user typing (animated dots)

### 6. Status Indicators
- **Online Dot**: 8px circle, absolute positioned on avatar (bottom-right)
- **Typing Bubble**: Three animated dots in receiver bubble style
- **Checkmarks**: 
  - Single: Message sent
  - Double gray: Delivered
  - Double blue: Read
- **Encryption Badge**: Small green lock icon with "End-to-End Encrypted" text

### 7. Empty States
- **No Chat Selected**: Center illustration + "Select a contact to start chatting"
- **No Messages**: Center "Start secure conversation" with encryption info
- **No Contacts**: "Add contacts to begin" with action button

### 8. Security Panel (Info View)
- **Encryption Status**: Large green shield icon
- **Key Fingerprint**: Monospace QR code or hex display
- **Security Details**: "Messages are secured with AES-256-GCM"
- **Network Info Button**: Opens Wireshark/Nmap demonstration

---

## Navigation & Interaction

- **No traditional navbar**: Chat-focused full-screen layout
- **Back button**: Mobile only, top-left to return to contact list
- **Swipe gestures**: Mobile swipe-right to go back
- **Keyboard shortcuts**: ESC to close panels, Enter to send

---

## Animations

**Minimal, purposeful animations only**:
- Message send: Slide up + fade in (150ms)
- Typing indicator: Pulsing dots (800ms loop)
- Online status: Fade transition (200ms)
- Read receipts: Color change (300ms)
- Panel transitions: Slide (250ms ease-out)

**No animations on**: Scrolling, hover states, background elements

---

## Images

**No hero images** - This is a utility application.

**Avatar Images**:
- User avatars: 40px (list), 48px (header), 120px (profile)
- Placeholder: Colored circle with initials (Material Design style)
- Position: Throughout contact list, chat headers, profiles

**Security Icons**:
- Lock icon for encryption status
- Shield icon for security panels
- Checkmark icons for delivery status
- Use Heroicons via CDN for all UI icons

---

## Accessibility

- All form inputs maintain dark mode theming consistency
- Minimum 44px touch targets for mobile
- High contrast ratios for text (WCAG AA)
- Status indicators use both color and icons
- Keyboard navigation throughout
- Screen reader labels for all interactive elements
- Focus visible states on all inputs and buttons