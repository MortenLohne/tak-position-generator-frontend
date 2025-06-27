mod utils;

use std::str::FromStr;

use pgn_traits::PgnPosition;
use tiltak::position::{position_gen::PositionEncoder, Position};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-position-generator!");
}

// Called when the Wasm module is instantiated
#[wasm_bindgen(start)]
fn main() -> Result<(), JsValue> {
    utils::set_panic_hook();

    Ok(())
}

#[wasm_bindgen]
pub struct PositionGenerator {
    size6: PositionEncoder<6>,
}

#[wasm_bindgen]
impl PositionGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        PositionGenerator {
            size6: PositionEncoder::initialize(),
        }
    }

    #[wasm_bindgen(js_name = numLegalPositions)]
    pub fn num_legal_positions(&self, size: usize) -> js_sys::BigInt {
        let result = match size {
            6 => self.size6.count_legal_positions(),
            _ => panic!("Unsupported size: {}", size),
        };
        js_sys::BigInt::from_str(&result.to_string()).unwrap()
    }

    pub fn encode(&self, tps: &str, size: usize) -> js_sys::BigInt {
        let result = match size {
            6 => encode_tps(&self.size6, tps),
            _ => panic!("Unsupported size: {}", size),
        };
        js_sys::BigInt::from_str(&result.to_string()).unwrap()
    }

    /// Panics if the input is negative, or larger than the maximum legal position for the given size.
    pub fn decode(&self, js_n: &js_sys::BigInt, size: usize) -> String {
        let rust_n = num_bigint::BigUint::from_str(&ToString::to_string(js_n)).unwrap();
        let result = match size {
            6 => self.size6.decode(rust_n),
            _ => panic!("Unsupported size: {}", size),
        };
        result.to_fen()
    }
}

fn encode_tps<const S: usize>(encoder: &PositionEncoder<S>, tps: &str) -> num_bigint::BigUint {
    let position: Position<S> = Position::from_fen(&tps).unwrap();
    encoder.encode(&position)
}
