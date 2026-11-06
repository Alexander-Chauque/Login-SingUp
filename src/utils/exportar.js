// Crea un PDF y abre el menú del teléfono para guardarlo o compartirlo.
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// Evita que un texto cargado por alguien se interprete como parte del documento
export const escapar = (texto) =>
  String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// secciones: [{ titulo, columnas: ["Nombre", ...], filas: [["Valor", ...], ...] }]
export function armarDocumento(titulo, subtitulo, secciones) {
  const tablas = secciones
    .map(
      ({ titulo: nombre, columnas, filas }) => `
      <h2>${escapar(nombre)}</h2>
      ${
        filas.length
          ? `<table>
              <tr>${columnas.map((c) => `<th>${escapar(c)}</th>`).join("")}</tr>
              ${filas.map((f) => `<tr>${f.map((v) => `<td>${escapar(v)}</td>`).join("")}</tr>`).join("")}
            </table>`
          : "<p>Sin datos.</p>"
      }`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, sans-serif; color: #3D3D3D; padding: 24px; }
    h1 { font-size: 22px; margin: 0; }
    h2 { font-size: 15px; margin: 22px 0 8px; border-bottom: 2px solid #F5A623; padding-bottom: 4px; }
    p { font-size: 12px; color: #6B7280; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; background: #3D3D3D; color: #FFFFFF; padding: 6px; }
    td { padding: 6px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
  </style></head><body>
    <h1>Los Cardones · ${escapar(titulo)}</h1>
    <p>${escapar(subtitulo)}</p>
    ${tablas}
  </body></html>`;
}

export async function compartirPDF(titulo, subtitulo, secciones) {
  try {
    const { uri } = await Print.printToFileAsync({ html: armarDocumento(titulo, subtitulo, secciones) });
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("Este dispositivo no permite compartir archivos.");
    }
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: titulo, UTI: "com.adobe.pdf" });
  } catch (error) {
    throw new Error(error?.message || "No se pudo crear el PDF.");
  }
}
