import { AgendaSection } from "@/components/sections/AgendaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { InfoSections } from "@/components/sections/InfoSections";
import { OfficialRegistrationForm } from "@/components/sections/OfficialRegistrationForm";
import { RegistrationForms } from "@/components/sections/RegistrationForms";
import { SponsorsSection } from "@/components/sections/SponsorsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <InfoSections />
      <OfficialRegistrationForm />
      <SponsorsSection />
      <RegistrationForms />
      <AgendaSection />
    </>
  );
}
