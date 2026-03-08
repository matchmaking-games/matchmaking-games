import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileNotFound } from "@/components/public-profile/ProfileNotFound";
import { ProfileHero } from "@/components/public-profile/ProfileHero";
import { ProfileNav } from "@/components/public-profile/ProfileNav";
import { AboutSection } from "@/components/public-profile/AboutSection";
import { ProjectsSection } from "@/components/public-profile/ProjectsSection";
import { SkillsSection } from "@/components/public-profile/SkillsSection";
import { ExperienceSection } from "@/components/public-profile/ExperienceSection";
import { EducationSection } from "@/components/public-profile/EducationSection";
import { Skeleton } from "@/components/ui/skeleton";

function updateMetaTag(name: string, content: string) {
  let tag = document.querySelector(
    `meta[property="${name}"], meta[name="${name}"]`
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(name.startsWith("og:") || name.startsWith("twitter:") ? "property" : "name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateLinkTag(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Banner skeleton */}
      <Skeleton className="h-40 md:h-[200px] lg:h-[240px] w-full" />
      
      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 pt-20 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = usePublicProfile(slug);

  // SEO: Update meta tags
  useEffect(() => {
    if (!data?.user) return;

    const { user } = data;
    const name = user.nome_completo;
    const title = user.titulo_profissional || "Profissional";
    const description =
      user.bio_curta?.slice(0, 160) || `Perfil de ${name} no Matchmaking`;
    const image = user.banner_url || user.avatar_url;
    const url = `https://matchmaking.games/p/${slug}`;

    // Title
    document.title = `${name} - ${title} | Matchmaking`;

    // Meta description
    updateMetaTag("description", description);

    // Open Graph
    updateMetaTag("og:title", `${name} - ${title}`);
    updateMetaTag("og:description", description);
    if (image) updateMetaTag("og:image", image);
    updateMetaTag("og:url", url);
    updateMetaTag("og:type", "profile");

    // Twitter Card
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", `${name} - ${title}`);
    updateMetaTag("twitter:description", description);
    if (image) updateMetaTag("twitter:image", image);

    // Canonical
    updateLinkTag("canonical", url);

    // Cleanup on unmount
    return () => {
      document.title = "Matchmaking";
    };
  }, [data, slug]);

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingState />
      </>
    );
  }

  if (error || !data?.user) {
    return (
      <>
        <Header />
        <div className="pt-16">
          <ProfileNotFound />
        </div>
      </>
    );
  }

  const { user, featuredProjects, otherProjects, skills, experiences, educations } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header global fixo */}
      <Header />

      {/* Conteudo com pt-16 para compensar header fixo */}
      <div className="pt-16">
        {/* Hero com banner + avatar + info básica */}
        <ProfileHero user={user} />

        {/* Navegação sticky - apenas desktop */}
        <ProfileNav />

        {/* Seções */}
        <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <AboutSection user={user} />
          <ProjectsSection featuredProjects={featuredProjects} otherProjects={otherProjects} userSlug={user.slug} />
          <SkillsSection skills={skills} />
          <ExperienceSection experiences={experiences} />
          <EducationSection educations={educations} />
        </main>
      </div>

      <Footer />
    </div>
  );
}
