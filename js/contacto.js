/* =========================================
   NOMAD BYTE STUDIOS — contacto.js
   Supabase form submission + FAQ accordion
   ========================================= */

const SUPABASE_URL    = 'https://czkpxsqjjhfzgsipdanx.supabase.co';
const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6a3B4c3FqamhmemdzaXBkYW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDE5ODIsImV4cCI6MjA4NzQxNzk4Mn0.-JwHmA1wxZafiJm5KJTYkTnsOQzDdAKFY2tFQqNMvTA';
const CONTACT_EMAIL   = 'nomadbytestudios.undrilled996@passfwd.com';

/* ---- Insert row into Supabase ---- */
async function saveToSupabase(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/contactos`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Contact form ---- */
  const form        = document.getElementById('contactForm');
  const formBlock   = document.getElementById('formBlock');
  const successPanel = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('submitBtn');
  const submitLabel = document.getElementById('submitLabel');
  const errorBox    = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre        = document.getElementById('cName').value.trim();
      const email         = document.getElementById('cEmail').value.trim();
      const tipo_proyecto = document.getElementById('cService').value;
      const presupuesto   = document.getElementById('cBudget').value;
      const mensaje       = document.getElementById('cMessage').value.trim();

      // Loading state
      submitBtn.disabled = true;
      submitLabel.textContent = 'Enviando...';
      if (errorBox) errorBox.style.display = 'none';

      try {
        // 1. Save to Supabase
        await saveToSupabase({ nombre, email, tipo_proyecto, presupuesto, mensaje });

        // 2. Also open email client as backup notification
        const subject = encodeURIComponent(`[NBS] ${tipo_proyecto || 'Consulta'} — ${nombre}`);
        const body    = encodeURIComponent(
          `Nuevo contacto desde la web:\n\n` +
          `Nombre: ${nombre}\n` +
          `Email: ${email}\n` +
          `Proyecto: ${tipo_proyecto || 'No especificado'}\n` +
          `Presupuesto: ${presupuesto || 'No especificado'}\n\n` +
          `Mensaje:\n${mensaje}`
        );
        window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');

        // 3. Show success
        formBlock.style.display = 'none';
        successPanel.classList.add('show');

      } catch (err) {
        console.error('Supabase error:', err);
        if (errorBox) {
          errorBox.textContent = 'Hubo un error al enviar. Por favor, inténtalo de nuevo.';
          errorBox.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitLabel.textContent = 'Enviar mensaje';
      }
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

});
