/**
 * Puente con la app Android (cl.progresosobrio.app).
 *
 * Dentro de la app, Android inyecta `window.ProgresoSobrioAndroid` y la PWA le habla con
 * mensajes JSON (protocolo v1; contrato completo en android/PLAN.md, sección 6). En el
 * navegador ese objeto no existe: este módulo queda inactivo y la PWA funciona como siempre.
 */

export const BRIDGE_PROTOCOL_VERSION = 1 as const;

export type NativeScreen = 'watchTest' | 'privacy';

// Peticiones PWA → Android
export type BridgeRequest =
  | { v: 1; id: string; type: 'getCapabilities' }
  | { v: 1; id: string; type: 'readDay'; date: string } // 'YYYY-MM-DD' en hora local del teléfono
  | { v: 1; id: string; type: 'saveFile'; filename: string; mime: string; content: string }
  | { v: 1; id: string; type: 'openScreen'; screen: NativeScreen };

// Respuestas Android → PWA
export type BridgeError =
  | 'hc_unavailable' // Health Connect no instalado
  | 'hc_update_required' // Health Connect desactualizado
  | 'no_permission' // la persona negó o revocó permisos
  | 'no_data' // no hay nada ese día
  | 'cancelled' // cerró el selector de archivos / el diálogo
  | 'write_failed'
  | 'bad_request'
  | 'unknown';

export interface WatchDayData {
  date: string;
  restingBpm: number | null;
  minBpm: number | null;
  maxBpm: number | null;
  avgBpm: number | null;
  lastBpm: number | null;
  lastBpmTime: string | null; // ISO 8601 con zona
  sleepMinutes: number | null;
  sleepMinBpm: number | null;
  sleepAvgBpm: number | null;
  sources: string[]; // etiquetas legibles, p. ej. ["Mi Fitness"]
}

export type BridgeResponse =
  | { v: 1; id: string; type: 'getCapabilitiesResult'; ok: true; appVersion: string; pwaBuild: string; protocol: 1 }
  | { v: 1; id: string; type: 'readDayResult'; ok: true; data: WatchDayData }
  | { v: 1; id: string; type: 'readDayResult'; ok: false; error: BridgeError }
  | { v: 1; id: string; type: 'saveFileResult'; ok: true; filename: string }
  | { v: 1; id: string; type: 'saveFileResult'; ok: false; error: BridgeError }
  | { v: 1; id: string; type: 'openScreenResult'; ok: boolean };

export interface Capabilities {
  appVersion: string;
  pwaBuild: string;
  protocol: 1;
}

/** Error con el código que mandó Android (nunca trae detalles técnicos). */
export class AndroidBridgeError extends Error {
  readonly code: BridgeError;

  constructor(code: BridgeError) {
    super(`android-bridge: ${code}`);
    this.name = 'AndroidBridgeError';
    this.code = code;
  }
}

// El objeto que inyecta Android (WebViewCompat.addWebMessageListener).
interface AndroidBridgeObject {
  postMessage(message: string): void;
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
}

declare global {
  interface Window {
    ProgresoSobrioAndroid?: AndroidBridgeObject;
  }
}

/** true solo dentro de la app Android, con el puente instalado. */
export function isAndroidBridgeAvailable(): boolean {
  return typeof window.ProgresoSobrioAndroid?.postMessage === 'function';
}

/** Versión de la app y de la PWA empaquetada. Se rinde a los 5 s si Android no responde. */
export async function getCapabilities(): Promise<Capabilities> {
  const response = await send({ type: 'getCapabilities' }, 5000);
  if (response.type !== 'getCapabilitiesResult') throw new AndroidBridgeError('unknown');
  return { appVersion: response.appVersion, pwaBuild: response.pwaBuild, protocol: response.protocol };
}

/** Abre una pantalla nativa: diagnóstico del reloj o privacidad de la app. */
export async function openNativeScreen(screen: NativeScreen): Promise<void> {
  await send({ type: 'openScreen', screen }, 5000);
}

// --- Interno: envío con id y respuesta como Promesa ---

// Cada petición sin `v` ni `id`: los agrega send().
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type RequestBody = DistributiveOmit<BridgeRequest, 'v' | 'id'>;

interface Pending {
  resolve: (response: BridgeResponse) => void;
  reject: (error: AndroidBridgeError) => void;
}

// Peticiones en vuelo, por id. Una respuesta con id desconocido (tardía o ajena) se descarta.
const pending = new Map<string, Pending>();
let listening = false;

function send(request: RequestBody, timeoutMs?: number): Promise<BridgeResponse> {
  const bridge = window.ProgresoSobrioAndroid;
  if (!bridge) return Promise.reject(new AndroidBridgeError('unknown'));

  if (!listening) {
    bridge.addEventListener('message', (event) => receive(event.data));
    listening = true;
  }

  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    if (timeoutMs !== undefined) {
      setTimeout(() => {
        if (pending.delete(id)) reject(new AndroidBridgeError('unknown'));
      }, timeoutMs);
    }
    bridge.postMessage(JSON.stringify({ v: BRIDGE_PROTOCOL_VERSION, id, ...request }));
  });
}

function receive(data: unknown) {
  const response = parseResponse(data);
  if (!response) return;

  const waiting = pending.get(response.id);
  if (!waiting) return;
  pending.delete(response.id);

  if (response.ok) waiting.resolve(response);
  else waiting.reject(new AndroidBridgeError('error' in response ? response.error : 'unknown'));
}

// Valida el sobre (v, id, type, ok); el resto del contenido lo arma Android.
function parseResponse(data: unknown): BridgeResponse | null {
  if (typeof data !== 'string') return null;
  try {
    const value: unknown = JSON.parse(data);
    if (typeof value !== 'object' || value === null) return null;
    const { v, id, type, ok } = value as Record<string, unknown>;
    if (v !== BRIDGE_PROTOCOL_VERSION || typeof id !== 'string' || typeof type !== 'string' || typeof ok !== 'boolean') {
      return null;
    }
    return value as BridgeResponse;
  } catch {
    return null;
  }
}
