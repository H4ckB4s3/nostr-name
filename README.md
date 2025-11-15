# Nostr.Name - DNS-Based Identity Bridge


## 1. Introduction
Nostr.Name bridges DNS and HNS domains with Nostr through TXT records, transforming HNS TLDs into NIP-05 compatible identities while serving as a comprehensive contact directory for complete digital profiles including socials, wallets, and communication channels across both naming systems.

**For DNS domains**: The platform functions as a NIP-21 compliant contact directory, allowing traditional domains to serve as Nostr identities with full redirect support.

*For HNS TLDs**: Besides the basic DNS functionality, HNS provides enhanced functionality by creating NIP-05 compatible subdomains under `.nostr.name` (e.g., `yourname@yourtld.nostr.name`), while maintaining NIP-21 redirect capabilities (e.g., `https://yourtld.nostr.name`).

This dual approach preserves the accessibility of traditional DNS while leveraging HNS's decentralized nature for enhanced Nostr integration, creating a seamless identity bridge across both naming systems.

## 2. System Overview
Nostr.Name operates as a lightweight, experimental Web2 bridge that resolves HNS TLDs to Nostr identities. It leverages TXT records, stored either onchain (via the HNS blockchain) or offchain (via supported platforms or your own Nameservers), to map a user's Nostr public key (npub) to their HNS TLD. The system is fully compliant with:

- **NIP-05**: Nostr's standard for mapping human-readable identifiers to Nostr public keys. (HNS TLD only)
- **NIP-21**: Nostr's URI scheme for linking to user profiles or events.

### Key Features:
- Find and Save Nostr users in the directory saved on local storage (easy import/backup/clear)
- Visiting `yourtld.nostr.name` redirects users to their Nostr profile (if a NIP-21-compatible client is installed)
- Displays a webpage containing the associated npub and data when no compatible client is detected
- Generates a JSON file (`yourtld.nostr.name/.well-known/nostr.json`) containing the npub in HEX format for NIP-05 compatibility

## 3. Setup Instructions
To associate domain with a Nostr identity, users must configure TXT records in DNS manager. Supported platforms include Namebase.io, Shakestation.io, HNS.ID, own nameserver, and Bobwallet.io.

### 3.1. Basic Configuration
1. **Create a TXT Record**:
   - Type: `TXT`
   - Name: `@`
   - Value: `nostr:yournpubhere`
   > **Note**: No spaces, `nostr:` prefix is mandatory

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
1. User 1:

   - TXT Record 1: @ → nostr:npub1

   - TXT Record 2: @ → nostrname:name1

   > **Result**: `name1@yourtld.nostr.name`


**Example Configuration**:
2. User 2:

   - TXT Record 1: @ → nostr1:npub2

   - TXT Record 2: @ → nostrname1:name2

 > **Result**: `name2@yourtld.nostr.name`


Additional users follow the pattern `nostrX:npubX` and `nostrnameX:nameX`.

### 3.4. Add Profile Picture, Socials and Wallets

Enhance your domain identity by adding profile information, social media links, and cryptocurrency wallets through additional TXT records.

#### Setup Instructions
1. Navigate to your domain manager (e.g., Shakestation, Namebase, etc.)
2. Add a new TXT record with the following configuration:
   - **Type**: TXT
   - **Name**: @
   - **Value/Data**: `<prefix>:<value>` (e.g., `link:example.com`)

#### Available Prefixes

**Profile**
- `pfp:<url>` - Profile picture URL (e.g., `pfp:example.com/img.png`)
  
**Communication**
- `mail:<email>` - Email address
- `tel:<number>` - Phone number
- `tb:<username>` - Thunderbolt identifier
- `sx:<contactcode>` - SimpleX Chat
- `matrix:<username>` - Matrix username
- `sn:<number>` - Signal profile
- `wa:<number>` - WhatsApp
- `tg:<username>` - Telegram

**Web**
- `link:<url>` - Redirect to a webpage
- `ens:<url>` - Link to Ethereum Name Service (Web2 bridge)
- `onion:<url>` - Link to Onion address (Tor browser need to resolve)
- `ipfs:<url>` - Link to IPFS content (Web2 bridge)
- `pk:<url>` - pkdns page

**Social Media**
- `x:<username>` - X (formerly Twitter) profile
- `nostr:<npub>` - Nostr public key
- `gh:<username>` - GitHub profile/repo
- `bsky:<username>` - Bluesky profile
- `ig:<username>` - Instagram profile
- `fb:<username>` - Facebook profile

**Media Platforms**
- `rumble:<channelname>` - Rumble channel/URL
- `yt:<username>` - YouTube channel/URL

**Cryptocurrency Wallets**
- `btc:<address>` - Bitcoin
- `ln:<address>` - Lightning Network
- `hns:<address>` - Handshake
- `xmr:<address>` - Monero
- `eth:<address>` - Ethereum
- `zec:<address>` - Zcash
- `bat:<address>` - Basic Attention Token

*Additional supported wallets: aave, ada, algo, apt, atom, avax, bch, bgb, bnb, chainlink, cro, dai, doge, dot, ena, etc, fil, gt, hbar, hype, icp, jup, kas, leo, ltc, mnt, near, okb, om, ondo, op, pepe, pi, pol, render, shib, sol, sui, tao, tia, ton, trx, uni, usdc, usde, usdt, vet, xlm, xrp*

**External Records**
- `ext:<url>` - Fetch TXT records from an external TLD or SLD (HNS/ICANN)

After configuration, visit `https://yourtld.nostr.name` or search for your domain on the index page: `https://nostr.name`

## 4. Technical Details
### 4.1. TXT Record Structure
- **Onchain**: Stored directly on the HNS blockchain (immutable, decentralized)
- **Offchain**: Hosted by supported platforms (faster propagation)

### 4.2. JSON Output NIP-05
Generated JSON file contains the npub in HEX format, accessible via:
https://yourtld.nostr.name/.well-known/nostr.json


### 4.3. Redirection and Display
- **NIP-21-Compatible Clients**: Auto-redirect to Nostr profile
- **Non-Compatible Browsers**: Displays webpage with:
  - npub for manual copying
  - Associated social data
  - Wallet addresses linked to the domain

