import crypto from 'crypto';

export default async function handler(req, res) {
  // 1. Wajibkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { service, data_no, data_zone } = req.body;

    // Validasi input dasar
    if (!service || !data_no) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parameter service dan data_no wajib diisi' 
      });
    }

    // 2. Ambil Kredensial dari Environment Variables Vercel
    const apiId = process.env.VIP_API_ID;
    const apiKey = process.env.VIP_API_KEY;

    if (!apiId || !apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API Key/ID belum dikonfigurasi di Environment Variables' 
      });
    }

    // 3. Buat Signature MD5 sesuai dokumentasi: md5(API ID + API KEY)
    const sign = crypto
      .createHash('md5')
      .update(apiId + apiKey)
      .digest('hex');

    // 4. Menyusun body payload dalam format x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('sign', sign);
    formData.append('type', 'order');
    formData.append('service', service);
    formData.append('data_no', data_no);
    
    // Kirim data_zone jika ada (seperti Zone ID Mobile Legends)
    if (data_zone) {
      formData.append('data_zone', data_zone);
    }

    // 5. Tembak ke Endpoint VIP Reseller
    const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    // 6. Evaluasi Hasil dari Provider
    if (result.result) {
      return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil diproses!',
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Gagal memproses pesanan di provider',
      });
    }

  } catch (error) {
    console.error('[VIP ORDER ERROR]', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error' 
    });
  }
}