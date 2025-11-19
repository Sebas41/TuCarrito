## Compra de vehículo

Yo como comprador

Quiero pagar la comision a traves de una pasarela de pago

Para adquirir un vehiculo

Criterios de aceptación

CdA1: Pago exitoso

DADO que el comprador ha confirmado su interés en un vehículo y está en la sección de pago.

CUANDO selecciona un método de pago, ingresa datos válidos y la transacción es aprobada por la pasarela de pago.

ENTONCES el sistema debe mostrar un mensaje de "Pago realizado con éxito".

CA2: Pago rechazado

DADO que el comprador intenta realizar el pago de la comisión.

CUANDO la pasarela de pago rechaza la transacción por fondos insuficientes o datos incorrectos.

ENTONCES el sistema debe mostrar un mensaje claro informando que el pago fue rechazado

CA3: Cancelación del pago por parte del usuario

DADO que el comprador se encuentra en la pasarela de pago externa.

CUANDO el usuario cancela la operación y regresa a la plataforma TuCarrito.com.

ENTONCES el sistema debe mantener el pago de la comisión como "Pendiente".

CA4: Verificación del monto de la comisión antes de pagar

DADO que el comprador ha seleccionado el vehículo que desea adquirir y ha procedido a la página de pago.

CUANDO el sistema le presenta la opción para iniciar el pago de la comisión.

ENTONCES la pantalla debe mostrar un resumen claro que incluya el valor del vehículo y el cálculo exacto del 5% correspondiente a la comisión.

## Enviar mensajes

Yo como usuario (comprador o vendedor)
Deseo poder enviar mensajes a otros usuarios dentro de la plataforma
Para comunicarme directamente sobre la compra o venta de un vehículo

Criterios de aceptación

CdA1: Envío exitoso de mensaje
DADO que el usuario está autenticado en la plataforma y ha abierto una conversación con otro usuario,
CUANDO escriba un mensaje y presione el botón “Enviar”,
ENTONCES el sistema debe guardar el mensaje y mostrarlo inmediatamente en la conversación.

CdA2: Validación de contenido
DADO que el usuario está redactando un mensaje,
CUANDO el campo de texto esté vacío o solo contenga espacios,
ENTONCES el sistema no permitirá enviarlo
Y mostrará un mensaje indicando que el campo no puede estar vacío.

CdA3: Confirmación visual de envío
DADO que el usuario envía un mensaje,
CUANDO el mensaje haya sido procesado correctamente,
ENTONCES el sistema debe mostrar un indicador visual (por ejemplo, un ícono o estado “enviado”)
Y mantenerlo visible en la conversación.

CdA4: Registro de mensajes enviados
DADO que el usuario ha enviado mensajes,
CUANDO vuelva a abrir la conversación,
ENTONCES el sistema debe mostrar el historial completo de los mensajes enviados y recibidos, ordenados cronológicamente.

## Notiicacion de mensajes

Yo como usuario

Deseo recibir notificaciones cuando alguien me escribe

Para no perder la comunicación

Criterios de aceptación

CdA1: Recepción de notificación

DADO que un usuario está registrado en la plataforma y recibe un nuevo mensaje en el chat,
CUANDO el remitente envía el mensaje,ENTONCES el sistema debe mostrar una notificación visible en la interfaz del receptor.

CdA2: Identificación del remitente
DADO que un usuario recibe un nuevo
mensaje,

CUANDO se genera la notificación,

ENTONCES esta debe mostrar el nombre o alias del remitente.

CdA3: Acceso directo al chat

DADO que un usuario recibe una notificación,

CUANDO hace clic en la notificación,

ENTONCES debe redirigirse automáticamente a la conversación correspondiente.

## Recibir Mensajes

Yo como usuario (comprador o vendedor)
Deseo poder recibir mensajes de otros usuarios dentro de la plataforma
Para mantener una comunicación fluida sobre la compra o venta de un vehículo

Criterios de aceptación

CdA1: Recepción inmediata de mensaje
DADO que un usuario (comprador o vendedor) envía un mensaje,
CUANDO el destinatario esté conectado,
ENTONCES el sistema debe mostrar el mensaje recibido en tiempo real en la conversación.

