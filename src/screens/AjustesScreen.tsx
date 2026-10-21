import { AndroidSection } from '../components/ajustes/AndroidSection';
import { ContactsSection } from '../components/ajustes/ContactsSection';
import { ExportImportSection } from '../components/ajustes/ExportImportSection';
import { HrThresholdSection } from '../components/ajustes/HrThresholdSection';
import { LegalSection } from '../components/ajustes/LegalSection';
import { PrivacyCoverSection } from '../components/ajustes/PrivacyCoverSection';
import { ResetDataSection } from '../components/ajustes/ResetDataSection';
import { ScreenTitle } from '../components/layout/ScreenTitle';

interface AjustesScreenProps {
  hideOnLeave: boolean;
  onHideOnLeaveChange: (value: boolean) => void;
}

export function AjustesScreen({ hideOnLeave, onHideOnLeaveChange }: AjustesScreenProps) {
  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <div>
        <ScreenTitle eyebrow="Tus preferencias" title="Ajustes" className="mb-4">
          Tu red de apoyo, tus respaldos y la privacidad. Todo se guarda solo en este dispositivo.
        </ScreenTitle>
        {/* Solo lleva a la sección: el coral queda para el botón que de verdad borra. Borde ámbar como
            "Ir a Ajustes" en Inicio, sin fondo; el texto va en tinta porque el ámbar no llega a 4,5:1. */}
        <a
          href="#borrar-datos"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-accent px-4 text-sm font-semibold text-ink hover:bg-accent/15 dark:text-ink-dark"
        >
          Ir a borrar todos mis datos
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14m-6-6 6 6 6-6" />
          </svg>
        </a>
      </div>
      <ContactsSection />
      <HrThresholdSection />
      <ExportImportSection />
      <PrivacyCoverSection hideOnLeave={hideOnLeave} onChange={onHideOnLeaveChange} />
      <AndroidSection />
      <LegalSection />
      <ResetDataSection />
    </div>
  );
}
