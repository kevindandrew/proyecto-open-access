export const INCOTERMS_INFO = {
    FOB: {
        nombre: 'Free On Board',
        explicacion:
            'El vendedor entrega la mercadería subida al barco en el puerto de origen; de ahí en adelante el riesgo y el costo del viaje son del comprador.',
    },
    EXW: {
        nombre: 'Ex Works',
        explicacion:
            'El vendedor solo pone la mercadería disponible en su propia bodega — el comprador se encarga de todo lo demás (transporte, seguro, aduana).',
    },
    CIF: {
        nombre: 'Cost, Insurance and Freight',
        explicacion:
            'El vendedor paga el flete y el seguro hasta el puerto de destino; de ahí en adelante es responsabilidad del comprador.',
    },
    CFR: {
        nombre: 'Cost and Freight',
        explicacion:
            'El vendedor paga el flete hasta el puerto de destino, pero el comprador tiene que conseguir su propio seguro.',
    },
    DDP: {
        nombre: 'Delivered Duty Paid',
        explicacion:
            'El vendedor se hace cargo de todo, incluyendo impuestos de importación, hasta dejar la mercadería en la puerta del comprador.',
    },
};

export const TIPO_SERVICIO_INFO = {
    FCL: {
        nombre: 'Full Container Load',
        explicacion: 'El cliente alquila un contenedor completo para su carga, lo llene o no.',
    },
    LCL: {
        nombre: 'Less than Container Load',
        explicacion:
            'El cliente comparte un contenedor con carga de otros clientes ("consolidado") y paga solo por el espacio (m³) que usa.',
    },
};

export const TIPO_CONTENEDOR_INFO = {
    '20 DRY': {
        nombre: "Contenedor Estándar de 20'",
        explicacion: 'El más chico de los tres — se usa para carga pesada y densa (ej. cemento, maquinaria).',
    },
    '40 DRY': {
        nombre: "Contenedor Estándar de 40'",
        explicacion: 'El doble de largo que el de 20\' — para carga voluminosa pero no tan pesada.',
    },
    '40 HC': {
        nombre: "Contenedor High Cube de 40'",
        explicacion: 'Igual de largo que el de 40\' estándar, pero más alto — más volumen para carga liviana y voluminosa.',
    },
    '45 HC': {
        nombre: "Contenedor High Cube de 45'",
        explicacion: 'El más largo y alto de los estándar — para carga muy voluminosa y liviana.',
    },
    '20 REEFER': {
        nombre: "Contenedor Refrigerado de 20'",
        explicacion: 'Contenedor con control de temperatura — para carga perecedera o sensible al calor.',
    },
    '40 REEFER': {
        nombre: "Contenedor Refrigerado de 40'",
        explicacion: 'Versión más grande del refrigerado — mayor volumen para carga perecedera.',
    },
    '20 OPEN TOP': {
        nombre: "Contenedor Open Top de 20'",
        explicacion: 'Sin techo rígido (se cubre con lona) — para carga que no entra por la puerta, se carga por arriba.',
    },
    '40 OPEN TOP': {
        nombre: "Contenedor Open Top de 40'",
        explicacion: 'Versión más grande del Open Top — para carga alta o voluminosa que se carga por arriba.',
    },
    '20 FLAT RACK': {
        nombre: "Contenedor Flat Rack de 20'",
        explicacion: 'Sin paredes laterales — para carga sobredimensionada o de forma irregular.',
    },
    '40 FLAT RACK': {
        nombre: "Contenedor Flat Rack de 40'",
        explicacion: 'Versión más grande del Flat Rack — para carga larga, pesada o de forma irregular.',
    },
};
