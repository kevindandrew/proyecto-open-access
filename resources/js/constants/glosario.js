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
};
