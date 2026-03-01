import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidad.html',
  styleUrl: './privacidad.scss'
})
export class Privacidad {
  ultimaActualizacion = '1 de enero de 2026';

  secciones = [
    {
      icono: '📥',
      titulo: '¿Qué información recopilamos?',
      contenido: `Recopilamos información que usted nos proporciona directamente al crear una cuenta o usar nuestros servicios: nombre completo, dirección de correo electrónico, número de teléfono, información de la empresa y datos de facturación. También recopilamos automáticamente datos de uso como dirección IP, tipo de navegador, páginas visitadas y tiempo de sesión.`
    },
    {
      icono: '🎯',
      titulo: '¿Cómo usamos su información?',
      contenido: `Utilizamos la información recopilada para: (a) proporcionar, mantener y mejorar nuestros servicios; (b) procesar transacciones y enviar notificaciones relacionadas; (c) enviar información técnica y de soporte; (d) responder a comentarios y preguntas; (e) mejorar la experiencia del usuario en la plataforma; (f) cumplir con obligaciones legales.`
    },
    {
      icono: '🔒',
      titulo: 'Seguridad de la información',
      contenido: `Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información contra acceso no autorizado, pérdida, alteración o divulgación. Utilizamos cifrado SSL para transmisiones de datos, almacenamiento seguro con acceso restringido y auditorías de seguridad periódicas. Sin embargo, ningún método de transmisión por Internet es 100% seguro.`
    },
    {
      icono: '🤝',
      titulo: 'Compartición de información',
      contenido: `No vendemos, alquilamos ni compartimos su información personal con terceros con fines comerciales. Podemos compartir información con: (a) proveedores de servicios que nos asisten en las operaciones bajo acuerdos de confidencialidad; (b) autoridades legales cuando sea requerido por ley; (c) en caso de fusión o adquisición, con el correspondiente aviso previo.`
    },
    {
      icono: '🍪',
      titulo: 'Cookies y tecnologías similares',
      contenido: `Utilizamos cookies y tecnologías similares para mejorar su experiencia, recordar sus preferencias y analizar el uso de la plataforma. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades. Usamos cookies de sesión (temporales) y cookies persistentes para distintos propósitos.`
    },
    {
      icono: '⚖️',
      titulo: 'Sus derechos',
      contenido: `Usted tiene derecho a: (a) acceder a la información personal que tenemos sobre usted; (b) corregir datos inexactos o incompletos; (c) solicitar la eliminación de sus datos en los casos previstos por la ley; (d) oponerse al procesamiento de sus datos para ciertos propósitos; (e) solicitar la portabilidad de sus datos. Para ejercer estos derechos, contáctenos en contacto@tuempresa.com.`
    },
    {
      icono: '🌍',
      titulo: 'Transferencia internacional de datos',
      contenido: `Su información puede ser transferida y procesada en servidores ubicados fuera de su país de residencia. En tales casos, nos aseguramos de que existan salvaguardas adecuadas de acuerdo con las leyes de protección de datos aplicables, incluyendo cláusulas contractuales estándar aprobadas por las autoridades competentes.`
    },
    {
      icono: '👶',
      titulo: 'Menores de edad',
      contenido: `Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos conscientemente información personal de menores. Si descubrimos que hemos recopilado información de un menor sin el consentimiento parental verificable, tomaremos medidas para eliminar esa información de inmediato.`
    },
    {
      icono: '📬',
      titulo: 'Contacto y consultas',
      contenido: `Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos en: contacto@tuempresa.com. Designaremos un responsable de privacidad que atenderá su solicitud en un plazo máximo de 15 días hábiles.`
    }
  ];
}
