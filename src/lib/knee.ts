export type Locale = 'en' | 'ru';
export type Localized = Record<Locale, string>;
export type Layer = 'bones' | 'muscles' | 'ligaments' | 'labels' | 'axis';
export type Pathology = 'restricted' | 'contracture';
export type Mode = 'explore' | 'compare' | 'rehab';
export type Tab = 'anatomy' | 'biomechanics' | 'pathology' | 'rehabilitation' | 'sources';
export type StructureId =
  | 'femur'
  | 'tibia'
  | 'fibula'
  | 'patella'
  | 'quadriceps'
  | 'hamstrings'
  | 'acl'
  | 'pcl'
  | 'mcl'
  | 'lcl';
export const text = (en: string, ru: string): Localized => ({ en, ru });

export const structures: {
  id: StructureId;
  layer: Layer;
  name: Localized;
  description: Localized;
  function: Localized;
  source: string;
}[] = [
  {
    id: 'femur',
    layer: 'bones',
    name: text('Femur', 'Бедренная кость'),
    description: text(
      'The distal femoral condyles articulate with the tibial plateau. The anterior trochlear region articulates with the patella.',
      'Дистальные мыщелки бедренной кости сочленяются с плато большеберцовой кости. Передняя блоковая поверхность сочленяется с надколенником.',
    ),
    function: text(
      'Transfers load through the tibiofemoral joint and guides patellar motion.',
      'Передаёт нагрузку через тибиофеморальный сустав и направляет движение надколенника.',
    ),
    source: 'kapandji',
  },
  {
    id: 'tibia',
    layer: 'bones',
    name: text('Tibia', 'Большеберцовая кость'),
    description: text(
      'The tibial plateau forms the inferior articular surface of the tibiofemoral joint. Menisci are omitted in this first model.',
      'Плато большеберцовой кости образует нижнюю суставную поверхность тибиофеморального сустава. Мениски в этой модели не представлены.',
    ),
    function: text(
      'Receives load from the femur. The moving segment here represents open-chain knee motion.',
      'Принимает нагрузку от бедренной кости. Подвижный сегмент здесь представляет движение в открытой кинематической цепи.',
    ),
    source: 'kapandji',
  },
  {
    id: 'fibula',
    layer: 'bones',
    name: text('Fibula', 'Малоберцовая кость'),
    description: text(
      'The fibula lies lateral to the tibia. Its head is an attachment region for the lateral collateral ligament and biceps femoris tendon; it does not articulate with the femur.',
      'Малоберцовая кость расположена латерально от большеберцовой. Её головка служит местом прикрепления латеральной коллатеральной связки и сухожилия двуглавой мышцы бедра; с бедренной костью она не сочленяется.',
    ),
    function: text(
      'Provides attachment sites and participates in the proximal tibiofibular joint.',
      'Обеспечивает места прикрепления и участвует в проксимальном межберцовом суставе.',
    ),
    source: 'kapandji',
  },
  {
    id: 'patella',
    layer: 'bones',
    name: text('Patella', 'Надколенник'),
    description: text(
      'A sesamoid bone within the knee extensor mechanism. Its posterior surface articulates with the femoral trochlea.',
      'Сесамовидная кость разгибательного аппарата колена. Её задняя поверхность сочленяется с блоком бедренной кости.',
    ),
    function: text(
      'Contributes to the mechanical advantage of the quadriceps. Tracking is schematic in this viewer.',
      'Участвует в обеспечении механического преимущества четырёхглавой мышцы. Траектория в этой модели схематична.',
    ),
    source: 'kapandji',
  },
  {
    id: 'quadriceps',
    layer: 'muscles',
    name: text('Quadriceps', 'Четырёхглавая мышца'),
    description: text(
      'The quadriceps femoris muscle group acts through the quadriceps tendon, patella, and patellar ligament.',
      'Четырёхглавая мышца бедра действует через сухожилие четырёхглавой мышцы, надколенник и связку надколенника.',
    ),
    function: text(
      'Produces knee extension. Highlighting indicates an illustrative action role, not measured activation or force.',
      'Обеспечивает разгибание колена. Подсветка показывает условную роль в движении, а не измеренную активацию или силу.',
    ),
    source: 'kapandji',
  },
  {
    id: 'hamstrings',
    layer: 'muscles',
    name: text('Hamstrings', 'Задняя группа мышц бедра'),
    description: text(
      'Schematic posterior thigh muscle paths represent the hamstring group. Individual origins and insertions are simplified.',
      'Схематичные пути по задней поверхности бедра представляют заднюю группу мышц. Места начала и прикрепления отдельных мышц упрощены.',
    ),
    function: text(
      'Contributes to knee flexion. Real muscle activity also depends on load, task, and hip position.',
      'Участвует в сгибании колена. Реальная активность зависит также от нагрузки, задачи и положения тазобедренного сустава.',
    ),
    source: 'kapandji',
  },
  {
    id: 'acl',
    layer: 'ligaments',
    name: text('Anterior cruciate ligament', 'Передняя крестообразная связка'),
    description: text(
      'The ACL connects the anterior intercondylar region of the tibia to the medial surface of the lateral femoral condyle. Attachment sites here are schematic.',
      'ПКС соединяет переднее межмыщелковое поле большеберцовой кости с медиальной поверхностью латерального мыщелка бедра. Места прикрепления здесь схематичны.',
    ),
    function: text(
      'Helps restrain anterior tibial translation relative to the femur and contributes to rotational stability.',
      'Ограничивает переднее смещение большеберцовой кости относительно бедренной и участвует в ротационной стабильности.',
    ),
    source: 'kapandji',
  },
  {
    id: 'pcl',
    layer: 'ligaments',
    name: text('Posterior cruciate ligament', 'Задняя крестообразная связка'),
    description: text(
      'The PCL connects the posterior intercondylar tibial region to the lateral surface of the medial femoral condyle. Paths are simplified.',
      'ЗКС соединяет заднее межмыщелковое поле большеберцовой кости с латеральной поверхностью медиального мыщелка бедра. Пути упрощены.',
    ),
    function: text(
      'Helps restrain posterior tibial translation relative to the femur.',
      'Ограничивает заднее смещение большеберцовой кости относительно бедренной.',
    ),
    source: 'kapandji',
  },
  {
    id: 'mcl',
    layer: 'ligaments',
    name: text('Medial collateral ligament', 'Медиальная коллатеральная связка'),
    description: text(
      'A schematic medial connection between the femur and tibia. Individual bundles and capsular connections are omitted.',
      'Схематичное медиальное соединение бедренной и большеберцовой костей. Отдельные пучки и капсульные связи не представлены.',
    ),
    function: text(
      'Contributes to restraint of valgus loading and joint stability.',
      'Участвует в ограничении вальгусной нагрузки и стабильности сустава.',
    ),
    source: 'kapandji',
  },
  {
    id: 'lcl',
    layer: 'ligaments',
    name: text('Lateral collateral ligament', 'Латеральная коллатеральная связка'),
    description: text(
      'A schematic lateral connection between the femur and fibular head.',
      'Схематичное латеральное соединение бедренной кости и головки малоберцовой.',
    ),
    function: text(
      'Contributes to restraint of varus loading and joint stability.',
      'Участвует в ограничении варусной нагрузки и стабильности сустава.',
    ),
    source: 'kapandji',
  },
];

