import { LANDING_API } from "./shared/endpoints";
import { mergeSettings } from "./shared/theme";
import { normalizeContent } from "./shared/blocks";
import type { EventSummary, PageContent, SiteSettings } from "./shared/types";

// Etapa 9: dados públicos da landing (o site da Plura é estático; tudo vem do backend da Área 01)

export interface PublicPage {
  id: string;
  kind: "home" | "evento" | "institucional";
  slug: string;
  title: string;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  cover_url: string | null;
  seo: { title?: string; description?: string; image?: string };
  content: PageContent;
}

export interface DadosSite {
  settings: SiteSettings;
  events: EventSummary[];
  navEvents: { slug: string; title: string }[];
  home: PublicPage | null;
}

export async function carregarSite(comHome = false): Promise<DadosSite> {
  const res = await fetch(`${LANDING_API}/site${comHome ? "?home=1" : ""}`);
  const d = res.ok ? await res.json() : {};
  const eventos = ((d.eventos ?? []) as (EventSummary & { show_in_nav?: boolean })[]);
  return {
    settings: mergeSettings(d.settings),
    events: eventos,
    navEvents: eventos.filter((e) => e.show_in_nav !== false).map((e) => ({ slug: e.slug, title: e.title })),
    home: d.home ? { ...d.home, content: normalizeContent(d.home.content) } : null,
  };
}

export async function carregarPagina(slug: string): Promise<PublicPage | null> {
  const res = await fetch(`${LANDING_API}/paginas/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const p = await res.json();
  return { ...p, content: normalizeContent(p.content) };
}

// Sem conexão com o backend: mostra o conteúdo padrão em vez de travar
export function siteVazio(): DadosSite {
  return { settings: mergeSettings(null), events: [], navEvents: [], home: null };
}
