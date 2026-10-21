import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import type { ScreenId } from './app/navigation';
import { usePrivacyCover } from './app/privacyCover';
import { useTheme } from './app/theme';
import { Drawer } from './components/layout/Drawer';
import { Header } from './components/layout/Header';
import { PrivacyCover } from './components/layout/PrivacyCover';
import { SupportButton } from './components/layout/SupportButton';
import { SupportSheet } from './components/layout/SupportSheet';
import { AgeGate } from './components/onboarding/AgeGate';
import { LegalConsent } from './components/onboarding/LegalConsent';
import { WelcomeTour } from './components/onboarding/WelcomeTour';
import {
  acceptLegal,
  confirmAge,
  declareUnderage,
  getLegalAcceptance,
  isAgeConfirmed,
  isOnboardingSeen,
  isUnderageDeclared,
  markOnboardingSeen,
} from './db/repositories';
import { LEGAL } from './lib/constants';
import { AjustesScreen } from './screens/AjustesScreen';
import { DisparadoresScreen } from './screens/DisparadoresScreen';
import { HabitosScreen } from './screens/HabitosScreen';
import { InicioScreen } from './screens/InicioScreen';
import { ProgresoScreen } from './screens/ProgresoScreen';
import { RegistroScreen } from './screens/RegistroScreen';
import { SustanciasScreen } from './screens/SustanciasScreen';

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('inicio');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [registroDate, setRegistroDate] = useState<string | undefined>();
  const { theme, toggleTheme } = useTheme();
  const privacy = usePrivacyCover();
  const ageConfirmed = useLiveQuery(() => isAgeConfirmed());
  const underage = useLiveQuery(() => isUnderageDeclared());
  const legalAcceptance = useLiveQuery(() => getLegalAcceptance());
  const onboardingSeen = useLiveQuery(() => isOnboardingSeen());

  const handleSelectScreen = (screen: ScreenId) => {
    setActiveScreen(screen);
    setDrawerOpen(false);
  };

  const handleRegistrarHoy = () => {
    setRegistroDate(undefined);
    setActiveScreen('registro');
  };

  const handleEditDate = (date: string) => {
    setRegistroDate(date);
    setActiveScreen('registro');
  };

  // Mientras Dexie responde no se muestra nada, así quien ya confirmó no ve
  // aparecer y desaparecer la puerta de edad en cada arranque.
  if (ageConfirmed === undefined || underage === undefined) {
    return <div className="min-h-screen bg-base dark:bg-base-dark" />;
  }

  // Quien dijo ser menor queda en la puerta de edad, aunque antes haya confirmado.
  if (underage || !ageConfirmed) {
    return (
      <AgeGate
        onConfirm={() => confirmAge()}
        underage={underage}
        onDeclareUnderage={() => declareUnderage()}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Mismo motivo que arriba: no parpadear la aceptación ni el tour mientras Dexie responde.
  if (legalAcceptance === undefined || onboardingSeen === undefined) {
    return <div className="min-h-screen bg-base dark:bg-base-dark" />;
  }

  const legalUpToDate =
    legalAcceptance !== null &&
    legalAcceptance.termsVersion === LEGAL.termsVersion &&
    legalAcceptance.privacyVersion === LEGAL.privacyVersion;

  if (!legalUpToDate) {
    return (
      <LegalConsent
        updated={legalAcceptance !== null}
        onAccept={() => acceptLegal(LEGAL.termsVersion, LEGAL.privacyVersion)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (!onboardingSeen) {
    return <WelcomeTour onFinish={() => markOnboardingSeen()} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Tapada, la app sigue montada debajo pero inert: no se ve, no se puede tocar
  // ni enfocar, los lectores de pantalla no la leen, y no pierde lo que estaba a medias.
  return (
    <>
      <div className="min-h-screen bg-base dark:bg-base-dark" inert={privacy.covered}>
        <Header
          onMenuClick={() => setDrawerOpen(true)}
          onCover={privacy.cover}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Drawer
          open={drawerOpen}
          activeScreen={activeScreen}
          onSelect={handleSelectScreen}
          onClose={() => setDrawerOpen(false)}
        />
        <main>
          {activeScreen === 'inicio' && (
            <InicioScreen onRegistrarHoy={handleRegistrarHoy} onGoToAjustes={() => setActiveScreen('ajustes')} />
          )}
          {activeScreen === 'sustancias' && <SustanciasScreen />}
          {activeScreen === 'registro' && <RegistroScreen initialDate={registroDate} />}
          {activeScreen === 'progreso' && <ProgresoScreen onEditDate={handleEditDate} theme={theme} />}
          {activeScreen === 'habitos' && <HabitosScreen />}
          {activeScreen === 'disparadores' && <DisparadoresScreen />}
          {activeScreen === 'ajustes' && (
            <AjustesScreen hideOnLeave={privacy.hideOnLeave} onHideOnLeaveChange={privacy.setHideOnLeave} />
          )}
        </main>
        <SupportButton onClick={() => setSupportOpen(true)} />
        <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
      </div>
      {privacy.covered && <PrivacyCover onUncover={privacy.uncover} />}
    </>
  );
}

export default App;
