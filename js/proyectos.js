/* =========================================
   NOMAD BYTE STUDIOS — proyectos.js
   Carga dinámica desde Supabase
   ========================================= */

const SUPABASE_URL  = 'https://czkpxsqjjhfzgsipdanx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6a3B4c3FqamhmemdzaXBkYW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDE5ODIsImV4cCI6MjA4NzQxNzk4Mn0.-JwHmA1wxZafiJm5KJTYkTnsOQzDdAKFY2tFQqNMvTA';

/* ---- Fetch all projects ---- */
async function fetchProyectos() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/proyectos?select=*&order=orden.asc,created_at.desc`,
    {
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`
      }
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---- Render featured card ---- */
function renderFeatured(p) {
  return `
    <div class="featured-project">
      <div class="featured-visual">
        <img src="assets/logo.png" alt="${p.titulo}" class="featured-visual-inner">
        <span class="featured-label">Destacado</span>
      </div>
      <div class="featured-content">
        <h2>${p.titulo}</h2>
        <p>${p.descripcion}</p>
        <div class="featured-meta">
          ${p.cliente ? `<div class="meta-row"><span>CLIENTE</span><span>${p.cliente}</span></div>` : ''}
          ${p.tech    ? `<div class="meta-row"><span>TECH</span><span>${p.tech}</span></div>` : ''}
          ${p.anio    ? `<div class="meta-row"><span>AÑO</span><span>${p.anio}</span></div>` : ''}
          ${p.tipo    ? `<div class="meta-row"><span>TIPO</span><span>${p.tipo}</span></div>` : ''}
        </div>
        <a href="contacto.html" class="btn" style="align-self:flex-start; margin-top:8px;">
          ¿Proyecto similar?
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:15px">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </a>
      </div>
    </div>
  `;
}

/* ---- Render a single project row ---- */
function renderRow(p, index) {
  const tagsHTML = (p.tags || [])
    .map(t => `<span class="proj-tag">${t}</span>`)
    .join('');

  return `
    <div class="project-row" data-category="${p.categoria || 'web'}" style="animation: fadeUp 0.4s ease ${index * 0.06}s both;">
      <span class="proj-index">${String(index + 1).padStart(3, '0')}</span>
      <div class="proj-info">
        <h3>${p.titulo}</h3>
        <p>${p.descripcion}</p>
      </div>
      <div class="proj-tags">${tagsHTML}</div>
      <span class="proj-year">${p.anio || '—'}</span>
    </div>
  `;
}

/* ---- Skeleton while loading ---- */
function renderSkeleton() {
  return [1,2,3].map(() => `
    <div class="project-row" style="pointer-events:none; opacity:0.4;">
      <span class="proj-index" style="display:block; width:32px; height:12px; background:var(--border); border-radius:2px;"></span>
      <div class="proj-info">
        <div style="width:200px; height:14px; background:var(--border); border-radius:2px; margin-bottom:8px;"></div>
        <div style="width:300px; height:11px; background:rgba(240,237,230,0.05); border-radius:2px;"></div>
      </div>
    </div>
  `).join('');
}

/* ---- Empty state ---- */
function renderEmpty() {
  return `
    <div style="
      padding: 80px 40px;
      text-align: center;
      color: var(--gray);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    ">
      <div style="font-size:36px; margin-bottom:20px; opacity:0.25;">◎</div>
      No hay proyectos todavía — añade el primero desde Supabase
    </div>
  `;
}

/* ---- Filter logic (called after rows rendered) ---- */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      document.querySelectorAll('.project-row[data-category]').forEach(row => {
        const show = cat === 'all' || row.dataset.category === cat;
        row.style.display = show ? '' : 'none';
        if (show) row.style.animation = 'fadeUp 0.35s ease both';
      });
    });
  });
}

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', async () => {
  const featuredContainer = document.getElementById('featured-container');
  const tableContainer    = document.getElementById('projects-table');

  // Show skeleton
  if (tableContainer) tableContainer.innerHTML = renderSkeleton();

  try {
    const proyectos = await fetchProyectos();

    // Featured block
    const featured = proyectos.find(p => p.destacado) || null;
    if (featuredContainer) {
      featuredContainer.innerHTML = featured ? renderFeatured(featured) : '';
    }

    // Rows
    if (tableContainer) {
      tableContainer.innerHTML = proyectos.length
        ? proyectos.map((p, i) => renderRow(p, i)).join('')
        : renderEmpty();
    }

    initFilters();

  } catch (err) {
    console.error('Supabase error:', err);
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div style="padding:40px; text-align:center; font-family:var(--font-mono); font-size:12px; color:#ff5555; letter-spacing:0.1em;">
          ✕ Error al cargar proyectos — revisa la conexión
        </div>
      `;
    }
  }
});
