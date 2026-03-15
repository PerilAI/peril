import { initPeril } from "./peril";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>My Vanilla App</h1>
    <button id="counter" type="button">Count: 0</button>
  </div>
`;

const counter = document.querySelector<HTMLButtonElement>("#counter")!;
let count = 0;
counter.addEventListener("click", () => {
  count++;
  counter.textContent = `Count: ${count}`;
});

// Initialize Peril review overlay (Ctrl+Shift+R to toggle)
initPeril();
