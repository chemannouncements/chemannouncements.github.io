// Molar Mass Calculator
// Created by Alexander Shinkeyev

(function() {
  const editor = document.getElementById('mm-editor');
  const resultDiv = document.getElementById('mm-result');
  if (!editor) return;

  let inSub = false;
  let cursor = null;

  const masses = {
    H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.81, C: 12.01, N: 14.01, O: 16.00,
    F: 19.00, Ne: 20.18, Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07,
    Cl: 35.45, Ar: 39.95, K: 39.10, Ca: 40.08, Sc: 44.96, Ti: 47.87, V: 50.94, Cr: 52.00,
    Mn: 54.94, Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38, Ga: 69.72, Ge: 72.63,
    As: 74.92, Se: 78.97, Br: 79.90, Kr: 83.80, Rb: 85.47, Sr: 87.62, Y: 88.91, Zr: 91.22,
    Nb: 92.91, Mo: 95.95, Ru: 101.1, Rh: 102.9, Pd: 106.4, Ag: 107.9, Cd: 112.4, In: 114.8,
    Sn: 118.7, Sb: 121.8, Te: 127.6, I: 126.9, Xe: 131.3, Cs: 132.9, Ba: 137.3, La: 138.9,
    Ce: 140.1, Pr: 140.9, Nd: 144.2, Sm: 150.4, Eu: 152.0, Gd: 157.3, Tb: 158.9, Dy: 162.5,
    Ho: 164.9, Er: 167.3, Tm: 168.9, Yb: 173.0, Lu: 175.0, Hf: 178.5, Ta: 180.9, W: 183.8,
    Re: 186.2, Os: 190.2, Ir: 192.2, Pt: 195.1, Au: 197.0, Hg: 200.6, Tl: 204.4, Pb: 207.2,
    Bi: 209.0, Th: 232.0, Pa: 231.0, U: 238.0
  };

  function getFormula() {
    const clone = editor.cloneNode(true);
    const cursorEl = clone.querySelector('.mm-cursor');
    if (cursorEl) cursorEl.remove();
    return clone.innerHTML
      .replace(/<sub>/gi, '').replace(/<\/sub>/gi, '')
      .replace(/<[^>]+>/g, '').trim();
  }

  function calc(formula) {
    if (!formula) return null;
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    let total = 0;
    while ((match = regex.exec(formula)) !== null) {
      const sym = match[1];
      const count = parseInt(match[2]) || 1;
      if (masses[sym]) {
        total += masses[sym] * count;
      }
    }
    return total > 0 ? total : null;
  }

  function removeCursor() {
    if (cursor && cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
    cursor = null;
  }

  function updateCursor() {
    removeCursor();
    if (document.activeElement !== editor) return;
    
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    
    cursor = document.createElement('span');
    cursor.className = 'mm-cursor ' + (inSub ? 'sub' : 'normal');
    cursor.innerHTML = '&ZeroWidthSpace;';
    
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(false);
    range.insertNode(cursor);
  }

  function updateResult() {
    const formula = getFormula();
    const total = calc(formula);
    if (total) {
      resultDiv.textContent = total.toFixed(3) + ' g/mol';
    } else {
      resultDiv.textContent = '';
    }
  }

  editor.addEventListener('focus', updateCursor);
  editor.addEventListener('blur', removeCursor);

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateResult();
      return;
    }
    
    if (e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      const sel = window.getSelection();
      let insideSub = false;
      if (sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).startContainer;
        while (node && node !== editor) {
          if (node.nodeName === 'SUB') { insideSub = true; break; }
          node = node.parentNode;
        }
      }
      if (insideSub && e.key === ' ') {
        inSub = false;
        removeCursor();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          while (node && node !== editor) {
            if (node.nodeName === 'SUB') {
              range.setStartAfter(node);
              range.setEndAfter(node);
              sel.removeAllRanges();
              sel.addRange(range);
              break;
            }
            node = node.parentNode;
          }
        }
      } else if (!insideSub) {
        inSub = true;
      }
      updateCursor();
      return;
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inSub) {
        inSub = false;
        removeCursor();
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          while (node && node !== editor) {
            if (node.nodeName === 'SUB') {
              range.setStartAfter(node);
              range.setEndAfter(node);
              sel.removeAllRanges();
              sel.addRange(range);
              break;
            }
            node = node.parentNode;
          }
        }
        updateCursor();
      }
      return;
    }
    
    if (e.key === 'Backspace') {
      if (editor.textContent === '') inSub = false;
      removeCursor();
      return;
    }
    
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (inSub && /[a-zA-Z]/.test(e.key)) inSub = false;
      
      removeCursor();
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      range.deleteContents();
      
      if (!inSub) {
        let n = range.startContainer;
        while (n && n !== editor) {
          if (n.nodeName === 'SUB') {
            range.setStartAfter(n);
            range.setEndAfter(n);
            break;
          }
          n = n.parentNode;
        }
      }
      
      let node;
      if (inSub) {
        let alreadyInSub = false;
        let n = range.startContainer;
        while (n && n !== editor) {
          if (n.nodeName === 'SUB') { alreadyInSub = true; break; }
          n = n.parentNode;
        }
        node = alreadyInSub ? document.createTextNode(e.key) : (() => {
          const sub = document.createElement('sub');
          sub.textContent = e.key;
          return sub;
        })();
      } else {
        node = document.createTextNode(e.key);
      }
      
      range.insertNode(node);
      range.setStartAfter(node);
      range.setEndAfter(node);
      sel.removeAllRanges();
      sel.addRange(range);
      updateCursor();
      updateResult();
    }
  });

  editor.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' && document.activeElement === editor) {
      updateCursor();
      updateResult();
    }
  });
})();
