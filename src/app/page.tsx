/**
 * ---------------------------------------------------------------------------
 * Homepage (page.tsx)
 * ---------------------------------------------------------------------------
 * Composition: Hero → Intro → Modules → WhyUs → About → News → Contact.
 * All content from JSON store; admin sees edit banner at the top.
 * ---------------------------------------------------------------------------
 */

import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import WhyUs from "@/components/site/WhyUs";
import About from "@/components/site/About";
import News from "@/components/site/News";
import Contact from "@/components/site/Contact";
import AdminBanner from "@/components/admin/AdminBanner";
import Intro from "@/components/site/Intro";
import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const [siteContent, services, news, user] = await Promise.all([
    get("siteContent"),
    get("services"),
    get("news"),
    getCurrentUser(),
  ]);

  return (
    <>
      {user?.role === "admin" ? <AdminBanner /> : null}

      <Hero content={siteContent} />
      <Intro content={siteContent} />
      <Services services={services} />
      <WhyUs content={siteContent} />
      <About content={siteContent} />
      <News items={news} />
      <Contact content={siteContent} />
    </>
  );
}
