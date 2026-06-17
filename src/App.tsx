/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  HardHat, 
  TriangleAlert, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Clipboard, 
  Printer, 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  CheckSquare, 
  Square, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Info,
  X,
  ExternalLink,
  ClipboardCheck,
  AlertOctagon,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HazardReport, RiskAnalysis } from "./types";
import { decodeReportFromUrl, encodeReportToUrl, generateWhatsAppFormat } from "./utils/share";

export default function App() {
  // Application Modes & States
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [activeReport, setActiveReport] = useState<HazardReport | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  
  // Form input states
  const [activityName, setActivityName] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [immediateAction, setImmediateAction] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  
  // Custom temporary signature and verification states
  const [customSigner, setCustomSigner] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Loading steps list to make the AI prompt phase look immersive and technical
  const loadingSteps = [
    "Analisando descrição de desvio...",
    "Avaliando severidade do risco em campo...",
    "Cruzando dados com as Normas Regulamentadoras (NRs)...",
    "Agrupando EPIs e EPCs de proteção obrigatória...",
    "Formatando questionário de liberação da APR..."
  ];

  // 1. Initial Load: Check if loading a shared report or loading local history
  useEffect(() => {
    const shared = decodeReportFromUrl();
    if (shared) {
      setIsSharedView(true);
      setActiveReport(shared);
      triggerToast("Relatório compartilhado carregado por link com sucesso!");
    } else {
      // Decode from local storage
      const saved = localStorage.getItem("safefield_reports");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as HazardReport[];
          setReports(parsed);
          if (parsed.length > 0) {
            setActiveReport(parsed[0]);
          }
        } catch (e) {
          console.error("Erro ao carregar do localStorage", e);
        }
      } else {
        // Seed default template for empty state
        const initialSeed: HazardReport = {
          id: "seed-report-roofing",
          activityName: "Manutenção do Telhado do Galpão Logístico",
          location: "Frente de Trabalho Sul - Galpão B",
          department: "Manutenção Geral",
          description: "Instalação de telhas translúcidas em altura aproximada de 8 metros. Presença de ventos moderados na área e teto úmido devido à neblina matinal. Risco iminente de queda de pessoas e ferramentas devido à ausência de linha de vida definitiva e isolamento no nível do solo.",
          immediateAction: "Trabalho suspenso temporariamente pela comissão de segurança até a devida fixação das linhas de vida provisórias e amarração dos pontos de ancoragem.",
          reportedBy: "Siqueira - Tec. de Segurança",
          date: "2026-06-16",
          time: "14:30",
          status: "Aberto",
          analysis: {
            riskLevel: "Alto",
            riskLevelColor: "orange",
            riskAssessment: "O trabalho em altura de 8 metros sobre telhas úmidas oferece altíssimo potencial de queda com consequências fatais. A quebra de telhas de fibrocimento ou deslizamento é um fator físico crítico. Linhas de vida temporárias são emergenciais, sendo obrigatória a ancoragem contínua de 100% dos trabalhadores.",
            episRecommended: [
              "Cinturão de segurança tipo paraquedista com duplo talabarte em Y",
              "Dispositivo trava-quedas de segurança guiado em cabo/corda",
              "Capacete de proteção com jugular fixa",
              "Óculos de segurança com proteção contra raios solares",
              "Bota de segurança de couro com solado antiderrapante"
            ],
            epcsRecommended: [
              "Instalação de linha de vida provisória certificada",
              "Isolamento físico e sinalização de obstáculo mecânico no solo (raio de 5m)",
              "Rede de proteção sob as telhas contra quedas",
              "Placas indicativas 'Cuidado: Homens Trabalhando em Altura'"
            ],
            controlMeasures: [
              "Emitir a Permissão de Trabalho (PT) formalizada antes de subir",
              "Testar as condições físicas das telhas antes de apoiar o corpo",
              "Uso de tábuas de distribuição de peso e passarelas móveis sobre o telhado",
              "Evitar manusear telhas sob rajadas de ventos"
            ],
            applicableNRs: [
              "NR-35 (Trabalho em Altura)",
              "NR-18 (Segurança na Indústria da Construção)",
              "NR-06 (Equipamentos de Proteção Individual)"
            ],
            aprChecklist: [
              { item: "O trabalhador está ancorado continuamente a um ponto estrutural testado?", verified: true },
              { item: "A área no nível do solo foi totalmente isolada e sinalizada?", verified: true },
              { item: "A velocidade do vento e as condições climáticas são seguras (sem chuva)?", verified: false },
              { item: "Os trabalhadores possuem treinamento ativo e exame certificado de NR-35?", verified: true },
              { item: "Os talabartes e conectores foram inspecionados visualmente quanto a desgastes?", verified: false }
            ]
          }
        };
        setReports([initialSeed]);
        setActiveReport(initialSeed);
        localStorage.setItem("safefield_reports", JSON.stringify([initialSeed]));
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  // Helper to save report list to storage and update active report
  const saveReportsList = (updated: HazardReport[]) => {
    setReports(updated);
    localStorage.setItem("safefield_reports", JSON.stringify(updated));
  };

  // Reset to create custom incident
  const handleExitSharedMode = () => {
    setIsSharedView(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("report");
    window.history.pushState({}, "", url.toString());

    // Restore from local storage
    const saved = localStorage.getItem("safefield_reports");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        if (parsed.length > 0) {
          setActiveReport(parsed[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Submit report to generate risk assessment via Express Backend (Gemini API)
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim() || !description.trim()) {
      triggerToast("Por favor, preencha o nome da atividade e a descrição detalhada do risco.");
      return;
    }

    setLoading(true);
    let stepIndex = 0;
    setLoadingStep(loadingSteps[0]);

    // Fast interval simulation of steps to keep loading engaging
    const stepInterval = setInterval(() => {
      if (stepIndex < loadingSteps.length - 1) {
        stepIndex++;
        setLoadingStep(loadingSteps[stepIndex]);
      }
    }, 1800);

    try {
      const response = await fetch("/api/analyze-hazard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityName,
          location,
          department,
          description,
          immediateAction
        })
      });

      if (!response.ok) {
        throw new Error("Erro no processamento do servidor de inteligência.");
      }

      const analysisResult = (await response.json()) as RiskAnalysis;

      const dateObj = new Date();
      const formattedDate = dateObj.toISOString().split("T")[0];
      const formattedTime = dateObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

      // Generate local report record
      const newReport: HazardReport = {
        id: `report-${Date.now()}`,
        activityName,
        location: location || "Não especificado",
        department: department || "Não especificado",
        description,
        immediateAction: immediateAction || "Nenhuma ação imediata adotada",
        reportedBy: reportedBy || "Operador em Campo",
        date: formattedDate,
        time: formattedTime,
        status: "Aberto",
        analysis: analysisResult
      };

      const updatedList = [newReport, ...reports];
      saveReportsList(updatedList);
      setActiveReport(newReport);
      
      // Clear inputs
      setActivityName("");
      setLocation("");
      setDepartment("");
      setDescription("");
      setImmediateAction("");
      setReportedBy("");

      triggerToast("Análise de Risco (APR) gerada com sucesso pela Inteligência Artificial!");
    } catch (err: any) {
      console.error(err);
      triggerToast("Ocorreu um problema de conexão ou limite de chave ao falar com a IA. Tente novamente.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Toggle checklist verification state
  const handleToggleChecklist = (itemIndex: number) => {
    if (!activeReport) return;

    const updatedAnalysis = activeReport.analysis 
      ? {
          ...activeReport.analysis,
          aprChecklist: activeReport.analysis.aprChecklist.map((c, idx) => 
            idx === itemIndex ? { ...c, verified: !c.verified } : c
          )
        }
      : undefined;

    const updatedReport: HazardReport = {
      ...activeReport,
      analysis: updatedAnalysis
    };

    setActiveReport(updatedReport);

    // Save state back to reports list if we are not in shared-only mode
    if (!isSharedView) {
      const updatedList = reports.map(r => r.id === activeReport.id ? updatedReport : r);
      saveReportsList(updatedList);
    }
  };

  // Toggle entire report open/closed status
  const handleToggleStatus = () => {
    if (!activeReport) return;

    const updatedReport: HazardReport = {
      ...activeReport,
      status: activeReport.status === "Aberto" ? "Resolvido" : "Aberto"
    };

    setActiveReport(updatedReport);
    triggerToast(`Status do relatório alterado para "${updatedReport.status}"`);

    if (!isSharedView) {
      const updatedList = reports.map(r => r.id === activeReport.id ? updatedReport : r);
      saveReportsList(updatedList);
    }
  };

  // Copy encoded shared link to clipboard
  const handleShareLink = () => {
    if (!activeReport) return;
    const url = encodeReportToUrl(activeReport);
    if (url) {
      navigator.clipboard.writeText(url);
      triggerToast("¡Link copiado para a área de transferência! Compartilhe onde desejar.");
    }
  };

  // Copy WhatsApp text format to clipboard
  const handleShareWhatsApp = () => {
    if (!activeReport) return;
    const whatsAppText = generateWhatsAppFormat(activeReport);
    navigator.clipboard.writeText(whatsAppText);
    triggerToast("Texto formatado para WhatsApp copiado! Pronto para colar de imediato.");
  };

  // Delete a local report
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover este relato de segurança de seu histórico local?")) {
      const filtered = reports.filter(r => r.id !== id);
      saveReportsList(filtered);
      if (activeReport?.id === id) {
        setActiveReport(filtered.length > 0 ? filtered[0] : null);
      }
      triggerToast("Relato removido do histórico.");
    }
  };

  // Print layout triggers
  const handlePrint = () => {
    window.print();
  };

  // Filtered reports query handler
  const filteredReports = reports.filter(r => {
    const term = searchQuery.toLowerCase();
    const matchesQuery = 
      r.activityName.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term) ||
      r.department.toLowerCase().includes(term);

    const matchesSeverity = filterLevel === "todos" || r.analysis?.riskLevel === filterLevel;
    const matchesStatus = filterStatus === "todos" || r.status === filterStatus;

    return matchesQuery && matchesSeverity && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans print:bg-white print:text-black">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 w-max max-w-[90vw] text-sm font-medium"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Indicator / Field Utility Header */}
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-8 border-b border-slate-800 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold shadow-inner">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Segurança em Foco
              <span className="text-xs bg-slate-800 text-amber-400 font-mono py-0.5 px-2 rounded-full border border-amber-500/20">
                PRO v1.2
              </span>
            </h1>
            <p className="text-xs text-slate-400">Canal Ativo para Relatos de Risco e APR Inteligente</p>
          </div>
        </div>

        {isSharedView ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-amber-400 font-medium px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" /> Link Compartilhado Ativo
            </span>
            <button 
              onClick={handleExitSharedMode}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-slate-700 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Criar Novo Relato
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Conexão Segura</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 print:p-0 print:max-w-none print:w-full">
        
        {/* Banner Alert if Shared View is toggled */}
        {isSharedView && (
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/45 to-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-500 text-slate-900 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Visualização Exclusiva de Risco Compartilhado</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Este relatório foi formulado e salvaguardado no ambiente de trabalho. Você pode verificar a checklist de campo, imprimir uma cópia física da APR ou clicar no botão lateral para registrar novos relatos.
                </p>
              </div>
            </div>
            <button 
              onClick={handleExitSharedMode}
              className="text-amber-800 hover:text-amber-950 font-semibold text-xs sm:text-sm shrink-0 flex items-center gap-1 border-b border-amber-600 hover:border-amber-950 transition-colors"
            >
              Sair desta visualização <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Master Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
          
          {/* LEFT PANEL: Report forms and history list (hides during print) */}
          <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
            
            {/* If NOT in Shared View Mode, show Hazard submission form */}
            {!isSharedView && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-slate-900 text-base">Registrar Nova Operação / Desvio de Risco</h2>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-4">
                  
                  {/* Activity Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      1. Nome da Atividade ou Operação *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Instalação elétrica em subestação, Solda em espaço confinado"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Location & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        2. Frente de Trabalho / Área
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Galpão de Carga 03"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        3. Setor / Departamento
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Equipe de Manutenção"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Hazard Detailed Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      4. Descrição do Cenário de Risco Encontrado *
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Descreva detalhadamente o desvio, riscos à saúde física dos colaboradores, alturas envolvidas, presença de líquidos inflamáveis, fiação exposta, falta de EPIs..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Immediate Actions Adopted */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      5. Ações de Controle Imediatas Adotadas (Se houver)
                    </label>
                    <textarea 
                      rows={2}
                      placeholder="Ex: Área evacuada e painel desenergizado às 15:40h."
                      value={immediateAction}
                      onChange={(e) => setImmediateAction(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Operator signature / Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        6. Relatado por (Iniciais ou Cargo)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: T.S. Siqueira"
                        value={reportedBy}
                        onChange={(e) => setReportedBy(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* Trigger Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      )}
                      Gerar APR Inteligente
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Local History database logs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-700" />
                  <h2 className="font-bold text-slate-900 text-base">Relatos Registrados no Campo ({filteredReports.length})</h2>
                </div>
                {!isSharedView && reports.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm("Isto irá apagar todo o seu histórico local de segurança. Deseja prosseguir?")) {
                        saveReportsList([]);
                        setActiveReport(null);
                        triggerToast("Histórico local resetado.");
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Excluir todos
                  </button>
                )}
              </div>

              {/* Filtering mechanism */}
              <div className="space-y-3 mb-4">
                {/* Search Text input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome, setor ou área..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selective level tag filters */}
                <div className="flex grid-cols-2 gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Gravidade Risco</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-slate-950 focus:bg-white"
                    >
                      <option value="todos">Todas</option>
                      <option value="Baixo">🟢 Baixo</option>
                      <option value="Médio">🟡 Médio</option>
                      <option value="Alto">🟠 Alto</option>
                      <option value="Crítico">🔴 Crítico</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Status Relato</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-slate-950 focus:bg-white"
                    >
                      <option value="todos">Todos</option>
                      <option value="Aberto">Orange Aberto</option>
                      <option value="Resolvido">Emerald Resolvido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logs loop */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Nenhum relatório encontrado correspondente aos filtros atuais.</p>
                  </div>
                ) : (
                  filteredReports.map((item) => {
                    const isActive = activeReport?.id === item.id;
                    const dateFormatted = item.date.split("-").reverse().join("/");
                    
                    return (
                      <div 
                        key={item.id}
                        onClick={() => setActiveReport(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative group ${
                          isActive 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="text-xs font-semibold line-clamp-1 pr-6">{item.activityName}</span>
                          
                          {/* Danger marker button */}
                          {!isSharedView && (
                            <button
                              onClick={(e) => handleDeleteReport(item.id, e)}
                              className={`absolute top-2.5 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white ${
                                isActive ? "text-slate-400 hover:bg-red-600" : "text-slate-400"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Location, sector metadata indicators */}
                        <p className={`text-[11px] mb-2 font-medium ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                          🏢 {item.department} | 📍 {item.location}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100/10">
                          {/* Severity badge */}
                          {item.analysis ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.analysis.riskLevel === "Crítico" 
                                ? "bg-red-500/20 text-red-500" 
                                : item.analysis.riskLevel === "Alto"
                                ? "bg-orange-500/20 text-orange-400"
                                : item.analysis.riskLevel === "Médio"
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              ⚙️ {item.analysis.riskLevel}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md">Pendente</span>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {dateFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Immersive safety notice card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 opacity-10">
                <ShieldAlert className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-3">
                <HardHat className="text-amber-400 w-8 h-8" />
                <h3 className="font-bold text-sm tracking-tight">Manual & Protocolo de Segurança</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conforme a <strong className="text-white">NR-01 (Disposições Gerais)</strong>, todo trabalhador possui o direito de recusa diante de situações que representem grave e iminente risco para sua saúde e segurança ou de terceiros. Relate de forma clara para que as devidas proteções coletivas (EPC) e individuais (EPI) sejam estabelecidas tempestivamente.
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1" />
                  Mantenha as NRs atualizadas na sua frente de trabalho.
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Focusing on active safety assessment and generated checklist */}
          <div className="lg:col-span-7 print:block">
            
            {/* Loading Indicator state block */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center min-h-[500px] flex flex-col items-center justify-center gap-4">
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
                  <HardHat className="w-6 h-6 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Gerando Parecer Técnico e APR...</h3>
                <p className="text-sm text-slate-500 max-w-sm">Nossa IA está examinando o desvio reportado sob a ótica das Normas Regulamentadoras MTE.</p>
                <div className="mt-6 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl max-w-md w-full">
                  <span className="text-xs font-mono font-bold text-amber-600 block mb-1">ESTÁGIO ATUAL:</span>
                  <p className="text-xs text-slate-600 font-medium animate-pulse">{loadingStep}</p>
                </div>
              </div>
            ) : activeReport ? (
              
              /* Active Safety Record Assessment Box */
              <div id={`print-section-${activeReport.id}`} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
                
                {/* Visual Header detailing status and fast-share actions */}
                <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 print:bg-white print:text-black print:border-b-2 print:border-slate-300 print:px-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl font-bold ${
                      activeReport.analysis?.riskLevel === "Crítico" 
                        ? "bg-red-500/20 text-red-400 print:bg-red-100 print:text-red-700" 
                        : activeReport.analysis?.riskLevel === "Alto"
                        ? "bg-orange-500/20 text-orange-400 print:bg-orange-100 print:text-orange-700"
                        : activeReport.analysis?.riskLevel === "Médio"
                        ? "bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-700"
                        : "bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700"
                    }`}>
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 print:text-slate-500 font-mono">
                        Relatório Técnico de Segurança
                      </span>
                      <h2 className="text-base sm:text-lg font-bold tracking-tight line-clamp-1">{activeReport.activityName}</h2>
                    </div>
                  </div>

                  {/* Actions Bar (Share / Download / Status) - Hides in printer mode */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 print:hidden">
                    
                    {/* Status Toggle Switch */}
                    <button
                      onClick={handleToggleStatus}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        activeReport.status === "Aberto"
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      <span>Status:</span>
                      <strong>{activeReport.status.toUpperCase()}</strong>
                    </button>

                    {/* WhatsApp fast message */}
                    <button 
                      onClick={handleShareWhatsApp}
                      title="Copiar para WhatsApp"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Shareable Link */}
                    <button 
                      onClick={handleShareLink}
                      title="Copiar Link de Compartilhamento"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Compartilhar</span>
                    </button>

                    {/* Print Document */}
                    <button 
                      onClick={handlePrint}
                      title="Imprimir / Salvar PDF"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Report Content */}
                <div className="p-5 sm:p-6 space-y-6">

                  {/* Field data summary card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium print:bg-white print:border-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">📅 Data de Registro</span>
                      <span className="text-slate-800 font-mono">{activeReport.date.split("-").reverse().join("/")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">⏰ Horário</span>
                      <span className="text-slate-800 font-mono">{activeReport.time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">🏢 Setor</span>
                      <span className="text-slate-800 break-words">{activeReport.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">📍 Frente / Área</span>
                      <span className="text-slate-800 break-words">{activeReport.location}</span>
                    </div>
                  </div>

                  {/* Operational risk details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                        📢 Descrição do Desvio Observado
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
                        {activeReport.description}
                      </p>
                    </div>

                    {activeReport.immediateAction && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                          🛠️ Ação de Controle Imediata Adotada em Campo
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/30 border border-amber-200/65 p-3.5 rounded-xl">
                          {activeReport.immediateAction}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* GPT Analysis outcome view (APR Checklist & Rules) */}
                  {activeReport.analysis ? (
                    <div className="space-y-6 pt-2">
                      
                      {/* Technical risk appraisal block */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                        
                        {/* Risk severity indicator */}
                        <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2 print:border-slate-300">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Grau de Severidade</span>
                          <div className={`text-2xl font-black uppercase px-4 py-1.5 rounded-xl ${
                            activeReport.analysis.riskLevelColor === 'red' 
                              ? 'bg-red-500/10 text-red-600 border border-red-500/25'
                              : activeReport.analysis.riskLevelColor === 'orange'
                              ? 'bg-orange-500/10 text-orange-600 border border-orange-500/25'
                              : activeReport.analysis.riskLevelColor === 'yellow'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/25'
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25'
                          }`}>
                            {activeReport.analysis.riskLevel}
                          </div>
                          <span className="text-[11px] text-slate-500 leading-snug mt-1 font-medium select-none">
                            Determinado conforme diretrizes das NRs regulamentadoras da SSMA.
                          </span>
                        </div>

                        {/* Text risk evaluation */}
                        <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center print:border-slate-300">
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-2">Avaliação de Risco da IA (Parecer SSMA)</span>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {activeReport.analysis.riskAssessment}
                          </p>
                        </div>
                      </div>

                      {/* PPE & EPC gear recommendation block */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* EPI (Proteção Individual) */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 print:border-slate-300">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <HardHat className="w-4 h-4 text-slate-900 shrink-0" />
                            EPIs Obrigatórios (NR-06)
                          </h4>
                          <ul className="space-y-2">
                            {activeReport.analysis.episRecommended.map((epi, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span className="leading-snug">{epi}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* EPC (Proteção Coletiva) */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 print:border-slate-300">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                            <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                            EPCs / Controle de Área
                          </h4>
                          <ul className="space-y-2">
                            {activeReport.analysis.epcsRecommended.map((epc, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span className="leading-snug">{epc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Applicable regulatory standards */}
                      {activeReport.analysis.applicableNRs && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 print:border-slate-300">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2 flex items-center gap-1">
                            📋 Enquadramento Técnico (Portaria MTE 3.214/77 NRs)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {activeReport.analysis.applicableNRs.map((nr, idx) => (
                              <span key={idx} className="text-xs bg-slate-900 text-slate-100 font-medium px-3 py-1 rounded-lg">
                                {nr}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Field Checklist (Análise Preliminar de Risco - APR) */}
                      <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 space-y-4 print:border-slate-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              Checklist de Campo (APR Preliminar)
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Verifique com a equipe de execução antes de autorizar a frente de trabalho.</p>
                          </div>
                          
                          {/* Scoring stats */}
                          <div className="text-xs font-mono font-bold bg-slate-900 text-white py-1 px-3 rounded-md shrink-0">
                            Liberado: {activeReport.analysis.aprChecklist.filter(c => c.verified).length} de {activeReport.analysis.aprChecklist.length}
                          </div>
                        </div>

                        {/* Checklist loops */}
                        <div className="space-y-2">
                          {activeReport.analysis.aprChecklist.map((checkItem, idx) => (
                            <div 
                              key={idx}
                              onClick={() => handleToggleChecklist(idx)}
                              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                                checkItem.verified 
                                  ? "bg-emerald-50 border-emerald-300 text-slate-800" 
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50"
                              } print:p-2.5 print:border-slate-200`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {checkItem.verified ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <span className="text-[12px] font-medium leading-relaxed">{checkItem.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Administrative Signatures (Polishes the formal PDF print layout) */}
                      <div className="border-t border-slate-200 pt-6 space-y-4">
                        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                          🔒 Validação e Liberação
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          
                          {/* Signature Field Reporter */}
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-32 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-2">Relator em Campo</span>
                              <p className="font-mono font-bold text-slate-800 text-sm">{activeReport.reportedBy}</p>
                            </div>
                            <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>Assinatura Digital</span>
                              <span className="text-emerald-600">✓ Ativo</span>
                            </div>
                          </div>

                          {/* Signature HSE inspector */}
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-32 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1">Encarregado / Inspetor Resp.</span>
                              <input 
                                type="text"
                                placeholder="Digite seu nome para assinar..."
                                value={customSigner}
                                onChange={(e) => setCustomSigner(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none print:hidden placeholder:font-sans"
                              />
                              <p className="font-mono font-bold text-slate-800 text-sm hidden print:block">{customSigner || "_______________________"}</p>
                            </div>
                            <div className="border-t border-dashed border-slate-300 pt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>Liberador Técnico</span>
                              <span>{customSigner ? "✓ Assinado" : "Aguardando..."}</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Render pending AI analysis message */
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-2">
                      <TriangleAlert className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-medium">Nenhuma Análise Preliminar de Risco (APR) ativada para este relato de campo.</p>
                      <p>Use o formulário para carregar nossa inteligência de segurança artificial a fim de obter o parecer obrigatório.</p>
                    </div>
                  )}

                  {/* Print footer - Only shown when printer layout is triggered */}
                  <div className="hidden print:block border-t border-slate-300 pt-6 text-[10px] text-slate-500 font-mono">
                    <p className="text-center justify-between flex">
                      <span>Plataforma Segurança em Foco - APR Digital</span>
                      <span>Assinado Eletronicamente por criptografia Base64</span>
                      <span>ID: {activeReport.id}</span>
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              /* No reports placeholder state */
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center min-h-[500px] flex flex-col items-center justify-center gap-4">
                <ShieldAlert className="w-12 h-12 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900">Nenhum Relato Disponível</h3>
                <p className="text-sm text-slate-500 max-w-sm">Use o formulário esquerdo para preencher detalhes das operações perigosas observadas e gerar a análise técnica de segurança em campo.</p>
              </div>
            )}
            
          </div>

        </div>

      </main>

      {/* Corporate disclaimer footer (Hides in print) */}
      <footer className="bg-slate-900 text-white mt-12 py-6 px-4 border-t border-slate-800 text-xs text-center print:hidden">
        <p className="text-slate-400">
          © 2026 Segurança em Foco. Desenvolvido para conformidade técnica com o Art. 19 da Lei nº 8.213/91 e Diretrizes SSMT.
        </p>
        <p className="text-slate-500 mt-1">
          Lembre-se: Nenhuma meta de produção vale mais do que uma vida humana de trabalho. Faça a sua segurança ativa todos os dias.
        </p>
      </footer>

    </div>
  );
}
