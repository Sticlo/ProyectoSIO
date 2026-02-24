import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminos.html',
  styleUrl: './terminos.scss'
})
export class Terminos {
  ultimaActualizacion = '1 de enero de 2026';

  secciones = [
    {
      titulo: '1. Aceptación de los Términos',
      contenido: `Al acceder y utilizar la plataforma SIO, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio. El uso continuado de la plataforma después de cualquier modificación constituye su aceptación de los nuevos términos.`
    },
    {
      titulo: '2. Descripción del Servicio',
      contenido: `SIO es una plataforma de gestión empresarial que ofrece herramientas para la administración de inventario, pedidos, finanzas y atención al cliente. El servicio se provee "tal cual" y puede ser modificado, actualizado o descontinuado en cualquier momento con previo aviso a los usuarios registrados.`
    },
    {
      titulo: '3. Registro y Cuenta de Usuario',
      contenido: `Para utilizar ciertas funcionalidades de SIO, deberá crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Notifique inmediatamente cualquier uso no autorizado.`
    },
    {
      titulo: '4. Uso Aceptable',
      contenido: `Usted se compromete a utilizar SIO únicamente para fines legales y de acuerdo con estos términos. Está prohibido: (a) usar el servicio de manera que viole cualquier ley aplicable; (b) transmitir contenido dañino, fraudulento o engañoso; (c) intentar acceder sin autorización a sistemas o datos; (d) interferir con el funcionamiento normal de la plataforma.`
    },
    {
      titulo: '5. Propiedad Intelectual',
      contenido: `Todo el contenido disponible en SIO, incluyendo pero no limitado a software, textos, gráficos, logos y diseños, es propiedad de SIO o de sus licenciantes y está protegido por las leyes de propiedad intelectual. Queda prohibida la reproducción o distribución sin autorización expresa y por escrito.`
    },
    {
      titulo: '6. Privacidad y Protección de Datos',
      contenido: `El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, la cual forma parte integral de estos Términos. Al usar SIO, consiente el procesamiento de sus datos de acuerdo con dicha política. Cumplimos con las normativas de protección de datos aplicables en su jurisdicción.`
    },
    {
      titulo: '7. Limitación de Responsabilidad',
      contenido: `En la máxima medida permitida por la ley, SIO no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de uso del servicio. Nuestra responsabilidad total ante usted no excederá el monto pagado por el servicio en los últimos tres meses.`
    },
    {
      titulo: '8. Modificaciones',
      contenido: `SIO se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios entran en vigor al ser publicados en la plataforma. Le notificaremos cambios importantes a través del correo electrónico registrado. Es su responsabilidad revisar periódicamente estos Términos.`
    },
    {
      titulo: '9. Ley Aplicable',
      contenido: `Estos Términos se regirán e interpretarán de acuerdo con las leyes vigentes. Cualquier disputa que surja en relación con estos Términos será sometida a la jurisdicción exclusiva de los tribunales competentes, renunciando las partes a cualquier otro fuero que pudiera corresponderles.`
    },
    {
      titulo: '10. Contacto',
      contenido: `Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en: contacto@tuempresa.com o a través del formulario de contacto disponible en nuestra plataforma. Responderemos su consulta en un plazo máximo de 48 horas hábiles.`
    }
  ];
}
