import pb from './pocketbase';

/**
 * Payments API — обёртки для платёжных эндпоинтов Идеальной тетради.
 * Эндпоинты реализуются в pb_hooks/write.pb.js на сервере.
 */

/** Тарифные планы */
export const PLANS = {
  monthly: { 
    price: 199, 
    months: 1, 
    label: 'Ежемесячная', 
    desc: 'Подписка на 1 месяц',
    perMonth: 199,
  },
  yearly: { 
    price: 1788, 
    months: 12, 
    label: 'Годовая', 
    desc: 'Подписка на 1 год',
    perMonth: 149,
    badge: '-25%',
  },
};

/**
 * Создать платёж через ЮKassa.
 * 
 * @param {'monthly'|'yearly'} plan — ключ тарифа
 * @returns {{ payment_id: string, confirmation_url: string }}
 * 
 * После получения confirmation_url → window.location.href = confirmation_url
 * Пользователь оплачивает на странице ЮKassa, потом его редиректит на return_url.
 */
export async function createSubscription(plan) {
  const returnUrl = window.location.origin + '/payment/success';
  
  const result = await pb.send('/api/write/payments/create', {
    method: 'POST',
    body: {
      plan,
      return_url: returnUrl,
    },
  });
  
  return result;
}

/**
 * Получить текущий статус подписки (из записи пользователя).
 */
export function getSubscriptionInfo(user) {
  if (!user) return { status: 'none', until: null, isActive: false };
  
  const isActive = user.write_status === 'active' 
    && user.write_until 
    && new Date(user.write_until) > new Date();
  
  return {
    status: user.write_status || 'inactive',
    until: user.write_until ? new Date(user.write_until) : null,
    isActive,
    daysLeft: isActive 
      ? Math.ceil((new Date(user.write_until) - new Date()) / (1000 * 60 * 60 * 24))
      : 0,
  };
}

/**
 * Отменить подписку.
 */
export async function cancelSubscription() {
  return await pb.send('/api/write/payments/cancel', {
    method: 'POST',
  });
}
