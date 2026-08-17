const TECLAS_BLOQUEADAS = ['e', 'E', '+', '-'];

// Los <input type="number"> de HTML permiten teclear "e" (notación científica,
// ej. "20e2" = 2000) y los signos +/-, aunque acá nunca tiene sentido: costos,
// cantidades y pesos siempre son positivos y no deberían poder escribirse en
// notación científica.
export function bloquearNotacionCientifica(e) {
    if (TECLAS_BLOQUEADAS.includes(e.key)) {
        e.preventDefault();
    }
}
