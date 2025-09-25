const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS: solo acepta desde tu frontend
const corsOptions = {
  origin: 'https://alfredop89-web-portfolio-v3-0.vercel.app',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('/send', cors(corsOptions)); // Manejo de preflight

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
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