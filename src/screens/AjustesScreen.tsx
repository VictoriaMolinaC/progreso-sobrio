import { AndroidSection } from '../components/ajustes/AndroidSection';
import { ContactsSection } from '../components/ajustes/ContactsSection';
import { ExportImportSection } from '../components/ajustes/ExportImportSection';
import { HrThresholdSection } from '../components/ajustes/HrThresholdSection';
import { LegalSection } from '../components/ajustes/LegalSection';
import { ResetDataSection } from '../components/ajustes/ResetDataSection';

export function AjustesScreen() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <div>
        <h1 className="text-xl font-semibold text-ink dark:text-ink-dark">Ajustes</h1>
        <a href="#borrar-datos" className="text-sm text-warning-text dark:text-warning underline">
          Ir a borrar todos mis datos
        </a>
      </div>
      <ContactsSection />
      <HrThresholdSection />
      <ExportImportSection />
      <AndroidSection />
      <LegalSection />
      <ResetDataSection />
    </div>
  );
}
