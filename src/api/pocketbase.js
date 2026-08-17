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
  import.meta.env.VITE_PB_URL
);

// Авто-отмена запросов при unmount не нужна для SPA
pb.autoCancellation(false);

// Глобальный перехватчик для обработки протухшего токена (401/403)
pb.beforeSend = function (url, options) {
    return { url, options };
};
pb.afterSend = function (response, data) {
    if (response.status === 401 || response.status === 403) {
        pb.authStore.clear();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
            window.location.href = '/login';
        }
    }
    return data;
};

export default pb;
