# Microservice Skeleton
Цей репозиторій є базовим шаблоном (скелетоном) для створення мікросервісів на Node.js.\
Він включає налаштовану архітектуру, роботу з БД (PostgreSQL), чергами (RabbitMQ), планувальником (Cron), документацією (Swagger) та тестами

+ [Технологічний стек](#технологічний-стек)
+ [Швидкий старт](#швидкий-старт)
  1. [Попередні вимоги](#1-попередні-вимоги)
  2. [Встановлення](#2-встановлення)
  3. [Ініціалізація Баз Даних](#3-ініціалізація-баз-даних)
+ [Як додати нову сутність](#як-додати-нову-сутність)
  1. [Копіювання сервісу-прикладу](#крок-1-копіюємо-example-service-попередньо-перейшовши-в-папку-services)
  2. [Міграція БД](#крок-2-міграція-бд)
  3. [Створення](#крок-3-entity-інтерфейс)
     + [Інтерфейс сутності](#крок-3-entity-інтерфейс)
     + [Репозиторій](#крок-4-repository-робота-з-даними)
     + [Сервіс](#крок-5-service-бізнес-логіка)
     + [Контролер](#крок-6-controller-http-обробка)
  4. [Реєстрація в контейнері](#крок-7-container-manual-di)
  5. [Маршрути та документація](#крок-8-routes--swagger)
  6. [Docker Compose](#крок-9-docker-compose)
+ [Правила побудови маршрутів по методам](#правила-побудови-маршрутів)
  + [GET](#метод-get)
  + [POST](#метод-post)
  + [PATCH](#метод-patch)
  + [DELETE](#метод-delete)
+ [RabbitMQ (Асинхронна комунікація)](#rabbitmq-асинхронна-комунікація)
  + [Відправка повідомлень](#відправка-повідомлень-producer)
  + [Отримання повідомлень](#отримання-повідомлень-consumer)
+ [Cron Jobs (Планувальник)](#cron-jobs-планувальник)
+ [Тестування](#тестування)
+ [NPM Scripts (Пояснення)](#npm-scripts-пояснення)
+ [Git Workflow](#git-workflow)
+ [Окремі випадки в Git](#окремі-випадки-в-git)
  1. [Помилка при git pull origin main](#1-span-stylecolor-redпомилкаspan-your-local-changes-to-the-following-files-would-be-overwritten-by-merge)
  2. [Попередження при git pull origin main](#2-span-stylecolor-yellowпопередження-spanpulling-without-specifying-how-to-reconcile-divergent-branches-is-discouraged)
  3. [Помилка при git push origin <branch-name>](#3-span-stylecolor-redпомилка-span-failed-to-push-some-refs-to-httpsgithubcomnazeekkexplorelygit)
  4. [Ситуація зі змінами існуючого коміту](#4-span-stylecolor-greenситуаціяspan-вже-закомітив-але-довелось-внести-зміни-щодо-цього-ж-коміту)
  5. [Ситуація з перейменуванням гілки](#5-span-stylecolor-greenситуаціяspan-гілка-існує-тільки-локально-і-захотілось-змінити-її-назву)

## Технологічний стек
+ **Runtime**: Node.js (v20+)
+ **Language**: TypeScript
+ **Framework**: Express.js
+ **Database**: PostgreSQL (`pg` driver + Custom BaseRepository)
+ **Message Broker**: RabbitMQ (`amqplib`)
+ **Scheduler**: Node-cron
+ **Validation**: Joi
+ **Docs**: Swagger (OpenAPI 3.0 YAML)
+ **Testing**: Jest + Supertest
+ **Linting**: ESLint + Prettier
## Швидкий старт
### 1. Попередні вимоги
Переконуємось, що у нас встановлені:
+ Docker & Docker Compose
+ Node.js
### 2. Встановлення
```Bash
git clone https://github.com/Nazeekk/explorely.git
cd explorely/configs

docker compose up -d --build
```
### 3. Ініціалізація Баз Даних
Після запуску контейнерів потрібно створити таблиці в БД для кожного сервісу
```Bash
docker ps --format "{{.Names}}" | grep service | xargs -I {} docker exec {} npm run db:init
```
Ця команда запустить скрипт з папки `src/scripts/migrate.ts` кожного сервісу, який створить необхідні таблиці
## Як додати нову сутність
Процес додавання нової функціональності (наприклад, сутності `Order`) виглядає так:
### Крок 1: Копіюємо `example-service`, попередньо перейшовши в папку [`services`](services)
+ Linux
   ```bash
   cp -r example-service orders-service
   cd order-service
   ```
+ Windows
   ```pwsh
   xcopy example-service orders-service
   cd orders-service
   ```
### Крок 2: Міграція БД
Відкриваємо `src/scripts/migrate.ts` і додаємо SQL запит для створення таблиці:
```TypeScript
const sql = `
  CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;
await container.database.query(sql);
```
Тепер запускаємо ```npm run db:init```
### Крок 3: Entity (Інтерфейс)
Створимо файл `src/database/entities/Order.ts` [(приклад)](services/example-service/src/database/entities/Example.ts):
```TypeScript
export default interface Order {
  order_id?: number;
  user_id: number;
  total: number;
  created_at?: Date;
}
```
### Крок 4: Repository (Робота з даними)
Створимо `src/database/repositories/orders.ts` [(приклад)](services/example-service/src/database/repositories/example.ts). Наслідуйтесь від `BaseRepository` для отримання стандартних методів (`create`, `find`, `findById`)
```TypeScript
import Database from '../index';
import { BaseRepository } from '../base.repository';
import Order from '../entities/Order';

export default class OrdersRepository extends BaseRepository<Order> {
  constructor(db: Database) {
    super(db, 'orders'); // 'orders' - назва таблиці в БД
  }
}
```
### Крок 5: Service (Бізнес-логіка)
Створимо `src/services/orders.ts` [(приклад)](services/example-service/src/services/example.ts)
```TypeScript
import OrdersRepository from '../database/repositories/orders';

export default class OrdersService {
  constructor(private readonly repository: OrdersRepository) {}
  async create(data: any) {
    // Тут ваша бізнес-логіка (перевірки, розрахунки)
    return this.repository.create(data);
  }
}
```
### Крок 6: Controller (HTTP обробка)
Створимо `src/controllers/orders.ts` [(приклад)](services/example-service/src/controllers/example.ts)
```TypeScript
import { Request, Response, NextFunction } from 'express';
import OrdersService from '../services/orders';

export default class OrdersController {
  constructor(private readonly service: OrdersService) {}
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
```
### Крок 7: Container (Manual DI)
Реєструємо нові класи в `src/container.ts`:
```TypeScript
// ... imports
class Container {
// ...
  public readonly ordersController: OrdersController;

  constructor() {
// ...
    const ordersRepository = new OrdersRepository(this.database);
    const ordersService = new OrdersService(ordersRepository);
    this.ordersController = new OrdersController(ordersService);
  }
}
```
### Крок 8: Routes & Swagger
1. Створюємо `src/routes/orders.ts` [(приклад)](services/example-service/src/routes/example.ts), додаємо валідацію і підключаємо контролер з контейнера
2. Підключаємо роут в `src/app.ts`
3. Описуємо ендпойнти в `src/docs/swagger.yaml`
### Крок 9: Docker Compose
Тепер додаємо сервіс в [docker-compose.yml](configs/docker-compose.yml)
```yaml
  orders-service:
    build: ../services/orders-service
    container_name: orders-service
    ports:
      - "3002:3000" # Вказуємо унікальний порт контейнера, де 3002 - зовнішній порт, 3000 - внутрішній порт
    volumes:
      - ../services/orders-service/src:/app/src
      - ../services/orders-service/package.json:/app/package.json
      - ../services/orders-service/tsconfig.json:/app/tsconfig.json
      - /app/node_modules
    env_file:
      - ./dotenv/dev/.env.common
      - ./dotenv/dev/.env.postgres
      - ./dotenv/dev/.env.orders # Попередньо створений файл на основі .env.example
      - ./dotenv/dev/.env.rabbitmq
    depends_on:
      postgres-db:
        condition: service_healthy
      rabbit:
        condition: service_healthy
    command: npm run dev
```
## Правила побудови маршрутів
### Метод GET
1. Всі параметри пошуку завжди передаємо в `query`, не використовуємо `params` чи `body` для цього методу
2. Для зручності завжди додаємо `/find` в кінці таких маршрутів
3. Такий запит завжди повертає JSON вигляду
   ```json
   {
     "message": "ok",
     "data": []
   }
   ```
   Де **message** - це повідомлення від сервіса, що по замовчуванню є "ok", якщо сервіс не визначив іншого\
   **data** - це масив об'єктів, в якому описаний результат пошуку
### Метод POST
1. Всі параметри створення завжди передаємо в `body`, не використовуємо `query` чи `params` для цього методу
2. Для зручності завжди додаємо `/create` в кінці таких маршрутів (за винятком наприклад `/login` чи `/register` та подібного)
3. Такий запит завжди повертає JSON вигляду
   ```json
   {
     "message": "ok",
     "data": {}
   }
   ```
   Де **message** - це повідомлення від сервіса, що по замовчуванню є "ok", якщо сервіс не визначив іншого\
   **data** - це об'єкт, в якому описаний створений запис в таблиці
### Метод PATCH
1. Всі параметри оновлення передаємо в `body`, а ID в `params`, не використовуємо `query` для цього методу
2. Для зручності завжди додаємо `/update/:id` в кінці таких маршрутів
3. Такий запит завжди повертає JSON вигляду
   ```json
   {
     "message": "ok",
     "data": {}
   }
   ```
   Де **message** - це повідомлення від сервіса, що по замовчуванню є "ok", якщо сервіс не визначив іншого\
   **data** - це об'єкт, в якому описаний оновлений запис в таблці
### Метод DELETE
1. Видалення відбувається завжди по ID з `params`
2. Для зручності завжди додаємо `/delete/:id` в кінці таких маршрутів
3. Такий запит завжди повертає JSON вигляду
   ```json
   {
     "message": "ok"
   }
   ```
   Де **message** - це повідомлення від сервіса, що по замовчуванню є "ok", якщо сервіс не визначив іншого
## RabbitMQ (Асинхронна комунікація)
### Відправка повідомлень (Producer)
Використовуємо `rabbitMQService` з контейнера в будь-якому місці (наприклад, у сервісі):
```TypeScript
await container.rabbitMQService.sendToQueue('queue_name', {
  event: 'order_created',
  data: { id: 123 }
});
```
### Отримання повідомлень (Consumer)
1. Створимо клас у `src/consumers/orders.ts` [(приклад)](src/consumers/example.ts)
2. Додаємо метод `init`, який підписується на чергу
3. Додаємо консюмер у `Container`
4. Викликаємо `await container.orderConsumer.init()` у `src/server.ts`
## Cron Jobs (Планувальник)
1. Створимо клас у `src/jobs/my.job.ts` [(приклад)](services/example-service/src/jobs/example.job.ts), імплементуючи [`IJob`](services/example-service/src/jobs/job.interface.ts):
   ```TypeScript
   export class MyJob implements IJob {
     name = 'Cleanup Job';
     cronExpression = '0 0 * * *'; // Щодня опівночі
     async execute() { console.log('Doing work...');
     }
   }
   ```
2. Додаємо джобу в `Container`
3. Вона автоматично підхопиться циклом у `src/server.ts`
## Тестування
Проєкт використовує **Jest**
+ **Unit Tests**: Пишуться для сервісів, мокаючи репозиторії
+ **Integration Tests**: Пишуться для роутів (`supertest`), перевіряючи весь ланцюжок

Запуск тестів:
```Bash
npm test
```
## NPM Scripts (Пояснення)
| Команда                  | Опис                                                               |
|--------------------------|--------------------------------------------------------------------|
| ```npm run dev```        | Запуск у режимі розробки з `nodemon` (перезавантаження при змінах) |
| ```npm run build```      | Компіляція TS у JS в папку `dist` та копіювання Swagger YAML       |   
| ```npm start```          | Запуск скомпільованого коду з папки `dist` (Production mode)       |  
| ```npm run db:init```    | Запуск міграцій (створення таблиць)                                |
| ```npm run lint```       | Перевірка коду лінтером (ESLint)                                   |
| ```npm run format```     | Перевірка форматування (Prettier)                                  |
| ```npm run format:fix``` | Автоматичне виправлення форматування                               |
| ```npm test```           | Запуск тестів із покриттям коду                                    |
## Git Workflow
Стандартний Git Workflow виглядатиме таким чином:
1. **main** — головна гілка
2. **branch-name** — гілки для нових фіч, назва коротко (1-3 слова) описує завдання
### Процес роботи:
1. Створюємо нову гілку від `main`:\
   `git checkout -b <branch-name>`
2. Вносимо потрібні зміни. Повідомлення комітів мають описувати що зробив у цій гілці
3. Перевіряємо лінтер, форматування та тести:
    ```Bash
    npx eslint . --fix && npm run format:fix && npm test
    ```
4. Перед тим як пушити стягуємо правки з **main**:
   ```bash
   git pull origin main
   ```
5. Робимо `Push` та відкриваємо `Pull Request (PR)`:
   ```bash
   git push origin <branch-name>
   ```
6. Після того як `PR` буде змерджений видаляємо локальну гілку
   ```bash
   git checkout main
   git pull origin main
   git branch -d <branch-name>
   ```

## Окремі випадки в Git
### 1. <span style="color: red">Помилка:</span> Your local changes to the following files would be overwritten by merge.
Якщо не бажаємо комітити, то виконуємо:
   ```bash
   git stash
   git pull origin main
   git stash pop
   ```
`git stash` сховає зміни у тимчасове сховище, в той час як `git stash pop` витягне останню комірку
### 2. <span style="color: yellow">Попередження: </span>Pulling without specifying how to reconcile divergent branches is discouraged.
Таке попередження виникає під час спроби `git pull origin main`, коли зміни вже закомічені, а віддалена гілка **main** має новішу версію змін.\
В такому випадку робимо:
```bash
git pull origin main --rebase
```
### 3. <span style="color: red">Помилка: </span> failed to push some refs to https://github.com/Nazeekk/explorely.git
Помилка може виникнути при спробі зробити `git push origin <branch-name>`. Найчастіше означає, як і в [пункті №2](#2-span-stylecolor-yellowпопередження-spanpulling-without-specifying-how-to-reconcile-divergent-branches-is-discouraged), що потрібно виконати:
```bash
git pull origin main
```
або ж
```bash
git pull origin main --rebase
```
### 4. <span style="color: green">Ситуація:</span> вже закомітив, але довелось внести зміни щодо цього ж коміту
В такій ситуації, якщо не критично, можна змерджити існуючий `Pull Request` і створити нову гілку з новим комітом та новим `Pull Request`.\
Втім, за умови що над гілкою працює тільки один виконавець, ліпше в цю же гілку зробити ще один коміт або з новим повідомленням, або з вказанням прапорців:
```bash
git commit --amend --no-edit
```
Це означає що коміт не змінить свого повідомлення, але при спробі пушу в такому разі доведеться писати:
```bash
git push origin <branch-name> --force-with-lease
```
### 5. <span style="color: green">Ситуація:</span> гілка існує тільки локально і захотілось змінити її назву:
Знаходячись в гілці, яку потрібно перейменувати виконуємо:
```bash
git branch -M new-branch-name
```

+ [Технологічний стек](#технологічний-стек)
+ [Швидкий старт](#швидкий-старт)
  1. [Попередні вимоги](#1-попередні-вимоги)
  2. [Встановлення](#2-встановлення)
  3. [Ініціалізація Баз Даних](#3-ініціалізація-баз-даних)
+ [Як додати нову сутність](#як-додати-нову-сутність)
  1. [Копіювання сервісу-прикладу](#крок-1-копіюємо-example-service-попередньо-перейшовши-в-папку-services)
  2. [Міграція БД](#крок-2-міграція-бд)
  3. [Створення](#крок-3-entity-інтерфейс)
     + [Інтерфейс сутності](#крок-3-entity-інтерфейс)
     + [Репозиторій](#крок-4-repository-робота-з-даними)
     + [Сервіс](#крок-5-service-бізнес-логіка)
     + [Контролер](#крок-6-controller-http-обробка)
  4. [Реєстрація в контейнері](#крок-7-container-manual-di)
  5. [Маршрути та документація](#крок-8-routes--swagger)
  6. [Docker Compose](#крок-9-docker-compose)
+ [Правила побудови маршрутів по методам](#правила-побудови-маршрутів)
  + [GET](#метод-get)
  + [POST](#метод-post)
  + [PATCH](#метод-patch)
  + [DELETE](#метод-delete)
+ [RabbitMQ (Асинхронна комунікація)](#rabbitmq-асинхронна-комунікація)
  + [Відправка повідомлень](#відправка-повідомлень-producer)
  + [Отримання повідомлень](#отримання-повідомлень-consumer)
+ [Cron Jobs (Планувальник)](#cron-jobs-планувальник)
+ [Тестування](#тестування)
+ [NPM Scripts (Пояснення)](#npm-scripts-пояснення)
+ [Git Workflow](#git-workflow)
+ [Окремі випадки в Git](#окремі-випадки-в-git)
  1. [Помилка при git pull origin main](#1-span-stylecolor-redпомилкаspan-your-local-changes-to-the-following-files-would-be-overwritten-by-merge)
  2. [Попередження при git pull origin main](#2-span-stylecolor-yellowпопередження-spanpulling-without-specifying-how-to-reconcile-divergent-branches-is-discouraged)
  3. [Помилка при git push origin <branch-name>](#3-span-stylecolor-redпомилка-span-failed-to-push-some-refs-to-httpsgithubcomnazeekkexplorelygit)
  4. [Ситуація зі змінами існуючого коміту](#4-span-stylecolor-greenситуаціяspan-вже-закомітив-але-довелось-внести-зміни-щодо-цього-ж-коміту)
  5. [Ситуація з перейменуванням гілки](#5-span-stylecolor-greenситуаціяspan-гілка-існує-тільки-локально-і-захотілось-змінити-її-назву)
