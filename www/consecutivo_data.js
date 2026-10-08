// Consecutivo Seed Data (18 filas blancas limpias para edición)
window.initialConsecutivoData = Array.from({ length: 18 }, (_, i) => ({
    consecutivo: i + 1,
    factura: '',
    fechaEmision: '',
    cliente: '',
    folioCliente: '',
    subtotal: '',
    iva: '',
    total: '',
    st: '',
    fechaPago: '',
    referenciaOp: '',
    servicio: '',
    detalle: '',
    nota: '',
    porcRodipak: '',
    rodipak: '',
    hugoComision: '',
    hugoTotal: '',
    porcHugo: ''
}));
