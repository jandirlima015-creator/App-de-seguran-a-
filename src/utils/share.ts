import { HazardReport } from "../types";

/**
 * Encodes a HazardReport object into a Base64 string for URL sharing
 */
export function encodeReportToUrl(report: HazardReport): string {
  try {
    const jsonStr = JSON.stringify(report);
    // Use encodeURIComponent to handle special characters, then convert to base64
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = new URL(window.location.href);
    url.searchParams.set("report", base64);
    return url.toString();
  } catch (error) {
    console.error("Erro ao codificar relatório:", error);
    return "";
  }
}

/**
 * Decodes a Base64 string from the URL query parameter into a HazardReport object
 */
export function decodeReportFromUrl(): HazardReport | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const base64 = urlParams.get("report");
    if (!base64) return null;

    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const report = JSON.parse(jsonStr) as HazardReport;
    
    // Safety check for basic fields
    if (report && report.activityName && report.id) {
      return report;
    }
    return null;
  } catch (error) {
    console.error("Erro ao decodificar relatório:", error);
    return null;
  }
}

/**
 * Generates formatted text for copying to clipboard (ideal for WhatsApp / Telegram)
 */
export function generateWhatsAppFormat(report: HazardReport): string {
  const dateStr = report.date.split("-").reverse().join("/");
  let text = `🚨 *RELATO DE SEGURANÇA DO TRABALHO* 🚨\n\n`;
  text += `*Atividade:* ${report.activityName}\n`;
  text += `*Setor/Depto:* ${report.department || "Não informado"} | *Área:* ${report.location || "Não informada"}\n`;
  text += `*Data/Hora:* ${dateStr} às ${report.time}\n`;
  text += `*Status:* ${report.status === "Aberto" ? "🟠 Aberto (Em Análise)" : "🟢 Resolvido/Controlado"}\n`;
  text += `*Relatado por:* ${report.reportedBy || "Anônimo"}\n\n`;
  text += `📝 *Descrição do Risco:*\n${report.description}\n\n`;
  
  if (report.immediateAction) {
    text += `🛡️ *Ação Imediata Tomada:*\n${report.immediateAction}\n\n`;
  }

  if (report.analysis) {
    const risk = report.analysis;
    text += `🤖 *ANÁLISE DE RISCO POR IA*:\n`;
    text += `*Grau de Risco:* ${risk.riskLevel.toUpperCase()}\n`;
    text += `*Avaliação Técnica:* ${risk.riskAssessment}\n\n`;
    
    if (risk.episRecommended?.length) {
      text += `🥾 *EPIs Recomendados:* ${risk.episRecommended.join(", ")}\n`;
    }
    if (risk.epcsRecommended?.length) {
      text += `🚧 *EPCs Recomendados:* ${risk.epcsRecommended.join(", ")}\n`;
    }
    if (risk.applicableNRs?.length) {
      text += `📋 *NRs Aplicáveis:* ${risk.applicableNRs.join(", ")}\n`;
    }
  }

  const shareLink = encodeReportToUrl(report);
  if (shareLink) {
    text += `\n🔗 *Ver Relatório Completo & APR:*\n${shareLink}`;
  }

  return text;
}