export const sources = [
  {
    id: 'kapandji',
    author: 'A. I. Kapandji',
    title: text(
      'The Physiology of the Joints · Volume 2: Lower Limb',
      'Физиология суставов · Том 2: Нижняя конечность',
    ),
    scope: text(
      'Primary intended reference for knee anatomy and biomechanics.',
      'Основной предполагаемый источник по анатомии и биомеханике колена.',
    ),
  },
  {
    id: 'maxey',
    author: 'Maxey & Magnusson',
    title: text(
      'Rehabilitation for the Postsurgical Orthopedic Patient',
      'Rehabilitation for the Postsurgical Orthopedic Patient',
    ),
    scope: text(
      'Primary intended reference for postoperative education.',
      'Основной предполагаемый источник по послеоперационному обучению.',
    ),
  },
  {
    id: 'kapandji-upper',
    author: 'A. I. Kapandji',
    title: text(
      'The Physiology of the Joints · Volume 1: Upper Limb',
      'Физиология суставов · Том 1: Верхняя конечность',
    ),
    scope: text(
      'Reserved for future upper-limb modules; not a knee reference.',
      'Для будущих модулей верхней конечности; не источник по колену.',
    ),
  },
];

export const biomechanics = [
  {
    title: text('More than a simple hinge', 'Сложнее простого шарнира'),
    body: text(
      'Knee flexion and extension involve coupled rolling and sliding at the tibiofemoral surfaces. The instantaneous axis changes with position. This viewer uses a transverse rotation and a geometry-specific clearance displacement to separate the schematic plateau and condyles. The displayed axis is a reference; physiological contact mechanics are not reproduced.',
      'Сгибание и разгибание колена сопровождаются сочетанием качения и скольжения суставных поверхностей. Мгновенная ось зависит от положения. Здесь поперечное вращение сочетается с условным смещением для разделения схематичного плато и мыщелков. Показанная ось — ориентир; физиологическая контактная механика не воспроизводится.',
    ),
  },
  {
    title: text('Open-chain movement', 'Открытая кинематическая цепь'),
    body: text(
      'The femur stays fixed while the tibia and fibula move. This is an unloaded open-chain demonstration. Weight-bearing closed-chain movement, axial rotation, screw-home mechanics, meniscal deformation, and joint forces are not simulated.',
      'Бедренная кость остаётся неподвижной, большеберцовая и малоберцовая движутся. Это демонстрация без нагрузки в открытой цепи. Опорные движения в закрытой цепи, осевая ротация, механизм замыкания, деформация менисков и суставные силы не моделируются.',
    ),
  },
  {
    title: text('Range needs context', 'Амплитуда зависит от контекста'),
    body: text(
      'The 0–135° workspace is an illustrative teaching interval, not a verified normal range or treatment target. Clinical measurements vary with active versus passive testing, position, age, symptoms, and the measurement method. Textbook values require edition-specific verification.',
      'Диапазон 0–135° — условный учебный интервал, а не подтверждённая норма или лечебная цель. Измерения зависят от активного или пассивного тестирования, положения, возраста, симптомов и метода. Значения из учебников требуют проверки по конкретному изданию.',
    ),
  },
];

