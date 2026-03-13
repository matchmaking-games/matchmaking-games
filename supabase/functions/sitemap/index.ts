import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://matchmaking.games";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const { data: vagas } = await supabase
      .from("vagas")
      .select("slug, atualizada_em")
      .eq("status", "publicada")
      .eq("ativa", true)
      .gt("expira_em", new Date().toISOString());

    const { data: profissionais } = await supabase
      .from("users")
      .select("slug, atualizado_em")
      .not("slug", "is", null);

    const { data: estudios } = await supabase
      .from("estudios")
      .select("slug, atualizado_em")
      .not("slug", "is", null);

    const { data: projetosProfissionais } = await supabase
      .from("projetos")
      .select("slug, atualizado_em, user_id, users(slug)")
      .not("slug", "is", null)
      .not("user_id", "is", null);

    const { data: projetosEstudios } = await supabase
      .from("projetos")
      .select("slug, atualizado_em, estudio_id, estudios(slug)")
      .not("slug", "is", null)
      .not("estudio_id", "is", null)
      .is("user_id", null);

    const urls: string[] = [];

    const estaticas = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/jobs", priority: "0.9", changefreq: "daily" },
      { loc: "/professionals", priority: "0.8", changefreq: "daily" },
      { loc: "/studios", priority: "0.8", changefreq: "weekly" },
      { loc: "/projects", priority: "0.7", changefreq: "daily" },
      { loc: "/events", priority: "0.7", changefreq: "weekly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    ];

    for (const p of estaticas) {
      urls.push(`
  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
    }

    for (const vaga of vagas ?? []) {
      if (!vaga.slug) continue;
      urls.push(`
  <url>
    <loc>${SITE_URL}/jobs/${vaga.slug}</loc>
    <lastmod>${vaga.atualizada_em?.split("T")[0] ?? ""}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    for (const profissional of profissionais ?? []) {
      if (!profissional.slug) continue;
      urls.push(`
  <url>
    <loc>${SITE_URL}/p/${profissional.slug}</loc>
    <lastmod>${profissional.atualizado_em?.split("T")[0] ?? ""}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    for (const estudio of estudios ?? []) {
      if (!estudio.slug) continue;
      urls.push(`
  <url>
    <loc>${SITE_URL}/studio/${estudio.slug}</loc>
    <lastmod>${estudio.atualizado_em?.split("T")[0] ?? ""}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    for (const projeto of projetosProfissionais ?? []) {
      const userSlug = (projeto.users as any)?.slug;
      if (!userSlug || !projeto.slug) continue;
      urls.push(`
  <url>
    <loc>${SITE_URL}/p/${userSlug}/project/${projeto.slug}</loc>
    <lastmod>${projeto.atualizado_em?.split("T")[0] ?? ""}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }

    for (const projeto of projetosEstudios ?? []) {
      const estudioSlug = (projeto.estudios as any)?.slug;
      if (!estudioSlug || !projeto.slug) continue;
      urls.push(`
  <url>
    <loc>${SITE_URL}/studio/${estudioSlug}/project/${projeto.slug}</loc>
    <lastmod>${projeto.atualizado_em?.split("T")[0] ?? ""}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Erro ao gerar sitemap", { status: 500 });
  }
});