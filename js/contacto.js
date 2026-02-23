/* =========================================
   NOMAD BYTE STUDIOS — contacto.js
   Supabase form submission + Email sending + Dynamic FAQ
   ========================================= */

/* ---- EMAILJS SETUP INSTRUCTIONS ----
 * 
 * Para que los emails se envíen correctamente:
 * 
 * 1. Registrate GRATIS en https://www.emailjs.com/
 * 2. Verifica tu email (mira tu bandeja de entrada)
 * 3. Ve a "Email Services" y conecta tu email:
 *    - Opción A: Tu Gmail (agdorkiu@gmail.com)
 *    - Opción B: Tu outlook/hotmail
 * 4. Aprueba el acceso cuando EmailJS te lo pida
 * 5. Ve al Dashboard y copia:
 *    - SERVICE ID (en "Email Services")
 *    - PUBLIC KEY (en "Account" > "API Keys")
 * 6. Crea una plantilla de email:
 *    - Ve a "Email Templates"
 *    - Click en "Create New Template"
 *    - Usa estos variables: {{from_name}}, {{from_email}}, {{motivo}}, {{tipo_proyecto}}, {{presupuesto}}, {{mensaje}}
 *    - Copia el TEMPLATE ID
 * 7. Pega los 3 valores abajo:
 */

const EMAILJS_SERVICE_ID = 'service_tozfw24';      // Reemplaza con tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_zbfw56p';    // Reemplaza con tu Template ID
const EMAILJS_PUBLIC_KEY = '8oqWaM-p4l0tOyXQX';      // Reemplaza con tu Public Key

// Elige a cuál email enviar los mensajes:
const RECIPIENT_EMAIL = 'agdorkiu@gmail.com'; 

const SUPABASE_URL    = 'https://czkpxsqjjhfzgsipdanx.supabase.co';
const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6a3B4c3FqamhmemdzaXBkYW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDE5ODIsImV4cCI6MjA4NzQxNzk4Mn0.-JwHmA1wxZafiJm5KJTYkTnsOQzDdAKFY2tFQqNMvTA';

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

