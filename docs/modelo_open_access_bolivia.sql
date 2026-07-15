-- =====================================================================
-- MODELO DE BASE DE DATOS - OPEN ACCESS BOLIVIA SRL (Agencia de carga)
-- Basado en: COTIZACIONES_PRINCIPAL.xlsx y EXCEL_MODIFICADO_2.xlsx
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. SEGURIDAD / PERSONAL
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    id_rol          SERIAL PRIMARY KEY,
    nombre_rol      VARCHAR(50) NOT NULL UNIQUE
    -- 4 roles reales de la empresa. El rol "Administrativo" NO existe como
    -- persona aparte: sus funciones (cargar tarifas, liquidar aranceles/
    -- impuestos de destino, informar la ruta al cliente) las realiza el
    -- Gerente Operativo.
);

INSERT INTO roles (nombre_rol) VALUES
    ('Gerente Comercial'),
    ('Comercial'),
    ('Gerente Operativo'),
    ('Operativo');

CREATE TABLE empleados (
    id_empleado             SERIAL PRIMARY KEY,
    nombre_completo         VARCHAR(150) NOT NULL,
    ci                      VARCHAR(20),
    telefono                VARCHAR(30),
    email                   VARCHAR(120),
    id_rol                  INT NOT NULL REFERENCES roles(id_rol),
    especialidad_operativa  VARCHAR(20)
        CHECK (especialidad_operativa IN ('Maritimo','Aereo','Terrestre') OR especialidad_operativa IS NULL),
    -- Solo aplica si id_rol = Operativo. Justificacion: el usuario indico
    -- que existen operativos de transporte terrestre, aereo o maritimo.
    id_jefe                 INT REFERENCES empleados(id_empleado),
    -- Autorreferencia: resuelve "el gerente ve todo lo de su equipo"
    -- sin crear una tabla distinta por rol.
    activo                  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- B. CATALOGOS GEOGRAFICOS
-- ---------------------------------------------------------------------

CREATE TABLE ciudades (
    cod_ciudad      VARCHAR(2) PRIMARY KEY,
    -- Codigos calcados literal de la hoja BASE DE DATOS:
    -- 01 La Paz, 02 El Alto, 03 Santa Cruz, 04 Oruro,
    -- 05 Cochabamba, 06 Sucre, 07 Potosi
    nombre_ciudad   VARCHAR(60) NOT NULL
);

CREATE TABLE puertos_aeropuertos (
    codigo          VARCHAR(10) PRIMARY KEY,
    -- Ej: CHSHA (Shanghai), LPB (Aeropuerto El Alto). Ver hoja "COD".
    nombre          VARCHAR(150) NOT NULL,
    tipo            VARCHAR(15) NOT NULL CHECK (tipo IN ('Puerto','Aeropuerto','Frontera')),
    pais            VARCHAR(60)
);

-- ---------------------------------------------------------------------
-- C. CLIENTES
-- ---------------------------------------------------------------------

CREATE TABLE clientes (
    id_cliente          SERIAL PRIMARY KEY,
    id_comercial        INT REFERENCES empleados(id_empleado),
    -- Comercial "dueño" de la cuenta (columna COMERCIAL en BASE DE DATOS)
    razon_social        VARCHAR(200) NOT NULL,
    nit                 VARCHAR(30),
    id_ciudad           VARCHAR(2) REFERENCES ciudades(cod_ciudad),
    direccion           TEXT,
    persona_contacto    VARCHAR(150),
    telefono1           VARCHAR(30),
    celular_whatsapp    VARCHAR(30),
    email               VARCHAR(120),
    correo_factura      VARCHAR(120),
    condicion_pago      VARCHAR(50) DEFAULT 'Al contado',
    otro                TEXT
);

-- ---------------------------------------------------------------------
-- D. PROVEEDORES (navieras, aerolineas, transportistas, agentes de origen)
-- ---------------------------------------------------------------------

CREATE TABLE proveedores (
    id_proveedor        SERIAL PRIMARY KEY,
    tipo                VARCHAR(20) NOT NULL
        CHECK (tipo IN ('Naviera','Aerolinea','Transportista','Agente_Origen')),
    nombre              VARCHAR(200) NOT NULL,
    nombre_fantasia     VARCHAR(100),
    codigo_interno      VARCHAR(20),
    -- Ej: MSC, ONE, 101 (Tiger), 103 (Okay Logistics) - ver hoja "PROVEE"
    contacto            VARCHAR(150),
    direccion1          TEXT,
    direccion2          TEXT,
    ciudad              VARCHAR(100),
    pais                VARCHAR(60),
    telefono            VARCHAR(50),
    celular             VARCHAR(30),
    nit                 VARCHAR(30),
    email               VARCHAR(200)
);

-- ---------------------------------------------------------------------
-- E. TARIFARIO (lo que carga el Gerente Operativo, insumo de las cotizaciones)
-- ---------------------------------------------------------------------

CREATE TABLE tarifas (
    id_tarifa               SERIAL PRIMARY KEY,
    id_proveedor            INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_origen               VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    id_destino              VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    modo                    VARCHAR(15) NOT NULL CHECK (modo IN ('Maritimo','Aereo','Terrestre')),
    tipo_servicio           VARCHAR(10) CHECK (tipo_servicio IN ('FCL','LCL')),
    costo_20                NUMERIC(12,2),
    costo_40                NUMERIC(12,2),
    costo_40hc              NUMERIC(12,2),
    moneda                  VARCHAR(5) DEFAULT 'USD',
    tipo_tarifa             VARCHAR(20) DEFAULT 'Normal',
    -- Ej: 'Normal' o 'Diamante' (tarifas preferenciales vistas en TARIFAS MSL)
    fecha_inicio_vigencia   DATE NOT NULL,
    fecha_fin_vigencia      DATE NOT NULL
);

CREATE TABLE tarifa_cargos_adicionales (
    id_cargo        SERIAL PRIMARY KEY,
    id_tarifa       INT NOT NULL REFERENCES tarifas(id_tarifa) ON DELETE CASCADE,
    concepto        VARCHAR(100) NOT NULL,
    -- Ej: "THC/CNTR", "MBL RELEASE", "Box Fee", "Visto Bueno Full/Cntr"
    -- Se normaliza en tabla hija porque cada naviera define cargos distintos
    -- (ver diferencias entre hojas TARIFAS ONE / MSL / EVERGREEN / TIGER).
    monto           NUMERIC(12,2) NOT NULL,
    moneda          VARCHAR(5) DEFAULT 'USD'
);

-- ---------------------------------------------------------------------
-- F. COTIZACIONES
-- ---------------------------------------------------------------------

CREATE TABLE cotizaciones (
    id_cotizacion       SERIAL PRIMARY KEY,
    numero_referencia   VARCHAR(30) UNIQUE NOT NULL,
    -- Formato visto: RACHLPZ/26-0001
    id_cliente          INT NOT NULL REFERENCES clientes(id_cliente),
    id_comercial        INT NOT NULL REFERENCES empleados(id_empleado),
    modo_transporte     VARCHAR(15) NOT NULL CHECK (modo_transporte IN ('Maritimo','Aereo','Terrestre')),
    tipo_servicio       VARCHAR(10) CHECK (tipo_servicio IN ('FCL','LCL')),
    incoterm            VARCHAR(10),
    id_pol              VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    id_pod              VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    destino_final       VARCHAR(150),
    fecha_emision       DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_validez       DATE NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'Cotizado'
        CHECK (estado IN ('Cotizado','Aceptado','Rechazado','Vencido')),
    peso_kg             NUMERIC(12,2),
    volumen_cbm         NUMERIC(12,3),
    mercancia_peligrosa BOOLEAN DEFAULT FALSE,
    dias_transito       INT
);

CREATE TABLE cotizacion_contenedores (
    id_item             SERIAL PRIMARY KEY,
    id_cotizacion       INT NOT NULL REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    tipo_contenedor     VARCHAR(10) NOT NULL,
    -- Ej: 20 DRY, 40 DRY, 40 HC. Una cotizacion puede llevar varios tipos
    -- a la vez (se vio 2x40 DRY + 1x20 DRY en el mismo documento).
    cantidad            INT NOT NULL DEFAULT 1
);

CREATE TABLE cotizacion_detalle (
    id_detalle          SERIAL PRIMARY KEY,
    id_cotizacion       INT NOT NULL REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    nro_item            INT,
    descripcion         VARCHAR(200) NOT NULL,
    -- Ej: Ocean Freight, THC Origen, BL Fee, Aduana Exportacion, Seguro,
    -- Pickup/Haulage, THC Destino, Delivery Order, Freight Forwarder Fee
    tipo_tarifa_unidad  VARCHAR(50),
    -- Ej: "Per Container", "Per Shipment", "% of CIF Value", "Por W/M"
    costo_unitario      NUMERIC(12,2),
    base_calculo        NUMERIC(12,3) DEFAULT 1,
    moneda              VARCHAR(5) DEFAULT 'USD',
    costo_total         NUMERIC(12,2)
);

-- ---------------------------------------------------------------------
-- G. EXPEDIENTE / EMBARQUE (una vez aceptada la cotizacion)
-- ---------------------------------------------------------------------

CREATE TABLE embarques (
    id_embarque             SERIAL PRIMARY KEY,
    numero_file             VARCHAR(30) UNIQUE NOT NULL,
    id_cotizacion           INT REFERENCES cotizaciones(id_cotizacion),
    id_cliente              INT NOT NULL REFERENCES clientes(id_cliente),
    consignatario           VARCHAR(200),
    id_comercial            INT REFERENCES empleados(id_empleado),
    id_operativo            INT REFERENCES empleados(id_empleado),
    -- Se asigna segun especialidad_operativa = modo_transporte
    id_agente_origen        INT REFERENCES proveedores(id_proveedor),
    id_naviera_aerolinea    INT REFERENCES proveedores(id_proveedor),
    modo_transporte         VARCHAR(15) NOT NULL CHECK (modo_transporte IN ('Maritimo','Aereo','Terrestre')),
    tipo_embarque           VARCHAR(10) CHECK (tipo_embarque IN ('IMPO','EXPO','DOM')),
    oficina_venta           VARCHAR(60),
    oficina_operacional     VARCHAR(60),
    mbl                     VARCHAR(50),
    id_pol                  VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    id_pod                  VARCHAR(10) REFERENCES puertos_aeropuertos(codigo),
    destino_final           VARCHAR(150),
    etd                     DATE,
    eta                     DATE,
    nave                    VARCHAR(100),
    viaje                   VARCHAR(30),
    pago_master             VARCHAR(15) CHECK (pago_master IN ('Prepaid','Collect')),
    estado_embarque         VARCHAR(30) NOT NULL DEFAULT 'Confirmado_Origen'
        CHECK (estado_embarque IN (
            'Confirmado_Origen','En_Transito','En_Aduana_Destino',
            'Entregado','Cerrado'
        ))
);

CREATE TABLE house_bl (
    id_hbl              SERIAL PRIMARY KEY,
    id_embarque         INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    numero_hbl          VARCHAR(50) NOT NULL,
    -- Se detectaron hasta 4 HBL distintos por expediente (Ventas FCL)
    condicion_pago      VARCHAR(15) CHECK (condicion_pago IN ('Prepaid','Collect')),
    fecha_emision       DATE
);

CREATE TABLE embarque_contenedores (
    id_item                 SERIAL PRIMARY KEY,
    id_embarque             INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    tipo_contenedor         VARCHAR(10),
    numero_contenedor       VARCHAR(20),
    numero_sello            VARCHAR(20),
    peso_kg                 NUMERIC(12,2),
    volumen_cbm             NUMERIC(12,3),
    descripcion_mercancia   TEXT,
    fecha_devolucion        DATE
    -- Campos tomados de la hoja "INFORMACION CARGA"
);

CREATE TABLE embarque_costos (
    id_costo            SERIAL PRIMARY KEY,
    id_embarque         INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    concepto            VARCHAR(100) NOT NULL,
    -- Ej: Ocean Freight, Land Freight, Air Freight
    id_proveedor        INT REFERENCES proveedores(id_proveedor),
    costo_compra        NUMERIC(12,2) NOT NULL,
    costo_venta         NUMERIC(12,2) NOT NULL,
    moneda              VARCHAR(5) DEFAULT 'USD'
    -- profit = costo_venta - costo_compra (se calcula en consulta/vista,
    -- no se guarda para evitar inconsistencias si cambian los montos)
);

-- ---------------------------------------------------------------------
-- H. SEGUIMIENTO, DOCUMENTOS Y CIERRE
-- ---------------------------------------------------------------------

CREATE TABLE seguimiento_embarque (
    id_seguimiento          SERIAL PRIMARY KEY,
    id_embarque             INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    fecha                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                  VARCHAR(30) NOT NULL,
    comentario              TEXT,
    id_empleado_responsable INT REFERENCES empleados(id_empleado)
    -- Bitacora: resuelve "informar al cliente la ruta de su producto"
);

CREATE TABLE documentos_embarque (
    id_documento        SERIAL PRIMARY KEY,
    id_embarque         INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    tipo_documento      VARCHAR(50) NOT NULL,
    -- Catalogo sugerido segun tus plantillas existentes: MBL, HBL,
    -- Aviso de Arribo, Carta de Liberacion, Prealerta, AWB, Manifiesto,
    -- Certificado de Flete, Carta de Deslinde de Responsabilidad
    numero_documento    VARCHAR(50),
    fecha_emision       DATE,
    archivo_url         TEXT
);

CREATE TABLE gastos_destino (
    id_gasto            SERIAL PRIMARY KEY,
    id_embarque         INT NOT NULL REFERENCES embarques(id_embarque) ON DELETE CASCADE,
    concepto            VARCHAR(20) NOT NULL CHECK (concepto IN ('Arancel','Impuesto','Tasa','Otro')),
    -- Costos explicitamente excluidos de la cotizacion original, liquidados
    -- por el Gerente Operativo (ver Terminos y Condiciones: "excluyen
    -- aranceles, impuestos...")
    monto               NUMERIC(12,2) NOT NULL,
    moneda              VARCHAR(5) DEFAULT 'USD',
    pagado              BOOLEAN DEFAULT FALSE,
    fecha_pago          DATE
);

-- ---------------------------------------------------------------------
-- I. TIPO DE CAMBIO (referenciado en tus tarifas, ej "6.97 Bs/USD")
-- ---------------------------------------------------------------------

CREATE TABLE tipo_cambio (
    id_tc               SERIAL PRIMARY KEY,
    fecha               DATE NOT NULL,
    moneda_origen       VARCHAR(5) NOT NULL,
    moneda_destino      VARCHAR(5) NOT NULL,
    valor               NUMERIC(10,4) NOT NULL
);
