document.addEventListener("DOMContentLoaded", function() {
  const menuHTML = `
    <ul>
      <li><a href="/F1-Car-Setups/">Car Setups</a></li>
      <li><a href="compounds.html">Tire Compounds</a></li>
      <li><a href="about.html">About</a></li>
    </ul>
  `;
  const sideMenu = document.getElementById("sideMenu");
  if (sideMenu) {
    sideMenu.innerHTML = menuHTML;
  }
});