/* ---- Send email via EmailJS ---- */
async function sendEmailViaEmailJS(data) {
  // Verificar que EmailJS esté configurado
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS no está configurado. No se enviará correo.');
    return false;
  }

  // Inicializar EmailJS si no está ya inicializado
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS no está cargado. Asegúrate de haber incluido el script en el HTML.');
    return false;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const templateParams = {
    to_email: RECIPIENT_EMAIL,
    from_name: data.nombre,
    from_email: data.email,
    motivo: data.tipo_contacto,
    tipo_proyecto: data.tipoProyecto || 'No aplica',
    presupuesto: data.presupuesto || 'No aplica',
    mensaje: data.mensaje,
    reply_to: data.email
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    return true;
  } catch (err) {
    console.error('Error enviando email:', err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Contact form dynamic fields ---- */
  const motivoSelect = document.getElementById('cMotivo');
  const dynamicFieldsContainer = document.getElementById('dynamicFieldsContainer');
  const fieldProjectType = document.getElementById('fieldProjectType');
  const fieldBudget = document.getElementById('fieldBudget');
  const faqInForm = document.getElementById('faqInForm');

  // Definir qué campos mostrar para cada motivo
  const fieldConfig = {
    '': { showDynamic: false, showFaq: false },
    'Proyecto': { showDynamic: true, showFaq: false },
    'Sugerencia': { showDynamic: false, showFaq: false },
    'Preguntas': { showDynamic: false, showFaq: true },
    'Otro': { showDynamic: false, showFaq: false }
  };

  function updateFormFields() {
    const motivo = motivoSelect.value;
    const config = fieldConfig[motivo] || { showDynamic: false, showFaq: false };

    // Mostrar/ocultar contenedor dinámico con animación
    if (dynamicFieldsContainer) {
      if (config.showDynamic) {
        dynamicFieldsContainer.style.display = 'block';
        dynamicFieldsContainer.classList.add('anim-slide-down');
      } else {
        dynamicFieldsContainer.classList.remove('anim-slide-down');
        dynamicFieldsContainer.style.display = 'none';
      }
    }

    // Para Proyecto: mostrar ambos desplegables
    if (config.showDynamic) {
      if (fieldProjectType) fieldProjectType.style.display = 'block';
      if (fieldBudget) fieldBudget.style.display = 'block';
      
      const projectTypeInput = document.getElementById('cProjectType');
      const budgetInput = document.getElementById('cBudget');
      if (projectTypeInput) projectTypeInput.required = true;
      if (budgetInput) budgetInput.required = true;
    }

    // Mostrar/ocultar FAQ
    if (faqInForm) {
      faqInForm.style.display = config.showFaq ? 'block' : 'none';
      if (config.showFaq) {
        setupFaqAccordion();
      }
    }
  }

  // Escuchar cambios en el select de motivo
  if (motivoSelect) {
    motivoSelect.addEventListener('change', updateFormFields);
  }

  /* ---- Setup FAQ accordion ---- */
  function setupFaqAccordion() {
    const container = document.getElementById('faqInForm');
    if (!container) return;
    
    container.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('open');
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      
      // Remover listeners anteriores clonando el nodo
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ---- Contact form ---- */
  const form         = document.getElementById('contactForm');
  const formBlock    = document.getElementById('formBlock');
  const successPanel = document.getElementById('formSuccess');
  const submitBtn    = document.getElementById('submitBtn');
  const submitLabel  = document.getElementById('submitLabel');
  const errorBox     = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre        = document.getElementById('cName').value.trim();
      const email         = document.getElementById('cEmail').value.trim();
      const tipo_contacto = document.getElementById('cMotivo').value;
      const tipoProyecto  = document.getElementById('cProjectType') ? document.getElementById('cProjectType').value : '';
      const presupuesto   = document.getElementById('cBudget') ? document.getElementById('cBudget').value : '';
      const mensaje       = document.getElementById('cMessage').value.trim();

      // Validaciones básicas
      if (!nombre || !email || !tipo_contacto || !mensaje) {
        if (errorBox) {
          errorBox.textContent = '⚠ Por favor, completa todos los campos.';
          errorBox.style.display = 'block';
        }
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitLabel.textContent = 'Enviando...';
      if (errorBox) errorBox.style.display = 'none';

      try {
        // 1. Save to Supabase
        try {
          // Envía todos los campos del formulario
          const dataToSave = {
            nombre, 
            email, 
            tipo_contacto,
            tipo_proyecto: tipoProyecto,
            presupuesto, 
            mensaje
          };
          
          await saveToSupabase(dataToSave);
          console.log('✓ Mensaje guardado en Supabase');
        } catch (supabaseErr) {
          console.error('✗ Error en Supabase:', supabaseErr);
          throw new Error(`Error al guardar: ${supabaseErr.message}`);
        }

        // 2. Send email via EmailJS (opcional, no bloquea el éxito)
        try {
          const emailSent = await sendEmailViaEmailJS({
            nombre,
            email,
            tipo_contacto,
            tipoProyecto,
            presupuesto,
            mensaje
          });
          if (emailSent) {
            console.log('✓ Email enviado correctamente');
          } else {
            console.warn('⚠ Email no se envió (EmailJS no configurado o cargado)');
          }
        } catch (emailErr) {
          console.error('⚠ Error al enviar email (pero el mensaje fue guardado):', emailErr);
        }

        // 3. Show success
        formBlock.style.display = 'none';
        successPanel.classList.add('show');

      } catch (err) {
        console.error('Error final:', err);
        if (errorBox) {
          let errorMessage = 'Hubo un error al enviar. ';
          
          // Mensajes de error específicos
          if (err.message.includes('Supabase')) {
            errorMessage += 'Error al guardar (Supabase). Comprueba que tus datos sean correctos.';
          } else if (err.message.includes('fetch')) {
            errorMessage += 'Error de conexión. Comprueba tu internet.';
          } else {
            errorMessage += err.message || 'Por favor, inténtalo de nuevo.';
          }
          
          errorBox.textContent = errorMessage;
          errorBox.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitLabel.textContent = 'Enviar mensaje';
      }
    });
  }

  // Initialize form fields
  updateFormFields();

});