/// <reference path="../pb_data/types.d.ts" />

/**
 * Серверные эндпоинты «Идеальной тетради» (write.tochilka.app)
 * 
 * Файл выполняется внутри PocketBase (pb_hooks).
 * Размещается на сервере: /opt/pocketbase/pb_hooks/write.pb.js
 * 
 * Эндпоинты:
 *   POST /api/write/payments/create  — создать платёж ЮKassa (авториз.)
 *   POST /api/write/payments/webhook — принять уведомление ЮKassa (без авториз.)
 *   POST /api/write/payments/cancel  — отменить подписку (авториз.)
 * 
 * Триал: при регистрации — 14 дней бесплатного Pro.
 */

// ============================================================
// КОНФИГУРАЦИЯ — вставьте данные вашего магазина ЮKassa
// ============================================================

const WRITE_SHOP_ID = "ВАШИЙ_SHOP_ID";     // ← Заменить после одобрения ЮKassa!
const WRITE_SECRET  = "ВАШИЙ_SECRET_KEY";  // ← Заменить после одобрения ЮKassa!

const WRITE_PLANS = {
    "monthly": { price: 199.00,  months: 1,  desc: "Идеальная тетрадь — подписка на 1 месяц" },
    "yearly":  { price: 1788.00, months: 12, desc: "Идеальная тетрадь — подписка на 1 год" },
};

const YOOKASSA_API = "https://api.yookassa.ru/v3/payments";

// ============================================================
// ТРИАЛ — 14 дней Pro при регистрации
// ============================================================

onRecordCreateRequest((e) => {
    // Не перезаписываем, если поля уже заданы (на случай если другой хук сработал)
    if (!e.record.get("write_status")) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        
        e.record.set("write_status", "active");
        e.record.set("write_until", trialEnd.toISOString());
    }
}, "users");

// ============================================================
// СОЗДАНИЕ ПЛАТЕЖА
// ============================================================

routerAdd("POST", "/api/write/payments/create", (e) => {
    // Проверка авторизации
    const auth = e.get("authRecord");
    if (!auth) {
        throw new ForbiddenError("Необходимо войти в аккаунт");
    }

    const body = new DynamicModel({
        plan:       "",
        return_url: ""
    });
    e.bindBody(body);

    const plan = body.plan;
    const returnUrl = body.return_url || "https://write.tochilka.app/payment/success";

    // Валидация плана
    if (!WRITE_PLANS[plan]) {
        throw new BadRequestError("Неизвестный тариф: " + plan);
    }

    const p = WRITE_PLANS[plan];

    // Уникальный ключ идемпотентности (защита от двойных списаний)
    const idempotenceKey = "write_" + auth.id + "_" + plan + "_" + Date.now();

    // Запрос к API ЮKassa
    const res = $http.send({
        url: YOOKASSA_API,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Idempotence-Key": idempotenceKey,
        },
        body: JSON.stringify({
            amount: {
                value: p.price.toFixed(2),
                currency: "RUB",
            },
            capture: true,
            confirmation: {
                type: "redirect",
                return_url: returnUrl,
            },
            description: p.desc,
            metadata: {
                userId: auth.id,
                plan: plan,
                product: "write",
            },
        }),
    });

    // PocketBase $http.send использует Basic Auth через заголовок
    // Добавляем авторизацию вручную
    const authHeader = "Basic " + $security.base64Encode(WRITE_SHOP_ID + ":" + WRITE_SECRET);

    const fullRes = $http.send({
        url: YOOKASSA_API,
        method: "POST",
        headers: {
            "Content-Type":   "application/json",
            "Idempotence-Key": idempotenceKey,
            "Authorization":   authHeader,
        },
        body: JSON.stringify({
            amount: {
                value: p.price.toFixed(2),
                currency: "RUB",
            },
            capture: true,
            confirmation: {
                type: "redirect",
                return_url: returnUrl,
            },
            description: p.desc,
            metadata: {
                userId: auth.id,
                plan: plan,
                product: "write",
            },
        }),
    });

    if (fullRes.statusCode !== 200) {
        console.log("YooKassa error:", fullRes.raw);
        throw new BadRequestError("Ошибка платёжной системы. Попробуйте позже.");
    }

    const payment = JSON.parse(fullRes.raw);

    return e.json(200, {
        payment_id: payment.id,
        confirmation_url: payment.confirmation.confirmation_url,
    });
});

// ============================================================
// ВЕБХУК ЮKassa — уведомление об успешной оплате
// ============================================================

routerAdd("POST", "/api/write/payments/webhook", (e) => {
    const body = new DynamicModel({
        event:  "",
        object: ""   // вложенный объект — парсим вручную
    });
    e.bindBody(body);

    // Обрабатываем только успешные платежи
    if (body.event !== "payment.succeeded") {
        return e.json(200, { ignored: true });
    }

    const payment = typeof body.object === "string"
        ? JSON.parse(body.object)
        : body.object;
    const meta = payment.metadata;

    // Проверяем, что это платёж для Тетради
    if (!meta || meta.product !== "write") {
        return e.json(200, { ignored: true, reason: "not write product" });
    }

    const userId = meta.userId;
    const plan = meta.plan;
    const months = WRITE_PLANS[plan]?.months || 1;

    // Находим пользователя
    let user;
    try {
        user = $app.findRecordById("users", userId);
    } catch (err) {
        console.log("Write webhook: user not found:", userId);
        return e.json(200, { error: "user not found" });
    }

    // Определяем дату начала продления
    let startDate = new Date();
    const currentUntil = user.get("write_until");
    
    if (user.get("write_status") === "active" && currentUntil) {
        const existingEnd = new Date(currentUntil);
        if (existingEnd > startDate) {
            // Если подписка ещё активна — продлеваем от конца текущей
            startDate = existingEnd;
        }
    }

    // Добавляем месяцы
    startDate.setMonth(startDate.getMonth() + months);

    // Обновляем запись
    user.set("write_status", "active");
    user.set("write_until", startDate.toISOString());
    user.set("write_payment_id", payment.id);

    $app.save(user);

    console.log("Write webhook: subscription updated for user", userId, 
        "plan:", plan, "until:", startDate.toISOString());

    return e.json(200, { success: true });
});

// ============================================================
// ОТМЕНА ПОДПИСКИ
// ============================================================

routerAdd("POST", "/api/write/payments/cancel", (e) => {
    const auth = e.get("authRecord");
    if (!auth) {
        throw new ForbiddenError("Необходимо войти в аккаунт");
    }

    const user = $app.findRecordById("users", auth.id);
    user.set("write_status", "inactive");
    $app.save(user);

    console.log("Write: subscription cancelled for user", auth.id);

    return e.json(200, { success: true });
});
