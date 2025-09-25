const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS: solo acepta desde tu frontend
app.use(cors({
  origin: 'https://alfredop89-web-portfolio-v3-0.vercel.app',
  methods: ['POST'],
}));

app.use(express.json());

app.post('/send', async (req, res) => {
  const { name, email, company, subject, message } = req.body;

  // Validación básica
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
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
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al enviar el correo' });
  }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));