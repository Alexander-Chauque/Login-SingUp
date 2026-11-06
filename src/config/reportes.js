// Datos de las pantallas de Ventas, Reportes y Auditoría. Solo leen: no modifican nada.
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

import { db } from "./firebaseConfig";
import { comandaParaPantalla, conMensaje, fechaComoTexto, milisegundos, redondear } from "./firestore";

export const PERIODOS = [
  { valor: "hoy", nombre: "Hoy" },
  { valor: "semana", nombre: "Últimos 7 días" },
  { valor: "mes", nombre: "Este mes" },
  { valor: "todo", nombre: "Todo" },
];

// Devuelve el primer milisegundo del período, según la fecha del teléfono
export function inicioDelPeriodo(periodo, ahora = new Date()) {
  if (periodo === "todo") return 0;
  if (periodo === "mes") return new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  if (periodo === "semana") inicio.setDate(inicio.getDate() - 6);
  return inicio.getTime();
}

const enPeriodo = (fecha, inicio) => milisegundos(fecha) >= inicio;

const esPagada = (comanda) => comanda.estado_comanda === "pagado";

// Suma valores por nombre y los devuelve de mayor a menor: [{ nombre, total }]
function ordenarTotales(mapa) {
  return Object.entries(mapa)
    .map(([nombre, total]) => ({ nombre, total: redondear(total) }))
    .sort((a, b) => b.total - a.total);
}

async function leerComandas() {
  const resultado = await getDocs(collection(db, "comandas"));
  return resultado.docs.map((documento) => documento.data());
}

// Las comandas cobradas del período, de la más reciente a la más antigua
export function listarVentas(periodo) {
  return conMensaje(async () => {
    const inicio = inicioDelPeriodo(periodo);
    const comandas = (await leerComandas())
      .filter((comanda) => esPagada(comanda) && enPeriodo(comanda.fecha_hora, inicio))
      .sort((a, b) => milisegundos(b.fecha_hora) - milisegundos(a.fecha_hora));
    const total = redondear(comandas.reduce((suma, comanda) => suma + comanda.total_comanda, 0));
    return { comandas: comandas.map(comandaParaPantalla), total, cantidad: comandas.length };
  });
}

// Calcula todos los reportes del período, con las mismas reglas que los reportes de la web
export function obtenerReportes(periodo) {
  return conMensaje(async () => {
    const inicio = inicioDelPeriodo(periodo);
    const [comandas, platos] = await Promise.all([
      leerComandas(),
      getDocs(collection(db, "platos")),
    ]);
    const categoriaDe = {};
    platos.docs.forEach((documento) => {
      categoriaDe[documento.id] = documento.data().categoria_nombre;
    });

    const pagadas = comandas.filter((c) => esPagada(c) && enPeriodo(c.fecha_hora, inicio));
    const ventasTotales = redondear(pagadas.reduce((suma, c) => suma + c.total_comanda, 0));

    const porDia = {};
    const cantidadPlatos = {};
    const cantidadBebidas = {};
    const ingresosCategoria = {};
    const mozos = {};

    pagadas.forEach((comanda) => {
      const fecha = new Date(milisegundos(comanda.fecha_hora));
      const dia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
      porDia[dia] = (porDia[dia] || 0) + comanda.total_comanda;

      if (!mozos[comanda.mozo]) mozos[comanda.mozo] = { nombre: comanda.mozo, total: 0, cantidad: 0 };
      mozos[comanda.mozo].total += comanda.total_comanda;
      mozos[comanda.mozo].cantidad += 1;

      comanda.items.forEach((item) => {
        if (item.tipo === "plato") {
          cantidadPlatos[item.nombre] = (cantidadPlatos[item.nombre] || 0) + item.cantidad;
          const categoria = categoriaDe[item.id] || "Sin categoría";
          ingresosCategoria[categoria] = (ingresosCategoria[categoria] || 0) + item.precio * item.cantidad;
        } else {
          cantidadBebidas[item.nombre] = (cantidadBebidas[item.nombre] || 0) + item.cantidad;
        }
      });
    });

    // Los métodos se cuentan por la fecha del pago, también en comandas todavía abiertas
    const metodos = {};
    comandas.forEach((comanda) => {
      comanda.pagos.forEach((pago) => {
        if (enPeriodo(pago.fecha_hora, inicio)) {
          metodos[pago.metodo_nombre] = (metodos[pago.metodo_nombre] || 0) + pago.monto;
        }
      });
    });
    // Comandas cobradas antes de que se registrara el método de pago
    const sinRegistro = pagadas
      .filter((comanda) => !comanda.pagos.length)
      .reduce((suma, comanda) => suma + comanda.total_comanda, 0);
    if (sinRegistro) metodos["Sin método registrado"] = sinRegistro;

    return {
      ventas: {
        total: ventasTotales,
        cantidad: pagadas.length,
        ticket: pagadas.length ? redondear(ventasTotales / pagadas.length) : 0,
        porDia: Object.keys(porDia)
          .map(Number)
          .sort((a, b) => a - b)
          .map((dia) => ({ dia, total: redondear(porDia[dia]) })),
      },
      topPlatos: ordenarTotales(cantidadPlatos).slice(0, 5),
      topBebidas: ordenarTotales(cantidadBebidas).slice(0, 5),
      categorias: ordenarTotales(ingresosCategoria),
      mozos: Object.values(mozos)
        .map((mozo) => ({ ...mozo, total: redondear(mozo.total) }))
        .sort((a, b) => b.total - a.total),
      metodos: ordenarTotales(metodos),
    };
  });
}

// Los últimos registros de auditoría, del más reciente al más antiguo
export function listarAuditoria() {
  return conMensaje(async () => {
    const consulta = query(collection(db, "auditoria"), orderBy("fecha_hora", "desc"), limit(300));
    const resultado = await getDocs(consulta);
    return resultado.docs
      .map((documento) => documento.data())
      .sort((a, b) => milisegundos(b.fecha_hora) - milisegundos(a.fecha_hora))
      .map((registro) => ({ ...registro, fecha_hora: fechaComoTexto(registro.fecha_hora) }));
  });
}
