using Base64

function decode_rot13(text::String)
    result = Char[]
    for c in text
        if 'a' <= c <= 'z'
            push!(result, Char(mod(Int(c) - Int('a') + 13, 26) + Int('a')))
        elseif 'A' <= c <= 'Z'
            push!(result, Char(mod(Int(c) - Int('A') + 13, 26) + Int('A')))
        else
            push!(result, c)
        end
    end
    return String(result)
end

# Tangkap argument input dari Node.js / Next.js
if length(ARGS) > 0
    input_text = ARGS[1]
    msg_lower = lowercase(input_text)
    
    rot13_res = decode_rot13(input_text)
    
    if startswith(msg_lower, "cvpb") || contains(lowercase(rot13_res), "picoctf{") || contains(lowercase(rot13_res), "flag{")
        println("🔓 **[JULIA ENGINE] ROT13 Cipher Detected!**\n\n**Hasil Decoded:**\n`$rot13_res`")
    elseif contains(msg_lower, "crypto")
        println("🔐 **[JULIA ENGINE - CRYPTOGRAPHY]**\n• Julia Math Speed: High-performance Modular Arithmetic!\n• Tools: ROT13, RSA, AES, XOR.")
    elseif contains(msg_lower, "dfir")
        println("🔍 **[JULIA ENGINE - DFIR]**\n• Forensics Tools: Wireshark (pcap), Volatility (memory).")
    elseif contains(msg_lower, "pwn")
        println("💥 **[JULIA ENGINE - PWN]**\n• Binary Exploitation: Buffer Overflow, ROP Chains, Checksec.")
    elseif contains(msg_lower, "web")
        println("🌐 **[JULIA ENGINE - WEB]**\n• Web Exploitation: SQLi (' OR 1=1--), XSS (<script>), LFI.")
    else
        println("Yo Vin! Ini balasan murni dari **Julia Engine Backend**.\n\nKetik/paste string ROT13 atau materi CTF buat ngetes komputasi Julia!")
    end
end