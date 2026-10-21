interface PrivacyCoverSectionProps {
  hideOnLeave: boolean;
  onChange: (value: boolean) => void;
}

export function PrivacyCoverSection({ hideOnLeave, onChange }: PrivacyCoverSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink dark:text-ink-dark">Pantalla de privacidad</h2>
      <p className="mb-3 text-sm text-ink-soft dark:text-ink-soft-dark">
        El ojo tachado, arriba a la derecha, tapa toda la app con una pantalla neutra. Para volver, toca «Mostrar».
      </p>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink dark:text-ink-dark">
        <input
          type="checkbox"
          checked={hideOnLeave}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary-button"
        />
        Tapar la app cada vez que salgo de ella
      </label>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-soft-dark">
        Si cambias de app o se apaga la pantalla, al volver la vas a encontrar tapada.
      </p>
    </section>
  );
}
