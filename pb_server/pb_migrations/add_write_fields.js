/// <reference path="../pb_data/types.d.ts" />

/**
 * Миграция: добавить поля подписки на «Идеальную тетрадь» в коллекцию users.
 * 
 * Поля:
 *   write_status  — select (active | inactive)
 *   write_until   — date (дата окончания подписки)
 *   write_payment_id — text (ID последнего платежа ЮKassa)
 */

migrate((app) => {
    const users = app.findCollectionByNameOrId("users");

    // Статус подписки
    users.fields.add(new Field({
        name: "write_status",
        type: "select",
        options: {
            values: ["active", "inactive"],
        },
    }));

    // Дата окончания подписки
    users.fields.add(new Field({
        name: "write_until",
        type: "date",
    }));

    // ID последнего платежа ЮKassa
    users.fields.add(new Field({
        name: "write_payment_id",
        type: "text",
    }));

    app.save(users);
}, (app) => {
    // Откат миграции
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("write_status");
    users.fields.removeByName("write_until");
    users.fields.removeByName("write_payment_id");
    app.save(users);
});
