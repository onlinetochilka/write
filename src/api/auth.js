import pb from './pocketbase';

/**
 * Auth API — обёртки над PocketBase SDK для авторизации.
 * Работает с общей коллекцией users на api.tochilka.app.
 */

/**
 * Регистрация нового пользователя.
 * При регистрации бэкенд автоматически даёт 14 дней триала (write_status=active).
 */
export async function register(email, password) {
  const user = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
  });
  
  // Авто-логин после регистрации
  await pb.collection('users').authWithPassword(email, password);
  
  return user;
}

/**
 * Вход по email/password.
 * PocketBase SDK автоматически сохраняет токен в authStore.
 */
export async function login(email, password) {
  const authData = await pb.collection('users').authWithPassword(email, password);
  return authData;
}

/**
 * Выход — очистка токена.
 */
export function logout() {
  pb.authStore.clear();
}

/**
 * Получить текущего пользователя из authStore.
 * Возвращает null если не авторизован.
 */
export function getUser() {
  if (!pb.authStore.isValid) return null;
  return pb.authStore.record;
}

/**
 * Проверка авторизации.
 */
export function isAuthenticated() {
  return pb.authStore.isValid;
}

/**
 * Обновить данные авторизации с сервера (проверить что токен актуален).
 * Вызывать при инициализации приложения.
 */
export async function refreshAuth() {
  if (!pb.authStore.isValid) return null;
  
  try {
    const authData = await pb.collection('users').authRefresh();
    return authData.record;
  } catch (err) {
    // Токен протух — разлогиниваем
    pb.authStore.clear();
    return null;
  }
}

/**
 * Сменить пароль текущего пользователя.
 */
export async function changePassword(oldPassword, newPassword) {
  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error('Не авторизован');
  
  await pb.collection('users').update(userId, {
    oldPassword,
    password: newPassword,
    passwordConfirm: newPassword,
  });
}

/**
 * Проверить, активна ли Pro-подписка на Идеальную тетрадь.
 */
export function isWritePro(user) {
  if (!user) return false;
  if (user.write_status !== 'active') return false;
  if (!user.write_until) return false;
  return new Date(user.write_until) > new Date();
}

/**
 * Подписаться на изменения authStore (для реактивного обновления UI).
 */
export function onAuthChange(callback) {
  return pb.authStore.onChange(callback);
}
