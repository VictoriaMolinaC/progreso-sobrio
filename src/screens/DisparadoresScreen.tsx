import { useLiveQuery } from 'dexie-react-hooks';
import { EditableListSection } from '../components/ajustes/EditableListSection';
import { triggersRepo } from '../db/repositories';

export function DisparadoresScreen() {
  const triggers = useLiveQuery(() => triggersRepo.getAll());

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <div>
        <h1 className="mb-2 text-xl font-semibold text-ink dark:text-ink-dark">Disparadores</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark">
          Registra qué situación, emoción o momento te llevó a consumir. Identificar tus disparadores es el primer
          paso para anticiparte.
        </p>
      </div>

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
