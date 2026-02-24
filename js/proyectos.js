/* =========================================
   NOMAD BYTE STUDIOS — proyectos.js
   ========================================= */

const SUPABASE_URL  = 'https://czkpxsqjjhfzgsipdanx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6a3B4c3FqamhmemdzaXBkYW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDE5ODIsImV4cCI6MjA4NzQxNzk4Mn0.-JwHmA1wxZafiJm5KJTYkTnsOQzDdAKFY2tFQqNMvTA';

async function fetchProyectos() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/proyectos?select=*&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ---- Featured card ---- */
function renderFeatured(p) {
  const imgSrc = p.imagen_url || 'assets/logo.png';
  return `
    <div class="featured-project">
      <div class="featured-visual">
        <img src="${imgSrc}" alt="${p.titulo}" class="featured-visual-inner">
        <span class="featured-label">Destacado</span>
      </div>
      <div class="featured-content">
        <h2>${p.titulo}</h2>
        <p>${p.descripcion}</p>
        <div class="featured-meta">
          ${p.categoria  ? `<div class="meta-row"><span>CATEGORÍA</span><span>${p.categoria}</span></div>` : ''}
          ${p.created_at ? `<div class="meta-row"><span>FECHA</span><span>${formatDate(p.created_at)}</span></div>` : ''}
        </div>
        <a href="${p.enlace || 'contacto.html'}" ${p.enlace ? 'target="_blank" rel="noopener"' : ''} class="btn" style="align-self:flex-start;margin-top:8px;">
          ${p.enlace ? 'Ver proyecto' : '¿Proyecto similar?'}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:15px">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </a>
      </div>
    </div>
  `;
}

/* ---- Project row ---- */
function renderRow(p, index) {
  const thumb = p.imagen_url
    ? `<div class="proj-thumb"><img src="${p.imagen_url}" alt="${p.titulo}"></div>`
    : `<div class="proj-thumb proj-thumb--empty"></div>`;

  // Convertir categoría a lowercase para que el filtro funcione
  const categoria = (p.categoria || 'web').toLowerCase();

  const dataHref = p.enlace ? `data-href="${p.enlace}"` : '';

  return `
    <div class="project-row" data-category="${categoria}" ${dataHref} style="animation: fadeUp 0.4s ease ${index * 0.06}s both;">
      ${thumb}
      <div class="proj-info">
        <h3>${p.titulo}</h3>
        <p>${p.descripcion}</p>
      </div>
      <span class="proj-category">${p.categoria || '—'}</span>
      <span class="proj-year">${formatDate(p.created_at)}</span>
    </div>
  `;
}

/* ---- Skeleton ---- */
function renderSkeleton() {
  return [1,2,3].map(() => `
    <div class="project-row" style="pointer-events:none;opacity:0.4;">
      <div class="proj-thumb proj-thumb--empty"></div>
      <div class="proj-info">
        <div style="width:200px;height:14px;background:var(--border);border-radius:2px;margin-bottom:8px;"></div>
        <div style="width:300px;height:11px;background:rgba(240,237,230,0.05);border-radius:2px;"></div>
      </div>
    </div>
  `).join('');
}

/* ---- Empty ---- */
function renderEmpty() {
  return `
    <div style="padding:80px 40px;text-align:center;color:var(--gray);font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
      <div style="font-size:36px;margin-bottom:20px;opacity:0.25;">◎</div>
      No hay proyectos todavía — añade el primero desde Supabase
    </div>
  `;
}

/* ---- Filters ---- */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.dataset.filter.toLowerCase();
      
      document.querySelectorAll('.project-row[data-category]').forEach(row => {
        const rowCategory = row.dataset.category.toLowerCase();
        const show = filterValue === 'all' || rowCategory === filterValue;
        row.style.display = show ? '' : 'none';
        if (show) row.style.animation = 'fadeUp 0.35s ease both';
      });
    });
  });
}

/* ---- Mobile row clicks ---- */
function initMobileRowClicks() {
  document.querySelectorAll('.project-row[data-href]').forEach(row => {
    row.addEventListener('click', (e) => {
      // Abre el enlace en nueva pestaña si el proyecto tiene asociado
      window.open(row.dataset.href, '_blank');
    });
    // Cursor pointer para indicar que es clickeable
    row.style.cursor = 'pointer';
  });
}

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', async () => {
  const featuredContainer = document.getElementById('featured-container');
  const tableContainer    = document.getElementById('projects-table');

  if (tableContainer) tableContainer.innerHTML = renderSkeleton();

  try {
    const proyectos = await fetchProyectos();

    if (featuredContainer) {
      const featured = proyectos.find(p => p.destacado) || null;
      featuredContainer.innerHTML = featured ? renderFeatured(featured) : '';
    }

    if (tableContainer) {
      tableContainer.innerHTML = proyectos.length
        ? proyectos.map((p, i) => renderRow(p, i)).join('')
        : renderEmpty();
    }

    initFilters();
    initMobileRowClicks();

  } catch (err) {
    console.error('Supabase error:', err);
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div style="padding:40px;text-align:center;font-family:var(--font-mono);font-size:12px;color:#ff5555;letter-spacing:0.1em;">
          ✕ Error al cargar proyectos — revisa la conexión
        </div>
      `;
    }
  }
});