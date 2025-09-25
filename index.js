const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// CORS manual para evitar errores en Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://alfredop89-web-portfolio-v3-0.vercel.app');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight OK
  }
  next();
});

app.use(express.json());

app.post('/send', async (req, res) => {
  const { name, email, company, subject, message } = req.body;

  // Validación de campos requeridos
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'Faltan campos requeridos: name, email, subject, message',
    });
  }

  // Configuración de transporte con Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Mensaje desde Formulario Portafolio Web" <${process.env.EMAIL_USER}>`,
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

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno al enviar el correo',
    });
  }
});

// Solo para desarrollo local
app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));