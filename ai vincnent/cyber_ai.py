import re
import base64
import urllib.parse
import codecs
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import IsolationForest

# ==========================================
# 1. BRAIN A: ANOMALY & LOG DETECTOR
# ==========================================
class LogAnalyzerAI:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer='char')
        self.model = IsolationForest(contamination=0.25, random_state=42)

    def train(self, log_samples):
        X = self.vectorizer.fit_transform(log_samples)
        self.model.fit(X)

    def analyze_payload(self, payload):
        X = self.vectorizer.transform([payload])
        prediction = self.model.predict(X)
        return "MALICIOUS" if prediction[0] == -1 else "SAFE"


# ==========================================
# 2. BRAIN B: FULL 5-CATEGORY CTF COPILOT
# ==========================================
class FullCTFWingmanAI:
    def __init__(self, analyzer_engine):
        self.engine = analyzer_engine
        
        self.ctf_knowledge = {
            "crypto": "🔐 **CRYPTOGRAPHY CHEAT SHEET:**\n• Cipher Identifiers: Caesar/Rot13, Vigenere, RSA, AES, XOR.\n• CyberChef: Gunakan cyberchef.io buat magic auto-decode!\n• Python RSA Quick Tool: `pip install pycryptodome` / `gmpy2`",
            "rot13": "🔐 **ROT13 / Caesar Solver:** Menggeser abjad 13 langkah.",
            "dfir": "🔍 **DFIR / FORENSICS CHEAT SHEET:**\n• Network (pcap): `Wireshark`, `tshark`, `NetworkMiner`\n• Memory Dump: `volatility -f mem.raw windows.pslist`\n• File Extraction: `binwalk -e file.png` / `foremost -i file.png`",
            "rev": "⚙️ **REVERSE ENGINEERING CHEAT SHEET:**\n• Decompiler Tools: `Ghidra`, `IDA Pro`, `Cutter`, `dnSpy`, `jadx-gui`",
            "pwn": "💥 **BINARY EXPLOITATION / PWN CHEAT SHEET:**\n• Security Check: `checksec --file=./binary`\n• Pwntools Template: `from pwn import *`",
            "web": "🌐 **WEB EXPLOITATION CHEAT SHEET:**\n• SQLi: `' OR 1=1-- -` / `sqlmap`\n• XSS: `<script>alert(1)</script>`\n• LFI: `../../../../etc/passwd`"
        }

    def decode_and_hash_helper(self, text):
        """Auto-detect ROT13, Base64, Hex, URL, dan Identifier Hash"""
        
        # 1. Cek & Auto-Solve ROT13 (Khususnya jika mengandung kata 'cvpb' / format flag)
        try:
            rot13_decoded = codecs.decode(text, 'rot_13')
            # Jika hasil decode ROT13 menghasilkan kata 'picoCTF', 'flag{', 'LKS{', atau kata umum
            if any(prefix in rot13_decoded.lower() for prefix in ['picoctf{', 'flag{', 'lks{', 'ctf{']) or text.startswith('cvpb'):
                return f"🔓 **Auto-Decoded (ROT13 Cipher):**\n`{rot13_decoded}`"
        except:
            pass

        # 2. Cek Base64
        if re.match(r'^[A-Za-z0-9+/=]{8,}$', text) and len(text) % 4 == 0:
            try:
                decoded = base64.b64decode(text).decode('utf-8')
                return f"🔓 **Auto-Decoded (Base64):** `{decoded}`"
            except:
                pass

        # 3. Cek Hex String
        if re.match(r'^[0-9a-fA-F]{8,}$', text) and len(text) % 2 == 0:
            try:
                decoded = bytes.fromhex(text).decode('utf-8')
                if decoded.isprintable():
                    return f"🔓 **Auto-Decoded (Hex to ASCII):** `{decoded}`"
            except:
                pass

        # 4. Cek URL Encoding
        if "%" in text:
            try:
                decoded = urllib.parse.unquote(text)
                return f"🔓 **Auto-Decoded (URL Encode):** `{decoded}`"
            except:
                pass

        # 5. Identifikasi Hash
        if len(text) == 32 and re.match(r'^[0-9a-fA-F]+$', text):
            return "🔑 **Hash Detected:** MD5 Hash (32 char)."
        elif len(text) == 40 and re.match(r'^[0-9a-fA-F]+$', text):
            return "🔑 **Hash Detected:** SHA-1 Hash (40 char)."
        elif len(text) == 64 and re.match(r'^[0-9a-fA-F]+$', text):
            return "🔑 **Hash Detected:** SHA-256 Hash (64 char)."

        return None

    def chat(self, user_input):
        msg = user_input.strip()

        # 1. Cek Auto-Decode / Hash Detector (Integritas ROT13/Base64/Hex)
        decoded_result = self.decode_and_hash_helper(msg)
        if decoded_result:
            return f"💡 **CTF Auto-Decoder Result:**\n{decoded_result}"

        # 2. Cek Knowledge Base CTF
        msg_lower = msg.lower()
        for key, info in self.ctf_knowledge.items():
            if key in msg_lower:
                return f"🤖 **Wingman CTF Assist ({key.upper()}):**\n{info}"

        # 3. Log / Payload Analyzer
        if "GET" in msg or "POST" in msg or "'" in msg or "<script>" in msg or "UNION" in msg or "../" in msg:
            status = self.engine.analyze_payload(msg)
            if status == "MALICIOUS":
                return "🚨 **[ANALYSIS] MALICIOUS PAYLOAD DETECTED!**"
            else:
                return "✅ **[ANALYSIS] SAFE TRAFFIC.**"

        # 4. Sapaan
        if any(w in msg_lower for w in ["halo", "hi", "bro", "p", "cuy", "min", "help"]):
            return "Yo Vin! Paste string ROT13, Base64, Hex, atau Hash apa aja langsung ke sini biar gua crack otomatis!"

        return "Gua siap bantu, Vin! Coba paste ciphertext ROT13/Base64 atau nanya kategori CTF."


# ==========================================
# 3. INITIALIZE & RUNNING
# ==========================================
dataset_log = ["GET /index.html HTTP/1.1", "GET /admin?user=admin' UNION SELECT 1,2,3-- HTTP/1.1"]

detektor = LogAnalyzerAI()
detektor.train(dataset_log)
wingman = FullCTFWingmanAI(detektor)

print("\n" + "="*60)
print("🛡️  FULL CTF WINGMAN AI (WITH AUTO ROT13 SOLVER) IS ONLINE! 🛡️")
print("=====================================================\n")

while True:
    user_msg = input("Vin 👤: ")
    if user_msg.lower() == 'exit':
        print("Wingman 🤖: Bantai semua flag-nya, Vin!")
        break
        
    response = wingman.chat(user_msg)
    print(f"\nWingman 🤖:\n{response}\n" + "-"*50)