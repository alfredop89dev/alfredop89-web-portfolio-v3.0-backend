const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS headers (aplicados en todas las respuestas)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  // Body parsing manual (Vercel no lo hace automáticamente con CommonJS)
  let body = '';
  await new Promise((resolve) => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'JSON inválido' });
  }

  const { name, email, company, subject, message } = data;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'Faltan campos requeridos: name, email, subject, message',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Formulario Web" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `Nuevo mensaje: ${subject}`,
      html: `
        <h3>Nombre: ${name}</h3>
        <p>Email: ${email}</p>
        ${company ? `<p>Empresa: ${company}</p>` : ''}
        <p>Mensaje:</p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al enviar el correo',
    });
  }
};
