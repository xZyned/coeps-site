'use client'

import { useState, useEffect } from "react";
import { Download } from 'lucide-react';
// import html2pdf from 'html2pdf.js'; // Removido para importação dinâmica

// Conteúdo HTML do documento convertido
const documentHtmlTemplate = `
<div id="document-content" style="padding: 20px; font-family: 'Times New Roman', Times, serif;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="/documento-anexado.png" alt="Logo do I CIEPS" style="max-width: 300px; height: auto; display: block; margin: 0 auto;">
  </div>
  <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;color: #281802ff;">Comprovante de participação no I CIEPS</h1>
  <p style="font-size: 16px; line-height: 1.6; text-align: justify;color: #281802ff;">Certificamos que o(a) congressista XXX está devidamente inscrito(a) para participar do I Congresso Internacional de Estudantes e Profissionais da Saúde, realizado em Araguari, de 12 a 15 de novembro de 2026.</p>
</div>
`;

export default function DocumentoAnexadoPage() {
  const [nomeCompleto, setNomeCompleto] = useState<string>('Carregando Nome...');
  const [documentContent, setDocumentContent] = useState<string>(documentHtmlTemplate);

  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
       
        const res = await fetch("/api/get/usuariosInformacoes");
        const data = await res.json();
        const nome = data?.data?.informacoes_usuario?.nome || ''; 
        setNomeCompleto(nome);
        
        
        const newContent = documentHtmlTemplate.replace(/XXX/g, nome);
        setDocumentContent(newContent);

      } catch (e) {
        console.error("Erro ao buscar dados do usuário:", e);
        setNomeCompleto('Participante Não Identificado');
        setDocumentContent(documentHtmlTemplate.replace(/XXX/g, 'Participante Não Identificado'));
      }
    };
    fetchUserData();
  }, []);

  const handleDownloadPdf = async () => {
    // Importação dinâmica do html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.getElementById('document-content');
    if (element) {
      // Configurações para o html2pdf para melhor formatação
      const opt: any = {
        margin:       [10, 10, 10, 10] as [number, number, number, number],
        filename:     'documento_cieps.pdf',
        image:        { type: 'png', quality: 1.0 },
        html2canvas:  { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const displayContent = documentContent;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Seu Documento Anexado</h1>
        <button 
          onClick={handleDownloadPdf} 
          className="flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          <Download size={20} className="mr-2" />
          Baixar em PDF
        </button>
      </div>
      
      <div 
        className="document-preview border p-6 rounded-lg bg-gray-50"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
}