export const rehabPhases = [
  {
    id: 'protect',
    title: text('Protection & assessment', 'Защита и оценка'),
    subtitle: text('Procedure-specific precautions', 'Ограничения для конкретной операции'),
    body: text(
      'Identify the procedure, repaired tissues, surgeon instructions, wound status, symptoms, and permitted weight bearing before selecting a movement. No generic angle limit is safe to prescribe across different operations.',
      'До выбора движения уточняют операцию, восстановленные ткани, указания хирурга, состояние раны, симптомы и разрешённую нагрузку. Универсальный предел угла нельзя назначать для разных операций.',
    ),
    focus: text(
      'Confirm the individualized plan before progressing.',
      'Перед прогрессией уточните индивидуальный план.',
    ),
  },
  {
    id: 'mobility',
    title: text('Mobility & control', 'Подвижность и контроль'),
    subtitle: text('Clinician-guided movement', 'Движения под руководством специалиста'),
    body: text(
      'Movement education may address comfortable, permitted range and quadriceps control. The appropriate exercise, assistance, dosage, and progression depend on the operation and clinical assessment. The animation illustrates a movement only.',
      'Обучение может включать комфортные движения в разрешённой амплитуде и контроль четырёхглавой мышцы. Упражнение, помощь, дозировка и прогрессия зависят от операции и оценки. Анимация показывает только движение.',
    ),
    focus: text(
      'Observe motion; do not infer exercise dosage from playback.',
      'Наблюдайте движение; скорость анимации не задаёт дозировку.',
    ),
  },
  {
    id: 'function',
    title: text('Functional progression', 'Функциональная прогрессия'),
    subtitle: text('Assessment-based progression', 'Прогрессия на основе оценки'),
    body: text(
      'Later education can address gait, strength, balance, and task demands when allowed by the individual plan. This unloaded model cannot demonstrate weight-bearing tolerance or clearance to return to activity.',
      'На поздних этапах обучение может касаться ходьбы, силы, равновесия и требований задач, если это разрешено индивидуальным планом. Модель без нагрузки не определяет переносимость опоры или допуск к активности.',
    ),
    focus: text(
      'Progress by clinical criteria, not a universal timeline.',
      'Прогрессия по клиническим критериям, а не универсальному сроку.',
    ),
  },
];
