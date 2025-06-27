function randomBigInt(max) {
    const maxBits = max.toString(2).length;
    const byteLength = Math.ceil(maxBits / 8);

    function getRandomBigInt() {
        const bytes = new Uint8Array(byteLength);
        crypto.getRandomValues(bytes); // Uses secure random number generator
        let result = 0n;
        for (let byte of bytes) {
            result = (result << 8n) + BigInt(byte);
        } return result;
    } let rnd; do { rnd = getRandomBigInt(); } while (rnd >
        max);
    return rnd;
}

// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use. Currently browsers
// don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import init, { PositionGenerator } from './wasm-position-generator/pkg/wasm_position_generator.js';

let ptnNinjaHasLoaded = false;
let tps = "x6/x6/x6/x6/x6/x6 1 1";
let positionGenerator;

async function initPositionGen() {
    await init();
    console.log("Wasm module loaded");

    const startTime = performance.now();
    positionGenerator = new PositionGenerator();

    console.log(`PositionGenerator initialized in ${performance.now() - startTime} ms`);
    console.log("legal 6s positions: ", positionGenerator.numLegalPositions(6));
}

const setRandomPosition = () => {
    const max_number = positionGenerator.numLegalPositions(6);
    const n = randomBigInt(max_number);
    console.log("Random n:", n.toString());
    document.getElementById('numberInput').value = n.toString();
    const newTps = positionGenerator.decode(n, 6);
    numberInput.classList.remove("input-error");
    setNewTps(newTps);
}

initPositionGen()

window.addEventListener(
    "message",
    (event) => {
        if (event.source !== ninja.contentWindow) {
            return
        }

        if (!ptnNinjaHasLoaded) {
            if (event.data.action === "GAME_STATE") {
                ptnNinjaHasLoaded = true;
            } else {
                return; // Ignore other messages until ptn.ninja is fully loaded
            }
        }

        if (event.data.action === "GAME_STATE") {
            const gameState = event.data.value;
            tps = gameState.tps;

            document.getElementById('tpsInput').value = tps;
            const n = positionGenerator.encode(tps, 6);

            console.log("ptn.ninja loaded, tps:", tps);
            console.log(`n=${n}`);

            document.getElementById('numberInput').value = n;
        } else {
            return; // Ignore other messages until ptn.ninja is fully loaded
        }
    },
    false
);

// Set a new TPS, and display it in the ptn.ninja iframe
const setNewTps = newTps => {
    tps = newTps;
    document.getElementById('tpsInput').value = newTps;
    console.log("New TPS set:", tps);

    const ninja = document.getElementById("ninja");
    const newPtn = `[TPS "${tps}"]`;
    ninja.contentWindow.postMessage({ action: "SET_CURRENT_PTN", value: newPtn }, "*");
}

const randomPositionButton = document.getElementById("randomPositionButton");

randomPositionButton.addEventListener(
    "click",
    (event) => {
        setRandomPosition();
    },
    true
);

const resetButton = document.getElementById("resetButton");

resetButton.addEventListener(
    "click",
    (event) => {
        const newTps = "x6/x6/x6/x6/x6/x6 1 1";
        setNewTps(newTps);
        document.getElementById('numberInput').value = "0";
    },
    true
);

const numberInput = document.getElementById("numberInput");

numberInput.addEventListener(
    "input",
    (event) => {
        let n;
        try {
            n = BigInt(event.target.value);
        } catch (error) {
            console.warn("Invalid input for number input:", event.target.value);
            numberInput.classList.add("input-error");
            return;
        }
        console.log("Number input changed:", n.toString());
        let maxN = positionGenerator.numLegalPositions(6);
        if (n < 0 || n >= maxN) {
            console.warn(`Number input out of range [0, ${maxN})`);
            numberInput.classList.add("input-error");
            return;
        }
        numberInput.classList.remove("input-error");
        const newTps = positionGenerator.decode(n, 6);
        setNewTps(newTps);
    },
    true
);