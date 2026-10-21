import { useLiveQuery } from 'dexie-react-hooks';
import { EditableListSection } from '../components/ajustes/EditableListSection';
import { ScreenTitle } from '../components/layout/ScreenTitle';
import { HabitStreaksView } from '../components/progreso/HabitStreaksView';
import { habitsRepo } from '../db/repositories';

export function HabitosScreen() {
  const habits = useLiveQuery(() => habitsRepo.getAll());

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <ScreenTitle eyebrow="Lo que te hace bien" title="Hábitos" />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Tu racha por hábito</h2>
        <HabitStreaksView />
      </section>

      <EditableListSection
        title="Gestionar hábitos"
        items={habits}
        onAdd={(name) => habitsRepo.add(name)}
        onRename={(id, name) => habitsRepo.rename(id, name)}
        onToggleActive={(id, active) => habitsRepo.setActive(id, active)}
      />
    </div>
  );
}
