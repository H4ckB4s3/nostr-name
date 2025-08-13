# Nostr.Name

## An Experimental Web2 Bridge for HNS TLDs and Nostr Protocol
Nostr.Name introduces an experimental framework to bridge Handshake (HNS) Top-Level Domains (TLDs) with the Nostr protocol, enabling decentralized identity and social connectivity through TXT records stored onchain or offchain. Compliant with NIP-05 and NIP-21 standards, Nostr.Name leverages the immutability and accessibility of HNS TLDs to map Nostr public keys (npub) to human-readable domain-based identities. This system facilitates seamless integration with Nostr-compatible clients by combining decentralized domain ownership with Nostr's censorship-resistant communication protocol.

## 1. Introduction
The Handshake Naming System (HNS) provides a decentralized alternative to traditional DNS, enabling users to own and manage TLDs on a blockchain. Nostr, a simple, open protocol for censorship-resistant social networking, utilizes public-key cryptography to ensure secure and verifiable communication. Nostr.Name bridges these ecosystems, allowing HNS TLD owners to associate their domains with Nostr identities via TXT records, creating resolvable, domain-based Nostr usernames (e.g., `yourname@yourtld.nostr.name`).

## 2. System Overview
Nostr.Name operates as a lightweight, experimental Web2 bridge that resolves HNS TLDs to Nostr identities. It leverages TXT records, stored either onchain (via the HNS blockchain) or offchain (via supported platforms or your own Nameservers), to map a user's Nostr public key (npub) to their HNS TLD. The system is fully compliant with:

- **NIP-05**: Nostr's standard for mapping human-readable identifiers to Nostr public keys.
- **NIP-21**: Nostr's URI scheme for linking to user profiles or events.

### Key Features:
- Visiting `yourtld.nostr.name` redirects users to their Nostr profile (if a NIP-21-compatible client is installed)
- Displays a webpage containing the associated npub, social data, and wallet addresses when no compatible client is detected
- Generates a JSON file (`yourtld.nostr.name/.well-known/nostr.json`) containing the npub in HEX format for NIP-05 compatibility

## 3. Setup Instructions
To associate an HNS TLD with a Nostr identity, users must configure TXT records in their HNS TLD manager. Supported platforms include Namebase.io, Shakestation.io, HNS.ID, own nameserver, and Bobwallet.io.

### 3.1. Basic Configuration
1. **Create a TXT Record**:
   - Type: `TXT`
   - Name: `@`
   - Value: `nostr:yournpubhere` (no spaces, `nostr:` prefix is mandatory)

2. **Propagation**:
   - Offchain TXT records provide instant results
   - Onchain records require blockchain confirmation time (more robust for sovereignty and censorship resistance)

   > **Note**: Avoid using nameservers in conjunction with TXT records stored on-chain to maintain security and decentralization.

3. **Result**:
   - The domain `yourtld.nostr.name` becomes active
   - Generates JSON file at `yourtld.nostr.name/.well-known/nostr.json` (converts npub to HEX format)
   - Usable as `yourtld@yourtld.nostr.name` in NIP-05-compatible clients

### 3.2. Advanced Configuration
To customize the username portion of the NIP-05 identifier (e.g., `myname@yourtld.nostr.name`):

1. Add an additional TXT record:
   - Type: `TXT`
   - Name: `@`
   - Value: `nostrname:myname`

### 3.3. Multi-User Support
Nostr.Name supports multiple users per HNS TLD using prefixed TXT record pairs:

**Example Configuration**:
User 1:

TXT Record 1: @ → nostr:npub1

TXT Record 2: @ → nostrname:name1

Result: `name1@yourtld.nostr.name`

**Example Configuration**:
User 2:

TXT Record 1: @ → nostr1:npub2

TXT Record 2: @ → nostrname1:name2

Result: `name2@yourtld.nostr.name`


Additional users follow the pattern `nostrX:npubX` and `nostrnameX:nameX`.

## 4. Technical Details
### 4.1. TXT Record Structure
- **Onchain**: Stored directly on the HNS blockchain (immutable, decentralized)
- **Offchain**: Hosted by supported platforms (faster propagation)
  
**Formats**:
- `nostr:npub` - links domain to Nostr public key
- `nostrname:name` - defines custom username for NIP-05
- Sequential prefixes (`nostrX:`, `nostrnameX:`) enable multi-user configs

### 4.2. JSON Output
Generated JSON file contains the npub in HEX format, accessible via:
https://yourtld.nostr.name/.well-known/nostr.json


### 4.3. Redirection and Display
- **NIP-21-Compatible Clients**: Auto-redirect to Nostr profile
- **Non-Compatible Browsers**: Displays webpage with:
  - npub for manual copying
  - Associated social data
  - Wallet addresses linked to the domain

## 5. Use Cases
- **Decentralized Identity**: Verifiable, human-readable Nostr identities via HNS TLDs
- **Social Networking**: Seamless username integration with Nostr clients
- **Multi-User Domains**: Organizations can manage multiple Nostr identities under one HNS TLD

