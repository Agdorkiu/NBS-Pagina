/* =========================================
   NOMAD BYTE STUDIOS — contacto.js
   Supabase form submission
   ========================================= */

const SUPABASE_URL  = 'https://czkpxsqjjhfzgsipdanx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6a3B4c3FqamhmemdzaXBkYW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDE5ODIsImV4cCI6MjA4NzQxNzk4Mn0.-JwHmA1wxZafiJm5KJTYkTnsOQzDdAKFY2tFQqNMvTA';

async function saveToSupabase({ nombre, email, tipo_contacto, tipo_proyecto, presupuesto, mensaje }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/contactos`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify({
      nombre,
      email,
      tipo_contacto: tipo_contacto || null,
      tipo_proyecto: tipo_proyecto || null,
      presupuesto:   presupuesto   || null,
      mensaje,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase: ${err}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const motivoSelect           = document.getElementById('cMotivo');
  const dynamicFieldsContainer = document.getElementById('dynamicFieldsContainer');
  const fieldProjectType       = document.getElementById('fieldProjectType');
  const fieldBudget            = document.getElementById('fieldBudget');
  const faqInForm              = document.getElementById('faqInForm');
  const form                   = document.getElementById('contactForm');
  const formBlock              = document.getElementById('formBlock');
  const successPanel           = document.getElementById('formSuccess');
  const submitBtn              = document.getElementById('submitBtn');
  const submitLabel            = document.getElementById('submitLabel');
  const errorBox               = document.getElementById('formError');

  const fieldConfig = {
    '':           { showDynamic: false, showFaq: false },
    'Proyecto':   { showDynamic: true,  showFaq: false },
    'Sugerencia': { showDynamic: false, showFaq: false },
    'Preguntas':  { showDynamic: false, showFaq: true  },
    'Otro':       { showDynamic: false, showFaq: false },
  };

  function updateFormFields() {
    const config = fieldConfig[motivoSelect ? motivoSelect.value : ''] || { showDynamic: false, showFaq: false };

    if (dynamicFieldsContainer) {
      if (config.showDynamic) {
        dynamicFieldsContainer.style.display = 'block';
        dynamicFieldsContainer.classList.add('anim-slide-down');
        if (fieldProjectType) fieldProjectType.style.display = 'block';
        if (fieldBudget)      fieldBudget.style.display      = 'block';
        const selP = document.getElementById('cProjectType');
        const selB = document.getElementById('cBudget');
        if (selP) selP.required = true;
        if (selB) selB.required = true;
      } else {
        dynamicFieldsContainer.classList.remove('anim-slide-down');
        dynamicFieldsContainer.style.display = 'none';
        const selP = document.getElementById('cProjectType');
        const selB = document.getElementById('cBudget');
        if (selP) selP.required = false;
        if (selB) selB.required = false;
      }
    }

    if (faqInForm) {
      faqInForm.style.display = config.showFaq ? 'block' : 'none';
      if (config.showFaq) setupFaqAccordion();
    }
  }

  if (motivoSelect) motivoSelect.addEventListener('change', updateFormFields);

  function setupFaqAccordion() {
    const container = document.getElementById('faqInForm');
    if (!container) return;
    container.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('open');
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre        = document.getElementById('cName').value.trim();
      const email         = document.getElementById('cEmail').value.trim();
      const tipo_contacto = document.getElementById('cMotivo').value;
      const tipo_proyecto = (document.getElementById('cProjectType') || {}).value || '';
      const presupuesto   = (document.getElementById('cBudget') || {}).value || '';
      const mensaje       = document.getElementById('cMessage').value.trim();

      if (!nombre || !email || !tipo_contacto || !mensaje) {
        if (errorBox) {
          errorBox.textContent = '⚠ Por favor, completa todos los campos obligatorios.';
          errorBox.style.display = 'block';
        }
        return;
      }

      if (submitBtn)   submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Enviando...';
      if (errorBox)    errorBox.style.display = 'none';

      try {
        await saveToSupabase({ nombre, email, tipo_contacto, tipo_proyecto, presupuesto, mensaje });
        if (formBlock)    formBlock.style.display = 'none';
        if (successPanel) successPanel.classList.add('show');
      } catch (err) {
        console.error('Error:', err);
        if (errorBox) {
          errorBox.textContent = '✕ Error al guardar el mensaje. Comprueba tu conexión e inténtalo de nuevo.';
          errorBox.style.display = 'block';
        }
        if (submitBtn)   submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Enviar mensaje';
      }
    });
  }

  updateFormFields();
});