CdA2: Notificación de nuevo mensaje
DADO que un usuario recibe un mensaje mientras está en otra vista o no tiene la conversación abierta,
CUANDO el mensaje llegue,
ENTONCES el sistema debe mostrar una notificación visible con el nombre o alias del remitente.

CdA3: Mensajes pendientes de lectura
DADO que el usuario tiene mensajes no leídos,
CUANDO ingrese a la lista de conversaciones,
ENTONCES el sistema debe mostrar un indicador visual (por ejemplo, un contador o punto resaltado) junto al chat correspondiente.

CdA4: Acceso directo al chat desde la notificación
DADO que el usuario recibe una notificación de nuevo mensaje,
CUANDO haga clic en ella,
ENTONCES el sistema debe abrir automáticamente la conversación con el remitente.

CdA5: Persistencia del historial
DADO que un usuario ha recibido mensajes,
CUANDO cierre sesión o salga de la aplicación,
ENTONCES al volver a iniciar sesión debe poder ver el historial completo de las conversaciones anteriores.

## Busqueda y filtado de vehiculos

Yo como usuario

Deseo buscar y filtrar los vehículos disponibles en la plataforma

Para encontrar de manera rápida las opciones que se ajustan a mis necesidades

Criterios de aceptación

- CA1: Búsqueda por texto
  DADO que el usuario está en la página de vehículos
  CUANDO escriba una marca o modelo en el buscador
  ENTONCES el sistema mostrará los vehículos que coincidan

- CA2: Aplicar filtros
  DADO que el usuario visualiza el listado de vehículos
  CUANDO seleccione un filtro (ej. precio, año, combustible)
  ENTONCES el sistema mostrará solo los vehículos que cumplan con el filtro

- CA3: Validar rangos
  DADO que el usuario ingresa un rango (ej. precio mínimo y máximo)
  CUANDO el mínimo sea mayor que el máximo
  ENTONCES el sistema mostrará un error y no aplicará el filtro

- CA4: Ordenar resultados
  DADO que el usuario tiene un listado de vehículos
  CUANDO elija un criterio de orden (ej. precio ascendente)
  ENTONCES el sistema ordenará los resultados según lo elegido

## Visualizar landpage

Yo como usuario

Deseo ingresar a la landing page de la plataforma

Para conocer de qué trata el servicio, sus beneficios y cómo registrarme.

Criterios de Aceptación

CdA1: Acceso público

DADO que un visitante no tiene una sesion iniciada en la plataforma,

CUANDO accede a la URL principal,

ENTONCES debe poder visualizar la landing page.

CdA2: Información básica

DADO que un visitante abre la landing page,

CUANDO la página carga,

ENTONCES debe mostrar una breve descripción del servicio, beneficios principales y pasos básicos para registrarse.

## Validacion de antecedentes de vehiculos

Decripción:

Yo como Comprador

Deseo consultar los antecedentes de un vehículo de la plataforma

Para asegurarme de que la información del vehículo sea confiable.

Criterios de evaluacion:

CA 1: Consulta exitosa por placa

DADO que el usuario está en la sección de verificación,

CUANDO ingrese el número de placa del vehículo correctamente,

ENTONCES el sistema mostrará los antecedentes del vehículo.

CA2: Visualización completa del historial

DADO que el comprador ha consultado un vehículo con información registrada,
CUANDO el sistema muestre los resultados,
ENTONCES debe incluir datos relevantes como propiedad, reportes de accidentes, revisiones técnicas y denuncias de robo.

CA3: Manejo de datos inválidos

DADO que el comprador ingrese un número de placa o VIN incorrecto o inexistente,
CUANDO confirme la búsqueda,
ENTONCES el sistema debe mostrar un mensaje claro indicando que no se encontraron resultados.

CA4: Acceso desde la ficha del vehículo

DADO que el comprador visualiza el detalle de un vehículo en la plataforma,
CUANDO seleccione la opción "Ver antecedentes",
ENTONCES el sistema debe ejecutar la consulta automáticamente y mostrar los resultados asociados.

CA5: Tiempo de respuesta óptimo

DADO que el comprador solicita la verificación de antecedentes,
CUANDO el sistema procese la consulta,
ENTONCES la información debe mostrarse en un tiempo máximo de 5 segundos para garantizar la usabilidad.
