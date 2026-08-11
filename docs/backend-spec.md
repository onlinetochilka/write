# Бэкенд-спецификация: «Идеальная тетрадь» (write.tochilka.app)

> Используется **общий** PocketBase-инстанс на `api.tochilka.app`.
> Этот документ описывает, что нужно добавить на сервере для работы подписки.

---

## 1. Миграция — новые поля в `users`

Создать файл `pb_migrations/XXXXXX_add_write_subscription_fields.js`:

```javascript
migrate((app) => {
    const users = app.findCollectionByNameOrId("users");

    users.fields.add(new Field({
        name: "write_status",
        type: "select",
        options: { values: ["active", "inactive"] },
    }));

    users.fields.add(new Field({
        name: "write_until",
        type: "date",
    }));

    users.fields.add(new Field({
        name: "write_payment_id",
        type: "text",
    }));

    app.save(users);
}, (app) => {
    // revert
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("write_status");
    users.fields.removeByName("write_until");
    users.fields.removeByName("write_payment_id");
    app.save(users);
});
```

---

## 2. Триал при регистрации (14 дней)

В `pb_hooks/write.pb.js` — хук на создание пользователя:

```javascript
onRecordCreateRequest((e) => {
    const now = new Date();
    now.setDate(now.getDate() + 14); // 14 дней триала
    e.record.set("write_status", "active");
    e.record.set("write_until", now.toISOString());
    e.next();
}, "users");
```

> ⚠️ Если такой хук уже есть для ежедневника (`tutor_status`), нужно **добавить** поля Тетради
> в тот же хук, а не создавать второй `onRecordCreateRequest` на `"users"`.

---

## 3. Эндпоинт: Создание платежа

**Маршрут:** `POST /api/write/payments/create`
**Авторизация:** Требуется (PocketBase auth token)

```javascript
// pb_hooks/write.pb.js

const WRITE_SHOP_ID = "ВАШИЙ_SHOP_ID";      // ← Заменить!
const WRITE_SECRET  = "ВАШИЙ_SECRET_KEY";   // ← Заменить!

const WRITE_PLANS = {
    "monthly": { price: 199.00,  months: 1,  desc: "Идеальная тетрадь — 1 месяц" },
    "yearly":  { price: 1788.00, months: 12, desc: "Идеальная тетрадь — 1 год" },
};

routerAdd("POST", "/api/write/payments/create", (c) => {
    const auth = c.auth;
    if (!auth) throw new ForbiddenError("Not authenticated");

    const data = $apis.requestInfo(c).body;
    const plan = data.plan;
    const returnUrl = data.return_url || "https://write.tochilka.app/payment/success";

    if (!WRITE_PLANS[plan]) throw new BadRequestError("Invalid plan: " + plan);

    const p = WRITE_PLANS[plan];
    const idempotenceKey = `write_${auth.id}_${plan}_${Date.now()}`;

    const res = $http.send({
        url: "https://api.yookassa.ru/v3/payments",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Idempotence-Key": idempotenceKey,
            "Authorization": "Basic " + btoa(WRITE_SHOP_ID + ":" + WRITE_SECRET),
        },
        body: JSON.stringify({
            amount: { value: p.price.toFixed(2), currency: "RUB" },
            capture: true,
            confirmation: { type: "redirect", return_url: returnUrl },
            description: p.desc,
            metadata: { userId: auth.id, plan: plan, product: "write" },
        }),
    });

    const payment = JSON.parse(res.raw);
    
    return c.json(200, {
        payment_id: payment.id,
        confirmation_url: payment.confirmation.confirmation_url,
    });
});
```

---

## 4. Эндпоинт: Вебхук ЮKassa

**Маршрут:** `POST /api/write/payments/webhook`
**Авторизация:** Нет (вызывается ЮKassa)

```javascript
routerAdd("POST", "/api/write/payments/webhook", (c) => {
    const data = $apis.requestInfo(c).body;

    if (data.event !== "payment.succeeded") {
        return c.json(200, { ignored: true });
    }

    const payment = data.object;
    const meta = payment.metadata;

    if (!meta || meta.product !== "write") {
        return c.json(200, { ignored: true, reason: "not write product" });
    }

    const userId = meta.userId;
    const plan = meta.plan;
    const months = WRITE_PLANS[plan]?.months || 1;

    const user = $app.findRecordById("users", userId);
    if (!user) {
        return c.json(200, { error: "user not found" });
    }

    // Определить дату начала продления
    let startDate = new Date();
    const currentUntil = user.get("write_until");
    if (user.get("write_status") === "active" && currentUntil) {
        const existingEnd = new Date(currentUntil);
        if (existingEnd > startDate) {
            startDate = existingEnd; // Продлить от конца текущей подписки
        }
    }

    // Добавить месяцы
    startDate.setMonth(startDate.getMonth() + months);

    user.set("write_status", "active");
    user.set("write_until", startDate.toISOString());
    user.set("write_payment_id", payment.id);

    $app.save(user);

    return c.json(200, { success: true });
});
```

---

## 5. Эндпоинт: Отмена подписки

**Маршрут:** `POST /api/write/payments/cancel`
**Авторизация:** Требуется

```javascript
routerAdd("POST", "/api/write/payments/cancel", (c) => {
    const auth = c.auth;
    if (!auth) throw new ForbiddenError("Not authenticated");

    const user = $app.findRecordById("users", auth.id);
    user.set("write_status", "inactive");
    $app.save(user);

    return c.json(200, { success: true });
});
```

---

## 6. Настройка ЮKassa

### Создать магазин
1. Войти в [личный кабинет ЮKassa](https://yookassa.ru/my)
2. Создать **новый магазин** для «Идеальной тетради»
3. Получить `shop_id` и `secret_key`
4. Вставить в `WRITE_SHOP_ID` и `WRITE_SECRET` в `pb_hooks/write.pb.js`

### Настроить вебхук
- **URL:** `https://api.tochilka.app/api/write/payments/webhook`
- **Событие:** `payment.succeeded`
- **Формат:** JSON

---

## 7. Деплой

```bash
# Залить хуки и миграции
scp pb_hooks/write.pb.js root@<SERVER_IP>:/opt/pocketbase/pb_hooks/
scp pb_migrations/XXXXXX_add_write_subscription_fields.js root@<SERVER_IP>:/opt/pocketbase/pb_migrations/

# Перезапустить PocketBase
ssh root@<SERVER_IP> "systemctl restart pocketbase"
```

---

## 8. Тестирование

### Тестовый режим ЮKassa
В личном кабинете ЮKassa переключите магазин в тестовый режим.
Используйте тестовые карты:
- ✅ Успешная оплата: `1111 1111 1111 1026`, дата: любая будущая, CVC: любые 3 цифры
- ❌ Отклонённая: `1111 1111 1111 1033`

### Чеклист тестирования
- [ ] Регистрация → триал 14 дней → `write_status = active`
- [ ] Нажать «Оформить Pro» → редирект на ЮKassa → оплатить → вебхук → `write_until` продлён
- [ ] Проверить, что Pro-фичи разблокировались (косая линейка, фигуры)
- [ ] Водяной знак исчез для Pro
- [ ] Отмена подписки → `write_status = inactive`
- [ ] Повторная оплата при активной подписке → продление от конца
