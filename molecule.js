// Random molecule display from PubChem

function formatFormula(formula) {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}

function loadMolecule(containerId = 'molecule') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cid = Math.floor(Math.random() * 5000) + 1;

  fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/Title,MolecularFormula,MolecularWeight/JSON`)
    .then(r => r.json())
    .then(data => {
      const props = data.PropertyTable.Properties[0];
      const name = props.Title || '';

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
        </div>
      `;
    })
    .catch(() => {
      loadMolecule(containerId);
    });
}

document.addEventListener('DOMContentLoaded', () => loadMolecule());
