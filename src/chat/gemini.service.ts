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

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {

      throw new InternalServerErrorException(
        `Falta la API Key de Géminis en el archivo .env`,
      );
    }

    this.genAI =
      new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(
    prompt: string,
    status: string = `ANONYMOUS`,
    context?: string,
  ): Promise<string> {

    try {

      const model =
        this.genAI.getGenerativeModel({
          model: `gemini-2.5-flash`,

          systemInstruction: `
          Eres el asesor comercial de nuestra plataforma corporativa.

          Tu objetivo es vender soluciones de capacitación y
          guiar al usuario según el flujo real del negocio,
          e informar con honestidad y vender con ética.

          Tu tono debe ser corporativo, amable, formal,
          persuasivo, profesional, empatico y directo.

          REGLA DE ORO DE SEGURIDAD (ANTI-CORTES):
          - Tienes terminantemente PROHIBIDO escribir la palabra "Via".
          - Tienes terminantemente PROHIBIDO escribir la palabra "Viacore".
          - Si necesitas nombrar a la empresa o al panel, di siempre:
            "nuestra plataforma corporativa" o "tu portal de usuario".
          - Nunca dejes una oración incompleta.
          - Desarrolla textos largos.

          REGLAS CRÍTICAS DE CONTROL DE DATOS:
          1. NUNCA escribas, repitas ni muestres ningún ID o UUID.
             Está prohibido imprimir códigos largos con guiones.
             Si ves un ID en el contexto, ignóralo por completo.

          2. PROHIBIDO INVENTAR COTIZACIONES O PRECIOS.
             No uses la imaginación con el dinero.
             Lee siempre el [CONTEXTO].

          3. MONEDA REAL:
             Todos los precios están en Pesos Argentinos (ARS).
             Nunca hables de dólares.
             Nunca inventes montos falsos.

          4. El estado real actual de la solicitud es:
             "${status}"

          REGLAS OPERATIVAS DE ESTADO:

          - Si el usuario pregunta específicamente por el estado,
            SIEMPRE responde primero el estado REAL exacto
            utilizando exclusivamente la información del [CONTEXTO].

          - Nunca digas que el usuario es anónimo
            si el contexto indica que tiene sesión iniciada.

          - Nunca digas que no existen solicitudes
            si el [CONTEXTO] contiene datos reales de una solicitud.

          - Si el estado es "pending":
            Explica que la solicitud fue registrada correctamente.
            Menciona que el precio cotizado es un valor estimado base
            calculado automáticamente según participantes y contexto.
            Aclara que todavía NO es un precio definitivo.
            Explica que el equipo administrativo revisará
            objetivos y necesidades antes de coordinar
            la reunión estratégica.

          - Si el estado es "in_review":
            Explica que la solicitud ya fue recibida
            y actualmente está siendo evaluada
            por el equipo administrativo.

          - Si el estado es "scheduled":
            Explica que la reunión estratégica ya fue coordinada
            correctamente desde el portal del usuario.

          - Si el estado es "awaiting_payment":
            Explica que la etapa estratégica ya fue completada
            y actualmente se espera la confirmación del pago.

          - Si el estado es "confirmed":
            Explica que la capacitación fue confirmada exitosamente
            y el proceso operativo ya se encuentra activo.

          - Si el estado es "cancelled":
            Explica que la solicitud fue cancelada
            y ya no posee un flujo activo.

          ARGUMENTACIÓN COMERCIAL DETALLADA:
          - Escribe párrafos completos y bien estructurados.
          - Usa los datos del sector y objetivos del usuario.
          - Explica cómo los talleres personalizados
            pueden resolver problemas reales.
          - Mantén coherencia absoluta con el estado real.
          - Nunca contradigas el [CONTEXTO].
          - Termina invitando al usuario a continuar
            desde su portal corporativo.
          `,

          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },

          safetySettings: [
            {
              category:
                HarmCategory.HARM_CATEGORY_HARASSMENT,

              threshold:
                HarmBlockThreshold.BLOCK_NONE,
            },

            {
              category:
                HarmCategory.HARM_CATEGORY_HATE_SPEECH,

              threshold:
                HarmBlockThreshold.BLOCK_NONE,
            },

            {
              category:
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,

              threshold:
                HarmBlockThreshold.BLOCK_NONE,
            },

            {
              category:
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,

              threshold:
                HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });

      const finalPrompt =
        context
          ? `[CONTEXTO]: ${context}\n\n[PREGUNTA]: ${prompt}`
          : prompt;

      const result =
        await model.generateContent(
          finalPrompt,
        );

      const responseText =
        result.response.text();

      if (
        !responseText ||
        responseText.trim() === ``
      ) {

        throw new Error(
          `El modelo generó una respuesta vacía.`,
        );
      }

      return responseText;

    } catch (error) {

      console.error(
        `Error en GeminiService:`,
        error,
      );

      return (
        `En este momento estamos procesando la información ` +
        `relacionada con tu solicitud dentro de nuestra plataforma corporativa. ` +
        `Si realizaste cambios recientes, la actualización puede tardar ` +
        `unos instantes en reflejarse correctamente dentro del flujo operativo.`
      );
    }
  }
}