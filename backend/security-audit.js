#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        🔒 AUDITORÍA DE SEGURIDAD - BACKEND                  ║
 * ║        Análisis automático de vulnerabilidades               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Ejecutar: cd backend && node security-audit.js
 *
 * Este script analiza el código fuente del backend buscando
 * vulnerabilidades basadas en OWASP Top 10 e imprime un
 * reporte detallado en la consola.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Colores para consola ────────────────────────────────────
const c = {
  red:     (t) => `\x1b[31m${t}\x1b[0m`,
  green:   (t) => `\x1b[32m${t}\x1b[0m`,
  yellow:  (t) => `\x1b[33m${t}\x1b[0m`,
  cyan:    (t) => `\x1b[36m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
  bold:    (t) => `\x1b[1m${t}\x1b[0m`,
  dim:     (t) => `\x1b[2m${t}\x1b[0m`,
  bgRed:   (t) => `\x1b[41m\x1b[37m${t}\x1b[0m`,
  bgYellow:(t) => `\x1b[43m\x1b[30m${t}\x1b[0m`,
  bgGreen: (t) => `\x1b[42m\x1b[30m${t}\x1b[0m`,
};

// ─── Contadores ──────────────────────────────────────────────
const stats = { critico: 0, alto: 0, medio: 0, bajo: 0, info: 0, ok: 0 };

function severity(level, msg) {
  const icons = {
    CRITICO: c.bgRed(' CRÍTICO '),
    ALTO:    c.red('  🔴 ALTO    '),
    MEDIO:   c.yellow('  🟡 MEDIO   '),
    BAJO:    c.cyan('  🔵 BAJO    '),
    INFO:    c.dim('  ℹ️  INFO    '),
    OK:      c.green('  ✅ OK      '),
  };
  const key = level.toLowerCase().replace('í', 'i');
  stats[key] = (stats[key] || 0) + 1;
  console.log(`${icons[level]} ${msg}`);
}

function header(title) {
  console.log('\n' + c.bold('═'.repeat(64)));
  console.log(c.bold(`  ${title}`));
  console.log(c.bold('═'.repeat(64)));
}

function subheader(title) {
  console.log(`\n  ${c.magenta('──')} ${c.bold(title)} ${c.magenta('─'.repeat(Math.max(0, 50 - title.length)))}`);
}

// ─── Utilidades de lectura ───────────────────────────────────
const SRC = path.join(__dirname, 'src');

function readFile(relativePath) {
  const full = path.join(__dirname, relativePath);
  try {
    return fs.readFileSync(full, 'utf-8');
  } catch {
    return null;
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(__dirname, relativePath));
}

function findInFile(content, pattern)  {
  if (!content) return [];
  const lines = content.split('\n');
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      results.push({ line: i + 1, text: lines[i].trim() });
    }
  }
  return results;
}

// ─── Recolectar todos los archivos .js recursivamente ────────
function collectJsFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files = files.concat(collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                      TESTS DE SEGURIDAD                      ║
// ╚══════════════════════════════════════════════════════════════╝

function testCORS() {
  header('1. CORS - Cross-Origin Resource Sharing');
  const server = readFile('src/server.js');
  if (!server) { severity('INFO', 'No se pudo leer server.js'); return; }

  // Verificar si CORS acepta todos los orígenes
  if (server.includes('callback(null, true)') && server.includes('// En desarrollo, permitir todos')) {
    severity('CRITICO',
      'CORS acepta TODOS los orígenes sin restricción.\n' +
      '             📁 src/server.js\n' +
      '             🔓 Cualquier sitio web puede hacer peticiones a tu API.\n' +
      '             💣 Un atacante puede crear una página maliciosa que robe datos de\n' +
      '                usuarios autenticados al hacer peticiones desde su dominio.\n' +
      '             🛠️  FIX: Eliminar el segundo callback(null, true) y rechazar orígenes\n' +
      '                no permitidos con callback(new Error("CORS no permitido")).'
    );
  } else if (server.includes("origin: '*'") || server.includes('origin: true')) {
    severity('ALTO', 'CORS con wildcard — cualquier origen puede acceder.');
  } else {
    severity('OK', 'CORS configurado con lista de orígenes.');
  }

  // Verificar credentials con wildcard
  if (server.includes('credentials: true')) {
    const corsOpen = server.includes('callback(null, true)');
    if (corsOpen) {
      severity('ALTO',
        'credentials: true + orígenes abiertos = cookies/tokens enviados a cualquier sitio.\n' +
        '             💣 Permite ataques de tipo CSRF cross-origin.'
      );
    }
  }
}

function testAuthentication() {
  header('2. AUTENTICACIÓN Y CONTROL DE ACCESO');
  
  // --- JWT ---
  subheader('JWT (JSON Web Tokens)');
  const auth = readFile('src/controllers/auth.controller.js');
  const middleware = readFile('src/middleware/auth.middleware.js');

  if (auth) {
    // JWT_SECRET hardcodeado o débil
    if (auth.includes("JWT_SECRET") && auth.includes("process.env")) {
      severity('OK', 'JWT_SECRET se lee de variables de entorno.');
    }
    
    // Verificar expiración
    const expiresMatch = auth.match(/expiresIn.*?['"](\d+\w)['"]/);
    if (expiresMatch) {
      const exp = expiresMatch[1];
      if (exp === '7d' || exp === '30d' || parseInt(exp) > 24) {
        severity('MEDIO',
          `Token JWT expira en ${exp} — demasiado tiempo.\n` +
          '             💣 Si roban un token, tienen acceso prolongado.\n' +
          '             🛠️  FIX: Usar expiración corta (1-4h) + refresh tokens.'
        );
      }
    }

    // Información sensible en logs
    if (auth.includes("console.log('🔐 Intento de login'") || auth.includes("console.log('🔑 Contraseña válida")) {
      severity('ALTO',
        'Los intentos de login se logean con detalles sensibles.\n' +
        '             📁 src/controllers/auth.controller.js\n' +
        '             💣 Logs pueden exponer emails y resultados de validación de\n' +
        '                contraseñas. En producción esto ayuda a un atacante.\n' +
        '             🛠️  FIX: Eliminar logs de depuración en producción.'
      );
    }

    // Registro crea admins por defecto
    if (auth.includes("role: 'admin'")) {
      severity('CRITICO',
        'La función register() crea usuarios con role: "admin" por defecto.\n' +
        '             📁 src/controllers/auth.controller.js\n' +
        '             🔓 Aunque la ruta no está expuesta ahora, si alguien la habilita\n' +
        '                por error, cualquier persona se registra como ADMINISTRADOR.\n' +
        '             🛠️  FIX: Cambiar role por defecto a "user" o "customer".\n' +
        '                Solo promover a admin manualmente desde la base de datos.'
      );
    }
  }

  if (middleware) {
    if (!middleware.includes('jwt.verify')) {
      severity('CRITICO', 'No se verifica JWT en el middleware.');
    } else {
      severity('OK', 'JWT se verifica con jwt.verify().');
    }
  }

  // --- Rutas sin autenticación ---
  subheader('Rutas sin autenticación (endpoints públicos)');
  
  const routeFiles = [
    'src/routes/order.routes.js',
    'src/routes/mesa.routes.js',
    'src/routes/auth.routes.js',
    'src/routes/product.routes.js',
    'src/routes/chat.routes.js',
    'src/routes/payment.routes.js',
    'src/routes/wompi.routes.js',
    'src/routes/category.routes.js',
    'src/routes/notification.routes.js',
    'src/routes/expense.routes.js',
    'src/routes/inventory.routes.js',
  ];

  for (const rf of routeFiles) {
    const content = readFile(rf);
    if (!content) continue;
    const lines = content.split('\n');
    const hasAuth = content.includes('authenticateToken');
    
    // Buscar rutas definidas ANTES del middleware de auth
    const authLine = lines.findIndex(l => l.includes('router.use(authenticateToken)'));
    const publicRoutes = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const routeMatch = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/);
      if (routeMatch) {
        const isBeforeAuth = authLine === -1 || i < authLine;
        const hasInlineAuth = line.includes('authenticateToken');
        if (isBeforeAuth && !hasInlineAuth) {
          publicRoutes.push({ method: routeMatch[1].toUpperCase(), path: routeMatch[2], line: i + 1 });
        }
      }
    }

    if (publicRoutes.length > 0 && rf !== 'src/routes/auth.routes.js') {
      const routeList = publicRoutes.map(r => `${r.method} ${r.path} (línea ${r.line})`).join(', ');
      const sev = rf.includes('order') || rf.includes('payment') || rf.includes('wompi') ? 'ALTO' : 'MEDIO';
      severity(sev,
        `${rf} — Rutas públicas sin autenticación: ${routeList}\n` +
        '             🔓 Cualquiera puede acceder sin token.'
      );
    }
  }
}

function testInjection() {
  header('3. INYECCIÓN (SQL, XSS, Command Injection)');
  
  const allFiles = collectJsFiles(SRC);
  let sqlConcatFound = false;
  let xssRiskFound = false;

  subheader('SQL Injection');
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(__dirname, file);
    
    // Buscar concatenación de strings en queries SQL
    const sqlConcat = findInFile(content, /query\s*\(\s*[`'"].*\$\{/);
    const sqlConcat2 = findInFile(content, /query\s*\(\s*['"].*\+\s*(req\.|params|body)/);
    
    if (sqlConcat.length > 0 || sqlConcat2.length > 0) {
      sqlConcatFound = true;
      const all = [...sqlConcat, ...sqlConcat2];
      for (const match of all) {
        severity('CRITICO',
          `Posible SQL Injection en ${rel}:${match.line}\n` +
          `             Código: ${match.text.substring(0, 80)}...\n` +
          '             💣 Un atacante puede manipular queries para leer/borrar toda la BD.\n' +
          '             🛠️  FIX: Usar SIEMPRE placeholders: query("SELECT * FROM t WHERE id = ?", [id])'
        );
      }
    }

    // Verificar uso de parameterized queries (positivo)
    const parameterized = findInFile(content, /query\s*\(\s*['"`].*\?\s*.*['"`]\s*,\s*\[/);
    if (parameterized.length > 0) {
      severity('OK', `${rel} — Usa queries parametrizadas (${parameterized.length} encontradas). ✓`);
    }
  }
  if (!sqlConcatFound) {
    severity('OK', 'No se detectó concatenación directa en queries SQL.');
  }

  subheader('XSS (Cross-Site Scripting)');
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(__dirname, file);

    // Buscar si se devuelve input del usuario sin sanitizar
    const xss = findInFile(content, /res\.(json|send)\(.*req\.(body|query|params)/);
    if (xss.length > 0) {
      xssRiskFound = true;
      for (const match of xss) {
        severity('MEDIO',
          `Posible reflejo de input sin sanitizar en ${rel}:${match.line}\n` +
          `             Código: ${match.text.substring(0, 80)}\n` +
          '             💣 Input del usuario reflejado podría contener scripts maliciosos.'
        );
      }
    }
  }

  // Verificar si hay sanitización de HTML
  let hasSanitizer = false;
  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasSanitizer = 'sanitize-html' in allDeps || 'dompurify' in allDeps || 'xss' in allDeps || 'express-validator' in allDeps;
  } catch {}

  if (!hasSanitizer) {
    severity('ALTO',
      'No hay librería de sanitización de input instalada.\n' +
      '             📁 package.json\n' +
      '             💣 Sin sanitización, datos maliciosos pueden almacenarse en la BD.\n' +
      '             🛠️  FIX: Instalar express-validator o sanitize-html.\n' +
      '                npm install express-validator'
    );
  }
}

function testInputValidation() {
  header('4. VALIDACIÓN DE ENTRADA');

  // Verificar express-validator o joi
  let hasValidator = false;
  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasValidator = 'express-validator' in allDeps || 'joi' in allDeps || 'zod' in allDeps || 'yup' in allDeps;
  } catch {}

  if (!hasValidator) {
    severity('ALTO',
      'No hay librería de validación de datos (express-validator, joi, zod).\n' +
      '             💣 Toda la validación es manual — fácil olvidar casos.\n' +
      '             🛠️  FIX: npm install express-validator'
    );
  }

  // Chat sin límite de longitud
  const chat = readFile('src/controllers/chat.controller.js');
  if (chat && !chat.includes('.length') && !chat.includes('maxLength')) {
    severity('ALTO',
      'Chat no tiene límite de longitud de mensaje.\n' +
      '             📁 src/controllers/chat.controller.js\n' +
      '             💣 Un atacante puede enviar mensajes enormes (megabytes) para:\n' +
      '                - Consumir memoria del servidor (DoS)\n' +
      '                - Generar costos altos en la API de IA\n' +
      '             🛠️  FIX: Agregar: if (message.length > 500) return res.status(400)...'
    );
  }

  // Mesa controller sin límite
  const mesa = readFile('src/controllers/mesa.controller.js');
  if (mesa && !mesa.includes('message.length') && !mesa.includes('mensajeLimpio.length')) {
    severity('ALTO',
      'Mesero digital no tiene límite de longitud de mensaje.\n' +
      '             📁 src/controllers/mesa.controller.js\n' +
      '             💣 Mismo riesgo: DoS + costos de API de IA descontrolados.\n' +
      '             🛠️  FIX: Limitar mensajes a 500 caracteres.'
    );
  }

  // Order items sin validación
  const order = readFile('src/controllers/order.controller.js');
  if (order) {
    if (!order.includes('items.length >') && !order.includes('items.length<')) {
      severity('MEDIO',
        'No hay límite en la cantidad de items por orden.\n' +
        '             📁 src/controllers/order.controller.js\n' +
        '             💣 Un atacante puede crear órdenes con miles de items.'
      );
    }
    // Verificar sanitización del phoneNumber
    if (order.includes('phoneNumber') && !order.match(/phoneNumber.*match|test.*phoneNumber|validate.*phone/)) {
      severity('MEDIO',
        'phoneNumber no se valida con regex/formato.\n' +
        '             📁 src/controllers/order.controller.js\n' +
        '             💣 Se puede guardar cualquier string como teléfono.\n' +
        '             🛠️  FIX: Validar formato: /^\\+?[\\d\\s-]{7,15}$/'
      );
    }
  }
}

function testRateLimiting() {
  header('5. PROTECCIÓN CONTRA FUERZA BRUTA / DoS');

  let hasRateLimit = false;
  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasRateLimit = 'express-rate-limit' in allDeps || 'rate-limiter-flexible' in allDeps;
  } catch {}

  if (!hasRateLimit) {
    severity('CRITICO',
      'No hay rate limiting en el servidor.\n' +
      '             📁 package.json — falta express-rate-limit\n' +
      '             💣 IMPACTO:\n' +
      '                - Login: Un atacante puede probar miles de contraseñas/segundo\n' +
      '                - Órdenes: Pueden crear miles de órdenes falsas\n' +
      '                - Chat IA: Pueden generar costos enormes en la API de IA\n' +
      '                - DoS: Pueden saturar el servidor con peticiones masivas\n' +
      '             🛠️  FIX:\n' +
      '                npm install express-rate-limit\n' +
      '                const rateLimit = require("express-rate-limit");\n' +
      '                app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 5 }));\n' +
      '                app.use("/api/", rateLimit({ windowMs: 15*60*1000, max: 100 }));'
    );
  } else {
    // Verificar que realmente se usa
    const server = readFile('src/server.js');
    if (server && !server.includes('rateLimit') && !server.includes('rate-limit')) {
      severity('ALTO', 'express-rate-limit instalado pero no usado en server.js.');
    } else {
      severity('OK', 'Rate limiting configurado.');
    }
  }

  // Verificar body parser limit
  const server = readFile('src/server.js');
  if (server) {
    const limitMatch = server.match(/express\.json\(\s*\{\s*limit:\s*['"](\d+\w+)['"]/);
    if (limitMatch) {
      const limit = limitMatch[1];
      if (limit === '10mb' || limit === '50mb' || limit === '100mb') {
        severity('MEDIO',
          `Body parser acepta hasta ${limit} por request.\n` +
          '             📁 src/server.js\n' +
          '             💣 Permite enviar payloads grandes para consumir memoria.\n' +
          '             🛠️  FIX: Reducir a 1mb para JSON, excepto endpoints que necesiten más.'
        );
      }
    }
  }
}

function testPaymentSecurity() {
  header('6. SEGURIDAD EN PAGOS');

  const payment = readFile('src/controllers/payment.controller.js');
  const wompi = readFile('src/controllers/wompi.controller.js');

  if (payment) {
    subheader('Stripe');
    
    // Verificar webhook signature
    if (payment.includes('STRIPE_WEBHOOK_SECRET')) {
      if (payment.match(/if\s*\(!.*STRIPE_WEBHOOK_SECRET/) || payment.includes('signature verification')) {
        severity('OK', 'Stripe webhook verifica firma.');
      }
    }

    // Verificar que amount no pueda ser manipulado
    if (!payment.includes('OrderModel') || !payment.match(/verif.*total|total.*verif|validate.*amount/i)) {
      severity('ALTO',
        'El monto del pago (amount) viene del frontend sin verificación.\n' +
        '             📁 src/controllers/payment.controller.js\n' +
        '             💣 Un atacante puede modificar el monto para pagar $1 por un pedido de $100.\n' +
        '             🛠️  FIX: Calcular el total en el backend a partir de los productos\n' +
        '                y usarlo para crear el PaymentIntent, nunca confiar en req.body.amount.'
      );
    }

    // Verificar error handling expone info
    if (payment.includes('error.message')) {
      severity('MEDIO',
        'Errores de Stripe se devuelven al cliente.\n' +
        '             📁 src/controllers/payment.controller.js\n' +
        '             💣 Puede revelar información interna del sistema de pagos.\n' +
        '             🛠️  FIX: Devolver mensajes genéricos al usuario.'
      );
    }
  }

  if (wompi) {
    subheader('Wompi');
    
    // Verificar si la firma es opcional  
    if (wompi.includes('eventsSecret && signature?.checksum')) {
      severity('ALTO',
        'La verificación de firma del webhook de Wompi es OPCIONAL.\n' +
        '             📁 src/controllers/wompi.controller.js\n' +
        '             Si WOMPI_EVENTS_SECRET no está configurado, acepta ANY webhook.\n' +
        '             💣 Un atacante puede enviar webhooks falsos para marcar pagos como completados.\n' +
        '             🛠️  FIX: Hacer la verificación obligatoria:\n' +
        '                if (!eventsSecret) return res.status(500).json({error: "Config error"});\n' +
        '                if (expected !== signature.checksum) return res.status(401).json(...);'
      );
    }

    // Verificar transaction ID injection
    const txRoute = readFile('src/routes/wompi.routes.js');
    if (txRoute && txRoute.includes(':id') && !wompi.match(/id.*match|validate.*id|isValid.*id/)) {
      severity('MEDIO',
        'Transaction ID de Wompi no se valida antes de usarlo en API externa.\n' +
        '             📁 src/controllers/wompi.controller.js\n' +
        '             💣 Podría usarse para SSRF si el ID contiene URLs.'
      );
    }
  }
}

function testSessionSecurity() {
  header('7. SESIONES Y MEMORIA');

  const chat = readFile('src/controllers/chat.controller.js');
  const mesa = readFile('src/controllers/mesa.controller.js');

  if (chat) {
    if (chat.includes('new Map()') && chat.includes('conversationContexts')) {
      severity('ALTO',
        'Contextos de chat almacenados en memoria (Map) sin límite.\n' +
        '             📁 src/controllers/chat.controller.js\n' +
        '             💣 Un atacante puede abrir miles de conversaciones simultáneas\n' +
        '                para consumir toda la RAM del servidor → crash.\n' +
        '             🛠️  FIX: Usar Redis/BD para sesiones, o limitar a max 1000 sesiones.\n' +
        '                Agregar: if (conversationContexts.size > 1000) { limpiar las más viejas }'
      );
    }
  }

  if (mesa) {
    if (mesa.includes('new Map()') && mesa.includes('sesiones')) {
      severity('ALTO',
        'Sesiones del mesero digital en memoria sin límite.\n' +
        '             📁 src/controllers/mesa.controller.js\n' +
        '             💣 Mismo problema: agotamiento de memoria.'
      );
    }
    
    // Session ID predecible
    if (mesa.includes('Date.now()') && mesa.includes('Math.random')) {
      severity('MEDIO',
        'Session ID del mesero es predecible (Date.now + Math.random).\n' +
        '             📁 src/controllers/mesa.controller.js\n' +
        '             💣 Un atacante puede adivinar/predecir IDs de sesión y:\n' +
        '                - Ver el pedido de otra mesa\n' +
        '                - Agregar items al pedido de otra mesa\n' +
        '                - Confirmar/cancelar pedidos ajenos\n' +
        '             🛠️  FIX: Usar crypto.randomUUID() o crypto.randomBytes(32).toString("hex")'
      );
    }
  }
}

function testInformationDisclosure() {
  header('8. EXPOSICIÓN DE INFORMACIÓN SENSIBLE');

  const server = readFile('src/server.js');
  
  // Stack traces
  if (server && server.includes("process.env.NODE_ENV === 'development'") && server.includes('stack')) {
    severity('MEDIO',
      'Stack traces se exponen en modo development.\n' +
      '             📁 src/server.js\n' +
      '             ⚠️  En producción asegurarse de NODE_ENV=production.\n' +
      '             💣 Stack traces revelan rutas internas, versiones, estructura del código.'
    );
  }

  // Endpoint raíz expone estructura
  if (server && server.includes("endpoints:")) {
    severity('BAJO',
      'El endpoint raíz (/) lista todos los endpoints disponibles.\n' +
      '             📁 src/server.js\n' +
      '             💣 Facilita el reconocimiento para atacantes.\n' +
      '             🛠️  FIX: Eliminar la lista de endpoints en producción.'
    );
  }

  // Buscar console.log con datos sensibles
  const allFiles = collectJsFiles(SRC);
  const sensitiveLogPatterns = [
    /console\.(log|error).*password/i,
    /console\.(log|error).*token/i,
    /console\.(log|error).*secret/i,
    /console\.(log|error).*api.?key/i,
  ];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(__dirname, file);
    for (const pattern of sensitiveLogPatterns) {
      const matches = findInFile(content, pattern);
      for (const m of matches) {
        severity('MEDIO',
          `Posible log de dato sensible en ${rel}:${m.line}\n` +
          `             ${m.text.substring(0, 80)}`
        );
      }
    }
  }

  // Buscar credenciales hardcodeadas
  subheader('Credenciales hardcodeadas');
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(__dirname, file);
    
    const hardcoded = findInFile(content, /(password|secret|api.?key|token)\s*[:=]\s*['"][^'"]{3,}['"]/i);
    for (const m of hardcoded) {
      // Ignorar comparaciones y variables de entorno
      if (m.text.includes('process.env') || m.text.includes('req.body') || m.text.includes('error')) continue;
      severity('ALTO',
        `Posible credencial hardcodeada en ${rel}:${m.line}\n` +
        `             ${m.text.substring(0, 80)}`
      );
    }
  }

  // Scripts con credenciales por defecto
  const createAdmin = readFile('src/scripts/create-admin.js');
  if (createAdmin && (createAdmin.includes('admin123') || createAdmin.includes('admin@'))) {
    severity('ALTO',
      'Script create-admin.js tiene credenciales por defecto (admin123).\n' +
      '             📁 src/scripts/create-admin.js\n' +
      '             💣 Si se ejecuta en producción, crea un admin con contraseña débil.\n' +
      '             🛠️  FIX: Leer credenciales de variables de entorno o prompt interactivo.'
    );
  }
}

function testCSRF() {
  header('9. CSRF (Cross-Site Request Forgery)');

  let hasCsrf = false;
  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasCsrf = 'csurf' in allDeps || 'csrf-csrf' in allDeps || 'lusca' in allDeps;
  } catch {}

  if (!hasCsrf) {
    severity('ALTO',
      'No hay protección CSRF.\n' +
      '             📁 package.json — falta csurf, csrf-csrf o lusca\n' +
      '             💣 Un sitio malicioso puede ejecutar acciones en nombre de un usuario\n' +
      '                autenticado: eliminar productos, cambiar estados de órdenes, etc.\n' +
      '             🛠️  FIX: Para APIs con JWT en header Authorization esto es menos crítico,\n' +
      '                pero si usas cookies, necesitas protección CSRF.\n' +
      '                npm install csrf-csrf'
    );
  }
}

function testSecurityHeaders() {
  header('10. SECURITY HEADERS');

  let hasHelmet = false;
  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasHelmet = 'helmet' in allDeps;
  } catch {}

  if (!hasHelmet) {
    severity('ALTO',
      'No se usa helmet para headers de seguridad HTTP.\n' +
      '             📁 package.json — falta helmet\n' +
      '             💣 Faltan headers críticos:\n' +
      '                - X-Content-Type-Options: nosniff (evita MIME sniffing)\n' +
      '                - X-Frame-Options: DENY (evita clickjacking)\n' +
      '                - Strict-Transport-Security (fuerza HTTPS)\n' +
      '                - Content-Security-Policy (bloquea XSS)\n' +
      '                - X-XSS-Protection (protección XSS del navegador)\n' +
      '             🛠️  FIX:\n' +
      '                npm install helmet\n' +
      '                const helmet = require("helmet");\n' +
      '                app.use(helmet());'
    );
  } else {
    const server = readFile('src/server.js');
    if (server && !server.includes('helmet')) {
      severity('ALTO', 'helmet está instalado pero no se usa en server.js.');
    } else {
      severity('OK', 'helmet configurado.');
    }
  }
}

function testHTTPS() {
  header('11. HTTPS / TRANSPORTE SEGURO');

  const server = readFile('src/server.js');
  if (server && !server.includes('https') && !server.includes('SSL') && !server.includes('TLS')) {
    severity('MEDIO',
      'El servidor arranca con HTTP plano (no HTTPS).\n' +
      '             📁 src/server.js\n' +
      '             💣 Todo el tráfico (tokens, datos de pago, contraseñas) viaja sin cifrar.\n' +
      '             🛠️  FIX: En producción, usar un proxy inverso (nginx/Cloudflare) con SSL.\n' +
      '                O configurar HTTPS directamente con certificados.'
    );
  }
}

function testRaceConditions() {
  header('12. CONDICIONES DE CARRERA (Race Conditions)');

  const order = readFile('src/controllers/order.controller.js');
  if (order) {
    // Stock verification then update
    if (order.includes('stock_count < item.quantity') && order.includes("status === 'completed'")) {
      severity('ALTO',
        'Condición de carrera en el manejo de stock.\n' +
        '             📁 src/controllers/order.controller.js\n' +
        '             💣 Flujo vulnerable:\n' +
        '                1. Usuario A verifica stock: 1 unidad → OK\n' +
        '                2. Usuario B verifica stock: 1 unidad → OK\n' +
        '                3. Ambos crean orden → stock queda en -1\n' +
        '             🛠️  FIX: Usar transacciones con SELECT ... FOR UPDATE\n' +
        '                UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?'
      );
    }
  }
}

function testDependencies() {
  header('13. DEPENDENCIAS Y VERSIONES');

  try {
    const pkg = JSON.parse(readFile('package.json') || '{}');
    const deps = pkg.dependencies || {};
    
    // Verificar versiones con caret (^) — pueden traer cambios inesperados
    const caretDeps = Object.entries(deps).filter(([, v]) => v.startsWith('^'));
    if (caretDeps.length > 0) {
      severity('BAJO',
        `${caretDeps.length} dependencias usan ^ (versiones flexibles).\n` +
        '             💣 Pueden recibir actualizaciones menores con bugs o vulnerabilidades.\n' +
        '             🛠️  FIX: Usar package-lock.json (npm ci) y auditar regularmente.'
      );
    }

    // Verificar npm audit
    subheader('npm audit');
    try {
      const auditResult = execSync('npm audit --json 2>&1', {
        cwd: __dirname,
        encoding: 'utf-8',
        timeout: 30000,
      });
      const audit = JSON.parse(auditResult);
      const vulns = audit.metadata?.vulnerabilities || {};
      const total = (vulns.critical || 0) + (vulns.high || 0) + (vulns.moderate || 0) + (vulns.low || 0);
      
      if (vulns.critical > 0) {
        severity('CRITICO', `npm audit: ${vulns.critical} vulnerabilidad(es) CRÍTICAS en dependencias.`);
      }
      if (vulns.high > 0) {
        severity('ALTO', `npm audit: ${vulns.high} vulnerabilidad(es) ALTAS en dependencias.`);
      }
      if (vulns.moderate > 0) {
        severity('MEDIO', `npm audit: ${vulns.moderate} vulnerabilidad(es) MODERADAS en dependencias.`);
      }
      if (total === 0) {
        severity('OK', 'npm audit: No se encontraron vulnerabilidades conocidas.');
      }
    } catch (auditErr) {
      // npm audit puede fallar con exit code != 0 si hay vulnerabilidades
      try {
        const auditData = JSON.parse(auditErr.stdout || '{}');
        const vulns = auditData.metadata?.vulnerabilities || {};
        if (vulns.critical > 0) severity('CRITICO', `npm audit: ${vulns.critical} vulnerabilidad(es) CRÍTICAS`);
        if (vulns.high > 0) severity('ALTO', `npm audit: ${vulns.high} vulnerabilidad(es) ALTAS`);
        if (vulns.moderate > 0) severity('MEDIO', `npm audit: ${vulns.moderate} vulnerabilidad(es) MODERADAS`);
        if (vulns.low > 0) severity('BAJO', `npm audit: ${vulns.low} vulnerabilidad(es) BAJAS`);
      } catch {
        severity('INFO', 'No se pudo ejecutar npm audit. Ejecutar manualmente: npm audit');
      }
    }
  } catch (e) {
    severity('INFO', 'No se pudo leer package.json para analizar dependencias.');
  }
}

function testEnvSecurity() {
  header('14. VARIABLES DE ENTORNO');

  const envExists = fileExists('.env');
  const gitignore = readFile('.gitignore');

  if (envExists) {
    severity('OK', 'Archivo .env encontrado.');
    
    const env = readFile('.env');
    if (env) {
      // Verificar variables críticas
      const required = ['JWT_SECRET', 'DB_PASSWORD', 'STRIPE_SECRET_KEY'];
      for (const v of required) {
        if (env.includes(`${v}=`) && env.match(new RegExp(`${v}=(demo|test|123|password|secret|admin|changeme)`, 'i'))) {
          severity('CRITICO',
            `${v} tiene un valor débil/por defecto.\n` +
            '             💣 Valores como "secret", "123", "password" son triviales de adivinar.'
          );
        }
      }

      // JWT_SECRET muy corto
      const jwtMatch = env.match(/JWT_SECRET=(.+)/);
      if (jwtMatch && jwtMatch[1].trim().length < 32) {
        severity('ALTO',
          'JWT_SECRET es muy corto (< 32 caracteres).\n' +
          '             💣 Secret corto permite ataques de fuerza bruta al JWT.\n' +
          '             🛠️  FIX: Generar con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
        );
      }
    }
  } else {
    severity('INFO', 'No se encontró archivo .env (puede usar variables del sistema).');
  }

  if (gitignore && gitignore.includes('.env')) {
    severity('OK', '.env está en .gitignore.');
  } else if (gitignore) {
    severity('CRITICO',
      '.env NO está en .gitignore.\n' +
      '             💣 Las credenciales se subirían a Git/GitHub si haces commit.\n' +
      '             🛠️  FIX: Agregar .env a .gitignore AHORA.'
    );
  }
}

function testSSRF() {
  header('15. SSRF (Server-Side Request Forgery)');

  const allFiles = collectJsFiles(SRC);
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(__dirname, file);

    // Buscar llamadas HTTP con URLs construidas desde input del usuario
    const ssrf = findInFile(content, /axios\.(get|post|put|delete)\s*\(\s*`[^`]*\$\{.*req/);
    const ssrf2 = findInFile(content, /axios\.(get|post|put|delete)\s*\(\s*.*\+\s*req\./);
    const ssrf3 = findInFile(content, /fetch\s*\(\s*`[^`]*\$\{.*req/);

    const all = [...ssrf, ...ssrf2, ...ssrf3];
    for (const m of all) {
      severity('ALTO',
        `Posible SSRF en ${rel}:${m.line}\n` +
        `             ${m.text.substring(0, 80)}\n` +
        '             💣 URL construida con input del usuario → acceso a servicios internos.'
      );
    }
  }

  // Wompi transaction lookup
  const wompi = readFile('src/controllers/wompi.controller.js');
  if (wompi && wompi.includes('transactions/${id}') && wompi.includes('req.params')) {
    severity('MEDIO',
      'Wompi getTransaction usa ID de req.params en URL de API externa.\n' +
      '             📁 src/controllers/wompi.controller.js\n' +
      '             💣 Sin validación, podría manipularse para consultar endpoints internos.\n' +
      '             🛠️  FIX: Validar que id sea alfanumérico: if (!/^[a-zA-Z0-9_-]+$/.test(id)) ...'
    );
  }
}

function testMiscellaneous() {
  header('16. OTROS HALLAZGOS');

  // Archivos duplicados (posible confusión)
  const chatRoutes = readFile('src/routes/chat.routes.js');
  const chatRutas = readFile('src/routes/chat.rutas.js');
  if (chatRoutes && chatRutas) {
    severity('BAJO',
      'Existen DOS archivos de rutas para chat: chat.routes.js y chat.rutas.js\n' +
      '             💣 Puede causar confusión sobre cuál es el archivo activo.\n' +
      '             🛠️  FIX: Eliminar el archivo que no se use.'
    );
  }

  const chatCtrl = readFile('src/controllers/chat.controller.js');
  const chatCtrl2 = readFile('src/controllers/chat.controlador.js');
  if (chatCtrl && chatCtrl2) {
    severity('BAJO',
      'Existen DOS controladores de chat: chat.controller.js y chat.controlador.js\n' +
      '             💣 Código duplicado no mantenido puede tener vulnerabilidades parcheadas en uno pero no en otro.'
    );
  }

  // Error handling que expone detalles
  const allFiles = collectJsFiles(SRC);
  let errorExposures = 0;
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = findInFile(content, /res\.\s*status\(\s*500\s*\).*error\.(message|stack)/);
    errorExposures += matches.length;
  }
  if (errorExposures > 0) {
    severity('MEDIO',
      `${errorExposures} respuestas HTTP 500 exponen error.message al cliente.\n` +
      '             💣 Mensajes internos revelan tecnología, rutas, queries.\n' +
      '             🛠️  FIX: En producción devolver solo: { error: "Error interno" }'
    );
  }

  // Verificar si hay tests de seguridad
  const pkg = JSON.parse(readFile('package.json') || '{}');
  if (pkg.scripts?.test?.includes('echo')) {
    severity('MEDIO',
      'No hay tests automatizados (el script test solo hace echo).\n' +
      '             💣 Sin tests es imposible verificar que las correcciones funcionen.\n' +
      '             🛠️  FIX: Implementar tests con Jest o Mocha.'
    );
  }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                      RESUMEN FINAL                           ║
// ╚══════════════════════════════════════════════════════════════╝

function printSummary() {
  console.log('\n');
  console.log(c.bold('╔════════════════════════════════════════════════════════════╗'));
  console.log(c.bold('║              📊 RESUMEN DE AUDITORÍA                       ║'));
  console.log(c.bold('╠════════════════════════════════════════════════════════════╣'));
  console.log(c.bold(`║  ${c.bgRed(' CRÍTICOS ')}  ${String(stats.critico).padStart(3)}  — Corregir INMEDIATAMENTE            ║`));
  console.log(c.bold(`║  ${c.red('🔴 ALTOS')}     ${String(stats.alto).padStart(3)}  — Corregir esta semana                ║`));
  console.log(c.bold(`║  ${c.yellow('🟡 MEDIOS')}    ${String(stats.medio).padStart(3)}  — Planificar corrección              ║`));
  console.log(c.bold(`║  ${c.cyan('🔵 BAJOS')}     ${String(stats.bajo).padStart(3)}  — Mejora recomendada                  ║`));
  console.log(c.bold(`║  ${c.dim('ℹ️  INFO')}      ${String(stats.info).padStart(3)}  — Informativo                        ║`));
  console.log(c.bold(`║  ${c.green('✅ OK')}        ${String(stats.ok).padStart(3)}  — Sin problemas                      ║`));
  console.log(c.bold('╠════════════════════════════════════════════════════════════╣'));

  const total = stats.critico + stats.alto + stats.medio + stats.bajo;
  let grade, gradeColor;
  if (stats.critico > 0) { grade = 'F'; gradeColor = c.bgRed; }
  else if (stats.alto > 3) { grade = 'D'; gradeColor = c.red; }
  else if (stats.alto > 0) { grade = 'C'; gradeColor = c.yellow; }
  else if (stats.medio > 3) { grade = 'B'; gradeColor = c.cyan; }
  else { grade = 'A'; gradeColor = c.green; }

  console.log(c.bold(`║  CALIFICACIÓN: ${gradeColor(grade)}                                       ║`));
  console.log(c.bold(`║  TOTAL HALLAZGOS: ${total}                                     ║`));
  console.log(c.bold('╚════════════════════════════════════════════════════════════╝'));

  console.log(`\n${c.bold('🛠️  TOP 5 ACCIONES PRIORITARIAS:')}`);
  console.log(c.red('  1. Instalar express-rate-limit para proteger contra fuerza bruta'));
  console.log(c.red('  2. Instalar helmet para headers de seguridad HTTP'));
  console.log(c.red('  3. Restringir CORS a orígenes específicos (no aceptar todos)'));
  console.log(c.yellow('  4. Instalar express-validator para validación de input'));
  console.log(c.yellow('  5. Verificar montos de pago en el backend, no confiar en el frontend'));
  console.log(`\n${c.dim('Auditoría generada: ' + new Date().toISOString())}\n`);
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                       EJECUTAR                               ║
// ╚══════════════════════════════════════════════════════════════╝

console.log('\n');
console.log(c.bold('╔══════════════════════════════════════════════════════════════╗'));
console.log(c.bold('║     🔒 AUDITORÍA DE SEGURIDAD — BACKEND                     ║'));
console.log(c.bold('║     Análisis estático de vulnerabilidades (OWASP Top 10)     ║'));
console.log(c.bold('╚══════════════════════════════════════════════════════════════╝'));

testCORS();
testAuthentication();
testInjection();
testInputValidation();
testRateLimiting();
testPaymentSecurity();
testSessionSecurity();
testInformationDisclosure();
testCSRF();
testSecurityHeaders();
testHTTPS();
testRaceConditions();
testDependencies();
testEnvSecurity();
testSSRF();
testMiscellaneous();
printSummary();
