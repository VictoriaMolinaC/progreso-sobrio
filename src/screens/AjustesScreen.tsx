import { AndroidSection } from '../components/ajustes/AndroidSection';
import { ContactsSection } from '../components/ajustes/ContactsSection';
import { ExportImportSection } from '../components/ajustes/ExportImportSection';
import { HrThresholdSection } from '../components/ajustes/HrThresholdSection';
import { LegalSection } from '../components/ajustes/LegalSection';
import { PrivacyCoverSection } from '../components/ajustes/PrivacyCoverSection';
import { ResetDataSection } from '../components/ajustes/ResetDataSection';

interface AjustesScreenProps {
  hideOnLeave: boolean;
  onHideOnLeaveChange: (value: boolean) => void;
}

export function AjustesScreen({ hideOnLeave, onHideOnLeaveChange }: AjustesScreenProps) {
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
      <PrivacyCoverSection hideOnLeave={hideOnLeave} onChange={onHideOnLeaveChange} />
      <AndroidSection />
      <LegalSection />
      <ResetDataSection />
    </div>
  );
}
