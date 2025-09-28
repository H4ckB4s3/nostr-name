const http = require('http');
const https = require('https');
const url = require('url');

// 🔹 Keep-alive HTTPS agent
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

// Cache storage
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

// --- Bech32 & hex conversion ---
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
    ALPHABET_MAP[ALPHABET.charAt(z)] = z;
}

function polymodStep(pre) {
    const b = pre >> 25;
    return (((pre & 0x1ffffff) << 5) ^
        (-((b >> 0) & 1) & 0x3b6a57b2) ^
        (-((b >> 1) & 1) & 0x26508e6d) ^
        (-((b >> 2) & 1) & 0x1ea119fa) ^
        (-((b >> 3) & 1) & 0x3d4233dd) ^
        (-((b >> 4) & 1) & 0x2a1462b3));
}

function prefixChk(prefix) {
    let chk = 1;
    for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (c >> 5);
    }
    chk = polymodStep(chk);
    for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (v & 0x1f);
    }
    return chk;
}

function convertbits(data, inBits, outBits, pad) {
    let value = 0;
    let bits = 0;
    const maxV = (1 << outBits) - 1;
    const result = [];
    for (let i = 0; i < data.length; ++i) {
        value = (value << inBits) | data[i];
        bits += inBits;
        while (bits >= outBits) {
            bits -= outBits;
            result.push((value >> bits) & maxV);
        }
    }
    if (pad) {
        if (bits > 0) {
            result.push((value << (outBits - bits)) & maxV);
        }
    } else {
        if (bits >= inBits) return 'Excess padding';
        if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
    }
    return result;
}

function fromWords(words) {
    const res = convertbits(words, 5, 8, false);
    if (Array.isArray(res)) return res;
    throw new Error(res);
}

function getLibraryFromEncoding(encoding) {
    const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
    function decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        const lowered = str.toLowerCase();
        str = lowered;
        const split = str.lastIndexOf('1');
        const prefix = str.slice(0, split);
        const wordChars = str.slice(split + 1);
        let chk = prefixChk(prefix);
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
            const c = wordChars.charAt(i);
            const v = ALPHABET_MAP[c];
            chk = polymodStep(chk) ^ v;
            if (i + 6 >= wordChars.length) continue;
            words.push(v);
        }
        return { prefix, words };
    }
    return { decode };
}

const bech32 = getLibraryFromEncoding('bech32');

function hex_encode(buf) {
    let str = "";
    for (let i = 0; i < buf.length; i++) {
        str += buf[i].toString(16).padStart(2, '0');
    }
    return str;
}

function bech32ToHex(bech) {
    try {
        const decoded = bech32.decode(bech);
        const bytes = fromWords(decoded.words);
        return hex_encode(bytes);
    } catch (e) {
        return bech; // fallback: return as is if invalid
    }
}

// --- DNS fetch ---
async function fetchNostrData(subdomain) {
    const queryDomain = `${subdomain}`;
    const dnsUrl = `https://resolve.shakestation.io/dns-query?name=${encodeURIComponent(queryDomain)}&type=TXT`;

    return new Promise((resolve, reject) => {
        https.get(
            dnsUrl,
            {
                headers: { 'Accept': 'application/dns-json' },
                agent: keepAliveAgent // ✅ Use keep-alive agent
            },
            (dnsRes) => {
                let data = '';
                dnsRes.on('data', chunk => data += chunk);
                dnsRes.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        let pubkeys = {};
                        let aliases = {};

                        if (result.Answer) {
                            for (const record of result.Answer) {
                                if (record.type === 16) {
                                    const txt = record.data.replace(/^"|"$/g, '');

                                    // Match nostr: to nostr12:
                                    for (let i = 0; i <= 12; i++) {
                                        const keyPrefix = i === 0 ? 'nostr:' : `nostr${i}:`;
                                        if (txt.startsWith(keyPrefix)) {
                                            pubkeys[i] = txt.slice(keyPrefix.length);
                                        }
                                    }

                                    // Match nostrname: to nostrname12:
                                    for (let i = 0; i <= 12; i++) {
                                        const namePrefix = i === 0 ? 'nostrname:' : `nostrname${i}:`;
                                        if (txt.startsWith(namePrefix)) {
                                            if (!aliases[i]) aliases[i] = [];
                                            aliases[i].push(txt.slice(namePrefix.length));
                                        }
                                    }
                                }
                            }
                        }

                        resolve({ pubkeys, aliases });
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        ).on('error', reject);
    });
}

// --- HTTP server ---
const server = http.createServer(async (req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    if (pathname !== '/nostr.json' || !query.subdomain) {
        res.writeHead(404);
        return res.end('Not Found');
    }

    const subdomain = query.subdomain;
    const cacheKey = `nip05:${subdomain}`;
    let cached = cache.get(cacheKey);

    if (cached) {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Cache': cached.isUpdating ? 'HIT (Background Update)' : 'HIT'
        });
        res.end(JSON.stringify(cached.data));
        if (!cached.isUpdating && cached.timestamp < Date.now() - CACHE_TTL) {
            cached.isUpdating = true;
            cache.set(cacheKey, cached);
            fetchNostrData(subdomain)
                .then(({ pubkeys, aliases }) => {
                    const names = {};
                    for (let i = 0; i <= 12; i++) {
                        const pubkey = pubkeys[i] ? bech32ToHex(pubkeys[i]) : null;
                        if (aliases[i]) {
                            aliases[i].forEach(alias => {
                                names[alias] = pubkey;
                            });
                        } else if (pubkey) {
                            names[subdomain] = pubkey; // fallback to subdomain
                        }
                    }
                    cache.set(cacheKey, {
                        data: { names },
                        timestamp: Date.now(),
                        isUpdating: false
                    });
                })
                .catch(() => {
                    cached.isUpdating = false;
                    cache.set(cacheKey, cached);
                });
        }
        return;
    }

    try {
        const { pubkeys, aliases } = await fetchNostrData(subdomain);
        const names = {};

        for (let i = 0; i <= 12; i++) {
            const pubkey = pubkeys[i] ? bech32ToHex(pubkeys[i]) : null;
            if (aliases[i]) {
                aliases[i].forEach(alias => {
                    names[alias] = pubkey;
                });
            } else if (pubkey) {
                names[subdomain] = pubkey; // fallback
            }
        }

        const responseData = Object.keys(names).length
            ? { names }
            : { error: 'No nostr record found' };

        cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now(),
            isUpdating: false
        });

        res.writeHead(Object.keys(names).length ? 200 : 404, {
            'Content-Type': 'application/json',
            'X-Cache': 'MISS'
        });
        res.end(JSON.stringify(responseData));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Server running on http://127.0.0.1:3000');
});

