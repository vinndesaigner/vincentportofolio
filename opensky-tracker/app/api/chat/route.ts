import { NextResponse } from 'next/server';

// Helper Auto ROT13
function decodeROT13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (c: string) => {
    const base = c <= 'z' && c >= 'a' ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// Helper Auto Base64
function decodeBase64(str: string): string | null {
  try {
    if (str.length >= 8 && str.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(str)) {
      const decoded = Buffer.from(str, 'base64').toString('utf-8');
      if (/^[\x20-\x7E\s]+$/.test(decoded)) return decoded;
    }
  } catch {}
  return null;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const msg = message.trim();
    const msgLower = msg.toLowerCase();

    let response = '';

    // 1. ROT13 Solver
    const rot13Decoded = decodeROT13(msg);
    if (
      msgLower.startsWith('cvpb') ||
      rot13Decoded.toLowerCase().includes('picoctf{') ||
      rot13Decoded.toLowerCase().includes('flag{') ||
      rot13Decoded.toLowerCase().includes('lks{')
    ) {
      response = `🔓 **[AUTO-DECODER] ROT13 Cipher Detected!**\n\n**Hasil Decoded:**\n\`${rot13Decoded}\``;
    }

    // 2. Base64 Decoder
    else if (decodeBase64(msg)) {
      response = `🔓 **[AUTO-DECODER] Base64 String Detected!**\n\n**Hasil Decoded:**\n\`${decodeBase64(msg)}\``;
    }

    // 3. Hash Identifier
    else if (/^[0-9a-fA-F]{32}$/.test(msg)) {
      response = `🔑 **[HASH IDENTIFIER] MD5 Hash (32-char)!**\nCoba crack hash ini via CrackStation, Hashcat, atau John the Ripper.`;
    } else if (/^[0-9a-fA-F]{40}$/.test(msg)) {
      response = `🔑 **[HASH IDENTIFIER] SHA-1 Hash (40-char)!**`;
    } else if (/^[0-9a-fA-F]{64}$/.test(msg)) {
      response = `🔑 **[HASH IDENTIFIER] SHA-256 Hash (64-char)!**`;
    }

    // 4. CTF Knowledge Base
    else if (msgLower.includes('crypto')) {
      response = `🔐 **[CRYPTOGRAPHY CHEAT SHEET]**\n• Ciphers: ROT13, Caesar, Vigenere, RSA, AES, XOR.\n• Web Tool: [CyberChef](https://cyberchef.io)\n• CLI: \`tr 'A-Za-z' 'N-ZA-Mn-za-m'\``;
    } else if (msgLower.includes('dfir') || msgLower.includes('forensic')) {
      response = `🔍 **[DFIR / FORENSICS CHEAT SHEET]**\n• Network: \`Wireshark\`, \`tshark\`\n• Memory: \`volatility -f mem.raw windows.pslist\`\n• File Extraction: \`binwalk -e file.png\` / \`exiftool\``;
    } else if (msgLower.includes('pwn') || msgLower.includes('buffer')) {
      response = `💥 **[PWN / BINARY EXPLOITATION]**\n• Checksec: \`checksec --file=./binary\`\n• Pwntools Python:\n\`\`\`python\nfrom pwn import *\nio = process('./binary')\npayload = b'A'*64 + p64(0x4011f6)\nio.sendline(payload)\nio.interactive()\n\`\`\``;
    } else if (msgLower.includes('web') || msgLower.includes('sqli')) {
      response = `🌐 **[WEB EXPLOITATION]**\n• Auth Bypass: \`' OR 1=1-- -\`\n• Union Based: \`' UNION SELECT 1,2,database()-- -\`\n• Tool: \`sqlmap -u "URL" --batch\``;
    }

    // 5. Threat/Payload Detector
    else if (msg.includes("'") || msg.includes('<script>') || msg.includes('UNION') || msg.includes('../')) {
      response = `🚨 **[MALICIOUS PAYLOAD DETECTED]**\nSistem mendeteksi indikasi serangan Web Exploitation (SQL Injection / XSS / Path Traversal).`;
    }

    // 6. Default Greeting
    else {
      response = `Yo Vin! Gua Wingman AI Web Edition.\n\nKamu bisa:\n1. Paste string **ROT13 / Base64 / Hash** langsung ke box chat.\n2. Nanya materi **Crypto, DFIR, PWN, REV, atau Web Exploitation**.\n3. Test paste log request HTTP.`;
    }

    return NextResponse.json({ reply: response });
  } catch (err) {
    return NextResponse.json({ reply: 'Error processing AI request.' }, { status: 500 });
  }
}