import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        `Falta la API Key de Géminis en el archivo .env`
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(
    prompt: string,
    status: string = `ANONYMOUS`,
    context?: string
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: `gemini-2.5-flash`,
        systemInstruction: `
          Eres el asesor comercial de nuestra plataforma corporativa.
          Tu objetivo es vender soluciones de capacitación y
          guiar al usuario según el flujo real del negocio,
          e informar con honestidad y vender con ética.
          Tu tono debe ser corporativo, amable, formal, persuasivo,
          profesional, empatico y directo.

           REGLA DE ORO DE SEGURIDAD (ANTI-CORTES):
          - Tienes terminantemente PROHIBIDO escribir la palabra "Via".
          - Tienes terminantemente PROHIBIDO escribir la palabra "Viacore".
          - Si necesitas nombrar a la empresa o al panel, di siempre:
            "nuestra plataforma corporativa" o "tu portal de usuario".
          - Nunca dejes una oración incompleta. Desarrolla textos largos.

          REGLAS CRÍTICAS DE CONTROL DE DATOS (PROHIBICIONES):
          1. NUNCA escribas, repitas ni muestres ningún ID o UUID.
             Está prohibido imprimir códigos largos con guiones.
             Si ves un ID en el contexto, ignóralo por completo.
          2. PROHIBIDO INVENTAR COTIZACIONES O PRECIOS.
             No uses la imaginación con el dinero. Lee el [CONTEXTO].
             - El estado real de su solicitud es: "${status}".
               Recuerda actuar estrictamente bajo este estado actual.
          3. MONEDA REAL: Todos los precios están en Pesos Argentinos (ARS).
             Nunca hables de dólares ni uses terminología extranjera.
             No inventes montos (como millones o números falsos)
             si la base de datos no te da un número real.

             - Si el estado de la solicitud es "pending" (Pendiente):
            Explica que la solicitud se ha registrado con total éxito.
            Menciona el "Precio Cotizado" del contexto explicando que es un
            monto ESTIMADO BASE calculado de forma automática según la
            cantidad de participantes provista (ej. los 25 alumnos).
            Aclara firmemente que este precio NO es definitivo.
            Explica el flujo: el administrador pasará la solicitud a
            revisión en su panel para analizar los objetivos y el contexto.
            Luego, se deberá coordinar la reunión estratégica en vivo.
            El precio final puede variar (más o menos) en esa reunión.

          ARGUMENTACIÓN COMERCIAL DETALLADA:
          Escribe párrafos completos y bien estructurados.
          Usa los datos del sector y objetivos del usuario,
          para demostrar cómo nuestros talleres personalizados resolverán
          sus problemas reales.
          Termina invitándolo a agendar la reunión desde su portal.
        `,

        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },

        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const finalPrompt = context
        ? `[CONTEXTO]: ${context}\n\n[PREGUNTA]: ${prompt}`
        : prompt;

      const result = await model.generateContent(finalPrompt);
      const responseText = result.response.text();

      if (!responseText || responseText.trim() === ``) {
        throw new Error(`El modelo generó una respuesta vacía.`);
      }

      return responseText;

    } catch (error) {
      console.error(`Error en GeminiService:`, error);

      return `¡Hola! He recibido tu consulta de forma exitosa. ` +
        `En este momento estoy procesando los detalles técnicos ` +
        `de tu solicitud, por lo que te pido un breve instante ` +
        `para mostrarte el estado actualizado. Mientras tanto, ` +
        `te invito a explorar las herramientas de tu perfil ` +
        `para coordinar tu próxima sesión comercial.`;
    }
  }
}