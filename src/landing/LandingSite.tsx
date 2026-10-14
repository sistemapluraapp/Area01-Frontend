"use client";
import { useEffect, type ReactNode } from "react";
import "./landing.css";
import { googleFontsHref, themeCss } from "./shared/theme";
import { cleanSrc } from "./shared/image";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import type { DadosSite } from "./dados";

// Moldura da landing (equivale ao layout.tsx do site do Festival): tema, fontes,
// cabeçalho e rodapé. Fica dentro de .fp-site para não afetar o resto da Área 01.
export function LandingSite({ dados, titulo, children }: { dados: DadosSite; titulo?: string; children: ReactNode }) {
  const s = dados.settings;
  const fonts = googleFontsHref(s.theme);

  useEffect(() => {
    document.title = titulo ? `${titulo} · ${s.festival_name}` : s.tagline ? `${s.festival_name} · ${s.tagline}` : s.festival_name;
    const favicon = cleanSrc(s.brand.favicon_url || s.brand.icon_url);
    if (favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-landing]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.dataset.landing = "1";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [s, titulo]);

  return (
    <div className="fp-site antialiased">
      {fonts && <link rel="stylesheet" href={fonts} />}
      <style dangerouslySetInnerHTML={{ __html: themeCss(s.theme) }} />
      <SiteHeader name={s.festival_name} logo={s.brand.logo_url} logoLight={s.brand.logo_light_url} icon={s.brand.icon_url} nav={s.nav} events={dados.navEvents} />
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <SiteFooter s={s} />
    </div>
  );
}
