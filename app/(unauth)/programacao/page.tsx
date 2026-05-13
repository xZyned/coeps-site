'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ICourse, ILecture } from '@/lib/types/events/event.t';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  Presentation,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import './style.css';

type ProgramItem = ICourse | ILecture;
type OrganizedData = Record<string, ProgramItem[]>;

const scheduleHighlights = [
  { day: '12 NOV', label: 'Abertura oficial' },
  { day: '13 NOV', label: 'Mesas e conferencias' },
  { day: '14 NOV', label: 'Minicursos e vivencias' },
  { day: '15 NOV', label: 'Encerramento e conexoes' },
];

function organizeData(course: ICourse[], lecture: ILecture[]) {
  return [...course, ...lecture].reduce<OrganizedData>((groups, item) => {
    const category = item.type || 'Programacao';
    groups[category] ??= [];
    groups[category].push(item);
    return groups;
  }, {});
}

function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes('curso') || normalized.includes('minicurso') || normalized.includes('workshop')) {
    return <GraduationCap size={20} />;
  }

  if (normalized.includes('palestra') || normalized.includes('conferencia') || normalized.includes('mesa')) {
    return <Presentation size={20} />;
  }

  if (normalized.includes('atividade') || normalized.includes('vivencia')) {
    return <Sparkles size={20} />;
  }

  return <CalendarDays size={20} />;
}

function formatDate(value?: string) {
  if (!value) return 'Data a confirmar';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Programacao() {
  const [data, setData] = useState<{ course: ICourse[]; lecture: ILecture[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState<ProgramItem | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/inauthenticated/get/programacao', { cache: 'no-store' });
        const result: { result1: ICourse[]; result2: ILecture[] } = await response.json();
        setData({
          course: result.result1 ?? [],
          lecture: result.result2 ?? [],
        });
      } catch (error) {
        console.error('Erro ao buscar programacao:', error);
        setData({ course: [], lecture: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const organizedData = useMemo(
    () => organizeData(data?.course ?? [], data?.lecture ?? []),
    [data],
  );

  const categories = Object.entries(organizedData);

  return (
    <main className="programacao-page">
      <section className="programacao-hero">
        <div className="programacao-hero-copy">
          <span className="cieps-kicker">Programacao oficial</span>
          <h1 className="cieps-display">Quatro dias para viver o VIII CIEPS.</h1>
          <p>
            De 12 a 15 de novembro de 2026, Araguari recebe uma agenda pensada para
            quem quer estudar, trocar experiencias e acompanhar a 1ª Edicao Internacional
            de perto.
          </p>
          <div className="programacao-highlight-grid">
            {scheduleHighlights.map((highlight) => (
              <article key={highlight.day}>
                <strong>{highlight.day}</strong>
                <span>{highlight.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="programacao-hero-media">
          <Image
            src="/cieps/cieps-program-booklet.png"
            alt="Programa editorial do VIII CIEPS com a identidade visual do congresso"
            width={960}
            height={720}
            priority
          />
        </div>
      </section>

      <section className="programacao-status cieps-surface">
        {loading ? (
          <div className="programacao-state">
            <Loader2 className="spin" size={22} />
            <strong>Carregando programacao</strong>
            <span>Organizando as atividades disponiveis.</span>
          </div>
        ) : categories.length > 0 ? (
          <div className="programacao-state">
            <UsersRound size={22} />
            <strong>Agenda pronta para consulta</strong>
            <span>Abra uma categoria e selecione o evento para ver os detalhes.</span>
          </div>
        ) : (
          <div className="programacao-state">
            <Clock3 size={22} />
            <strong>Cronograma em atualizacao</strong>
            <span>Os blocos oficiais serao publicados aqui assim que forem liberados.</span>
          </div>
        )}
      </section>

      <section className="programacao-board">
        {categories.length > 0 ? (
          categories.map(([category, items], index) => {
            const collapsed = collapsedCategories[category];
            const tone = `tone-${(index % 4) + 1}`;

            return (
              <article key={category} className={`programacao-category cieps-surface ${tone}`}>
                <button
                  type="button"
                  className="programacao-category-header"
                  onClick={() =>
                    setCollapsedCategories((current) => ({
                      ...current,
                      [category]: !current[category],
                    }))
                  }
                >
                  <span className="programacao-category-title">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </span>
                  <span className="programacao-category-meta">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                    {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </span>
                </button>

                {!collapsed && (
                  <div className="programacao-event-list">
                    {items.map((item) => {
                      const firstTimeline = item.timeline?.[0];
                      return (
                        <button
                          key={item._id}
                          type="button"
                          className="programacao-event"
                          onClick={() => setOpenItem(item)}
                        >
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.type}</span>
                          </div>
                          <div className="programacao-event-time">
                            <CalendarDays size={16} />
                            <span>{formatDate(firstTimeline?.date_init)}</span>
                          </div>
                          <div className="programacao-event-time">
                            <Clock3 size={16} />
                            <span>
                              {formatTime(firstTimeline?.date_init)} - {formatTime(firstTimeline?.date_end)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="programacao-empty cieps-surface">
            <span className="cieps-kicker">Em breve</span>
            <h2 className="cieps-display">A agenda detalhada aparecera aqui.</h2>
            <p>
              Enquanto isso, a identidade e o periodo oficial do VIII CIEPS ja estao definidos:
              Araguari, 12 a 15 de novembro de 2026.
            </p>
          </div>
        )}
      </section>

      {openItem && (
        <div className="programacao-modal" role="dialog" aria-modal="true" aria-labelledby="programacao-modal-title">
          <button type="button" className="programacao-modal-backdrop" onClick={() => setOpenItem(null)} aria-label="Fechar" />
          <article className="programacao-modal-card">
            <button type="button" className="programacao-modal-close" onClick={() => setOpenItem(null)} aria-label="Fechar detalhes">
              <X size={18} />
            </button>

            <span className="cieps-kicker">{openItem.type}</span>
            <h2 id="programacao-modal-title" className="cieps-display">
              {openItem.name}
            </h2>
            <p>{openItem.description || 'Descricao oficial em atualizacao.'}</p>

            <div className="programacao-modal-timeline">
              {openItem.timeline?.map((timeline) => (
                <section key={timeline._id} className="programacao-modal-slot">
                  <strong>{timeline.name || 'Atividade'}</strong>
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(timeline.date_init)}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {formatTime(timeline.date_init)} - {formatTime(timeline.date_end)}
                  </span>
                  <span>
                    <MapPin size={15} />
                    {timeline.local}
                    {timeline.local_description ? ` - ${timeline.local_description}` : ''}
                  </span>
                  {timeline.description && <p>{timeline.description}</p>}
                </section>
              ))}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
