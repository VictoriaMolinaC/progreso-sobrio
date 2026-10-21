import { useLiveQuery } from 'dexie-react-hooks';
import { EditableListSection } from '../components/ajustes/EditableListSection';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { triggersRepo } from '../db/repositories';

export function DisparadoresScreen() {
  const triggers = useLiveQuery(() => triggersRepo.getAll());

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <ScreenTitle eyebrow="Para anticiparte" title="Disparadores">
        Registra qué situación, emoción o momento te llevó a consumir. Identificar tus disparadores es el primer paso
        para anticiparte.
      </ScreenTitle>

      <EditableListSection
        title="Gestionar disparadores"
        items={triggers}
        onAdd={(name) => triggersRepo.add(name)}
        onRename={(id, name) => triggersRepo.rename(id, name)}
        onToggleActive={(id, active) => triggersRepo.setActive(id, active)}
      />
    </div>
  );
}
