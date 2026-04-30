import { AgendaSection } from "@/components/sections/AgendaSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HotelSection } from "@/components/sections/HotelSection";
import { InfoSections } from "@/components/sections/InfoSections";
import { LiveStatsSection } from "@/components/sections/LiveStatsSection";
import { OfficialRegistrationForm } from "@/components/sections/OfficialRegistrationForm";
import { RegistrationForms } from "@/components/sections/RegistrationForms";
import { SponsorsSection } from "@/components/sections/SponsorsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LiveStatsSection />
      <InfoSections />
      <HotelSection />
      <AgendaSection />
      <SponsorsSection />
      <RegistrationForms />
      <div id="registro-oficial">
        <OfficialRegistrationForm />
      </div>
      <ContactSection />
    </>
  );
}
