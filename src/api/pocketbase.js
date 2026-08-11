import PocketBase from 'pocketbase';

/**
 * PocketBase клиент — подключается к общему инстансу экосистемы Точилка.
 * 
 * URL: https://api.tochilka.app
 * 
 * На этапе разработки можно переключить на локальный инстанс:
 *   const pb = new PocketBase('http://127.0.0.1:8090');
 */
const pb = new PocketBase(
  import.meta.env.VITE_PB_URL || 'https://api.tochilka.app'
);

// Авто-отмена запросов при unmount не нужна для SPA
pb.autoCancellation(false);

export default pb;
