// Random molecule display from PubChem

// Filtered CIDs (hashed for discretion)
const FILTERED_HASHES = new Set([
  '7e66b5', '2069cb', 'f68a11', 'fc7b52', '261b6c', '1c8dcc', '0a990e',
  '1afc50', '3b4f36', '3bad45', 'f393ed', 'c344fd', '6ffdf0', '92ffee',
  'ffe418', '0d551e', '01c062', 'bb602e', '39c7ad', 'ee6f01', '5f6b81',
  '323e37', '55b804', '9763a4', '87595d', '2ac913', '25375a', '26fdca', '9e0cc3',
  'f3cf97'
]);

async function hashStr(str) {
  const data = new TextEncoder().encode(str.toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).slice(0, 3)
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function isFiltered(cid, name) {
  const cidHash = await hashStr(String(cid));
  if (FILTERED_HASHES.has(cidHash)) return true;
  
  const words = name.toLowerCase().split(/[\s\-\_]+/);
  for (const word of words) {
    if (word.length < 4) continue;
    const h = await hashStr(word);
    if (FILTERED_HASHES.has(h)) return true;
  }
  return false;
}

function formatFormula(formula) {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

function loadMolecule(containerId = 'molecule') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cid = Math.floor(Math.random() * 5000) + 1;

  fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/Title,MolecularFormula,MolecularWeight/JSON`)
    .then(r => r.json())
    .then(async data => {
      const props = data.PropertyTable.Properties[0];
      const name = props.Title || '';

      // Skip if filtered
      if (await isFiltered(cid, name)) {
        loadMolecule(containerId);
        return;
      }

      // Skip if name is too long or missing
      if (!name || name.length > 36) {
        loadMolecule(containerId);
        return;
      }

      container.innerHTML = `
        <div class="molecule-card">
          <img src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=300x300" alt="${name}">
          <div class="molecule-name">${name}</div>
          <div class="molecule-formula">${formatFormula(props.MolecularFormula || '')}</div>
          <div class="molecule-weight">${Number(props.MolecularWeight).toFixed(2)} g/mol</div>
        </div>
      `;
    })
    .catch(() => {
      loadMolecule(containerId);
    });
}

document.addEventListener('DOMContentLoaded', () => loadMolecule());
