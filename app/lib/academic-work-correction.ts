import { validateWorkFile, type WorkFileRequirement } from './academic-work-files.ts';

export const WORK_TOPICS = [
    { key: 'resu', label: 'Resumo', limit: 1000 },
    { key: 'intro', label: 'Introdução', limit: 1000 },
    { key: 'obj', label: 'Objetivo', limit: 500 },
    { key: 'met', label: 'Método', limit: 1000 },
    { key: 'disc', label: 'Discussão e resultados', limit: 1500 },
    { key: 'conc', label: 'Conclusão', limit: 800 },
    { key: 'pchave', label: 'Palavras-chave', limit: 200 },
    { key: 'ref', label: 'Referências', limit: 2000 },
] as const;

export function correctionTopics(value: unknown): Record<string, string> {
    if (value != null && (typeof value !== 'object' || Array.isArray(value))) throw new Error('Os tópicos do trabalho são inválidos.');
    return Object.fromEntries(WORK_TOPICS.map(({ key, label, limit }) => {
        const text = value?.[key] ?? '';
        if (typeof text !== 'string' || text.length > limit) throw new Error(`${label} deve conter no máximo ${limit} caracteres.`);
        return [key, text];
    }));
}

export function correctionRequirements(config: { requisitos_arquivos?: WorkFileRequirement[] } | null | undefined) {
    return Array.isArray(config?.requisitos_arquivos) ? config.requisitos_arquivos : [];
}

export function workComments(value: unknown): Array<{ comentario: string; date?: string; status?: string }> {
    if (typeof value === 'string') return value.trim() ? [{ comentario: value }] : [];
    return Array.isArray(value) ? value.filter(item => item && typeof item.comentario === 'string') : [];
}

export function workDate(value: unknown) {
    const date = typeof value === 'string' || typeof value === 'number' || value instanceof Date ? new Date(value) : null;
    return date && Number.isFinite(date.getTime())
        ? date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Data não disponível';
}

// Use exclusively the metadata of completed server uploads.
export function correctionAttachments(requested: Array<{ fileId: string; slotIndex?: number }>,
    uploads: Array<Record<string, any>>, requirements: WorkFileRequirement[], maxBytes: number) {
    if (!requested.length) return [];
    if (!requirements.length || requested.length > requirements.length) throw new Error('Envie no máximo um novo arquivo por requisito da modalidade.');
    const files = requested.map(({ fileId }) => {
        const file = uploads.find(upload => String(upload._id) === fileId);
        const date = file?.uploadDate ? new Date(file.uploadDate) : null;
        if (!file || file.purpose !== 'correction' || Object.hasOwn(file, 'submissionId')
            || !file.contentType || typeof file.originalName !== 'string'
            || typeof file.url !== 'string' || !file.url.startsWith('https://')
            || !date || !Number.isFinite(date.getTime())) throw new Error('Um arquivo não foi confirmado ou já está vinculado. Envie-o novamente.');
        return file;
    });
    const candidates = requested.map((item, index) => {
        if (item.slotIndex !== undefined && (!Number.isInteger(item.slotIndex) || item.slotIndex < 0 || item.slotIndex >= requirements.length)) throw new Error('Requisito do arquivo inválido.');
        const slots = item.slotIndex === undefined ? requirements.map((_, slot) => slot) : [item.slotIndex];
        return slots.filter(slot => !validateWorkFile({ name: files[index].originalName,
            size: files[index].size, contentType: files[index].contentType }, requirements[slot], maxBytes));
    });
    // Old clients omitted slotIndex. Match the entire batch, including overlapping formats.
    const assignedSlots = new Map<number, number>();
    const match = (index: number, visited = new Set<number>()): boolean => {
        for (const slot of candidates[index]) {
            if (visited.has(slot)) continue;
            visited.add(slot);
            if (!assignedSlots.has(slot) || match(assignedSlots.get(slot)!, visited)) {
                assignedSlots.set(slot, index);
                return true;
            }
        }
        return false;
    };
    if (!requested.every((_, index) => match(index))) throw new Error('Os arquivos não correspondem aos formatos, tamanhos ou requisitos da modalidade.');
    const assignments: number[] = [];
    assignedSlots.forEach((index, slot) => { assignments[index] = slot; });
    return files.map((file, index) => ({ slotIndex: assignments[index], fileId: file._id,
        fileName: file.originalName, originalName: file.originalName, size: file.size,
        url: file.url, uploadDate: new Date(file.uploadDate) }));
}
