const typeColors = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD"
};

const typeChart = {
  Normal:     { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:       { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:      { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric:   { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:      { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:        { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting:   { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:     { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:     { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:     { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:    { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:        { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:       { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:      { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:     { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:       { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:      { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Fairy: 2, Steel: 0.5 },
  Fairy:      { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
};

const typeList = Object.keys(typeColors);

let selectedTypes = [];

const buttonsContainer = document.getElementById("type-buttons");
const resultContainer = document.getElementById("result");

// Helper: lighten hex color to pale version with alpha
function hexToRGBA(hex, alpha = 0.3) {
  const r = parseInt(hex.substring(1,3),16);
  const g = parseInt(hex.substring(3,5),16);
  const b = parseInt(hex.substring(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Create buttons dynamically
function createButtons() {
  typeList.forEach(type => {
    const btn = document.createElement("button");
    btn.classList.add("type-btn");
    btn.id = type;
    btn.textContent = type;
    // Set pale background color as inline CSS variable --pale-color
    btn.style.setProperty("--pale-color", hexToRGBA(typeColors[type]));
    btn.style.backgroundColor = hexToRGBA(typeColors[type]);
    btn.style.color = "#111"; // text color on pale background
    btn.addEventListener("click", () => toggleType(type));
    buttonsContainer.appendChild(btn);
  });
}

function toggleType(type) {
  const index = selectedTypes.indexOf(type);
  if (index !== -1) {
    selectedTypes.splice(index, 1);
  } else {
    if (selectedTypes.length === 2) {
      selectedTypes.shift();
    }
    selectedTypes.push(type);
  }
  updateButtonStyles();
  calculateMatchup();
}

function updateButtonStyles() {
  typeList.forEach(type => {
    const btn = document.getElementById(type);
    if (selectedTypes.includes(type)) {
      btn.classList.add("selected");
      btn.style.backgroundColor = typeColors[type];
      btn.style.color = "#fff";
      btn.style.boxShadow = `0 0 8px 2px ${typeColors[type]}`;
    } else {
      btn.classList.remove("selected");
      btn.style.backgroundColor = hexToRGBA(typeColors[type]);
      btn.style.color = "#111";
      btn.style.boxShadow = "none";
    }
  });
}

function calculateMatchup() {
  resultContainer.innerHTML = "";

  if (selectedTypes.length === 0) {
    return;
  }

  const effectiveness = {};

  typeList.forEach(attacking => {
    let multiplier = 1;
    selectedTypes.forEach(defending => {
      if (typeChart[attacking] && typeChart[attacking][defending] != null) {
        multiplier *= typeChart[attacking][defending];
      }
    });
    effectiveness[attacking] = multiplier;
  });

  const grouped = {
    Immune: [],
    "¼×": [],
    "½×": [],
    "1×": [],
    "2×": [],
    "4×": []
  };

  for (const [type, value] of Object.entries(effectiveness)) {
    if (value === 0) grouped["Immune"].push(type);
    else if (value === 0.25) grouped["¼×"].push(type);
    else if (value === 0.5) grouped["½×"].push(type);
    else if (value === 1) grouped["1×"].push(type);
    else if (value === 2) grouped["2×"].push(type);
    else if (value === 4) grouped["4×"].push(type);
  }

  const columns = document.createElement("div");
  columns.style.display = "flex";
  columns.style.flexWrap = "wrap";
  columns.style.gap = "20px";
  columns.style.justifyContent = "center";

  for (const [label, types] of Object.entries(grouped)) {
    if (types.length === 0) continue;

    const col = document.createElement("div");
    col.style.minWidth = "80px";

    const heading = document.createElement("h3");
    heading.textContent = label;
    heading.style.color = "white";
    heading.style.borderBottom = "1px solid #666";
    heading.style.marginBottom = "0.5em";
    heading.style.textAlign = "center";
    col.appendChild(heading);

    types.forEach(t => {
      const p = document.createElement("p");
      p.textContent = t;
      p.style.color = typeColors[t];
      p.style.margin = "3px 0";
      p.style.textAlign = "center";
      col.appendChild(p);
    });

    columns.appendChild(col);
  }

  resultContainer.appendChild(columns);
}

// Initialize
createButtons();
updateButtonStyles();
