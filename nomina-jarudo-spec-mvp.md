# Nómina Jarudo — Especificación MVP

> Exportado desde **Traductor Dev** · 2/11/2026, 6:52:13 p.m.

## Resumen del proyecto

| Campo | Valor |
| --- | --- |
| Estado | draft |
| Presupuesto | $0 |
| Tipo de sistema | — |
| Plazo MVP | — |

### Objetivo

Plataforma web de auditoría, control de producción y liquidación semanal de nómina para operadores de revolvedoras de concreto mediante el procesamiento de reportes PDF de SAP. El sistema depura tiquetes cancelados y consumos internos (0.5 m³), aplica las bases de viajes de empresa (3 en semana, 2 en sábado) y calcula los viajes adicionales aplicando tarifas configurables por la administración. Dirigido a jefes de planta y personal de nómina para generar matrices semanales y reportes de liquidación exportables.

### Propuesta de solución

Desarrollo de una aplicación web ágil con interfaz intuitiva que permita a los supervisores de planta arrastrar y procesar los PDFs diarios de SAP. El sistema incluirá un motor de extracción de datos automatizado, filtros para excluir tickets cancelados y consumos internos (0.5 m³), un calculador de viajes base/pagados con tarifas configurables, y un panel semanal interactivo con reportes exportables para el pago transparente de la nómina.

## Actores del sistema (4)

### Jefe de planta

Carga los reportes PDF diarios de SAP, supervisa el procesamiento de tiquetes y valida la información de producción de su planta.

### Administrador de tarifas y reglas

Configura las tarifas de viajes adicionales, las bases semanales y los criterios de depuración aplicables a la liquidación.

### Operador de revolvedora

Es la persona cuya producción y cantidad de viajes se auditan para determinar la liquidación semanal; su participación directa en el sistema requiere validación del alcance del MVP.

### Motor de procesamiento y liquidación

Procesa los PDFs cargados, extrae los datos de SAP, depura tiquetes cancelados y consumos internos, aplica las reglas configuradas y calcula los viajes pagados y adicionales.

## Historias de usuario (30)

### Cargar reportes diarios de SAP

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder cargar uno o varios archivos PDF diarios de SAP mediante selección o arrastre** para **pueda iniciar el procesamiento de la producción de mi planta de forma ágil**.

**Criterios de aceptación:**

- Permite cargar archivos PDF válidos, muestra el nombre y la fecha de cada archivo, informa errores de formato y evita duplicar reportes ya registrados.

### Consultar estado del procesamiento

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder visualizar el estado de procesamiento de cada reporte cargado** para **pueda saber si la información fue procesada correctamente o requiere revisión**.

**Criterios de aceptación:**

- Cada archivo muestra los estados pendiente, procesando, procesado o con errores, junto con mensajes descriptivos cuando corresponda.

### Revisar tiquetes extraídos

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder consultar los tiquetes extraídos de los reportes PDF** para **pueda verificar que los datos de producción de mi planta fueron interpretados correctamente**.

**Criterios de aceptación:**

- La consulta muestra como mínimo fecha, número de tiquete, operador, vehículo, volumen, estado y archivo de origen, con opciones de búsqueda y filtrado.

### Identificar registros excluidos

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder visualizar los tiquetes excluidos por cancelación o por corresponder a consumos internos de 0.5 m³** para **pueda auditar las razones por las que determinados registros no se consideran para la liquidación**.

**Criterios de aceptación:**

- Los registros excluidos se identifican con su motivo, conservan el vínculo al tiquete original y no se incluyen en los totales liquidables.

### Validar la producción semanal

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder revisar y confirmar la matriz semanal de producción de mi planta** para **pueda asegurar que los viajes y operadores reportados están completos antes de la liquidación**.

**Criterios de aceptación:**

- La matriz agrupa la información por operador y semana, presenta viajes base y adicionales, permite revisar el detalle diario y registra la confirmación del jefe de planta.

### Detectar inconsistencias en los reportes

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder identificar registros incompletos, duplicados o inconsistentes en la producción procesada** para **pueda corregir o solicitar la revisión de la información antes del cierre de nómina**.

**Criterios de aceptación:**

- El sistema marca anomalías como campos faltantes, tiquetes duplicados, fechas fuera de la semana o datos que no coinciden entre registros, mostrando una descripción clara.

### Consultar el cálculo de viajes liquidables

- **Rol:** Jefe de planta
- **Prioridad:** Alta
- **Formato:** Como **Jefe de planta**, quiero **poder consultar cómo se calcularon los viajes base y adicionales de cada operador** para **pueda validar que la liquidación semanal se basa en la producción efectivamente registrada**.

**Criterios de aceptación:**

- El detalle muestra los viajes realizados, los viajes base aplicados según el día, los viajes adicionales, la tarifa utilizada y el total resultante, sin permitir modificar reglas administrativas.

### Exportar la matriz semanal validada

- **Rol:** Jefe de planta
- **Prioridad:** Media
- **Formato:** Como **Jefe de planta**, quiero **poder exportar la matriz semanal y el detalle de producción validado** para **pueda compartir la información con el personal encargado de nómina y conservar un respaldo de la auditoría**.

**Criterios de aceptación:**

- El sistema permite exportar la información validada en un formato utilizable, incluyendo periodo, planta, operadores, viajes, exclusiones, totales y fecha de generación.

### Consultar el historial de cargas de la planta

- **Rol:** Jefe de planta
- **Prioridad:** Media
- **Formato:** Como **Jefe de planta**, quiero **poder consultar el historial de reportes cargados y sus resultados de procesamiento** para **pueda dar seguimiento a la información enviada y evitar reprocesamientos innecesarios**.

**Criterios de aceptación:**

- El historial permite filtrar por fecha, semana, archivo y estado, e incluye quién realizó la carga, la fecha de carga y el resultado del procesamiento.

### Configurar tarifas de viajes adicionales

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Crítica
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder crear, editar y consultar las tarifas aplicables a los viajes adicionales** para **el sistema calcule correctamente los pagos variables de los operadores**.

**Criterios de aceptación:**

- Permite registrar valor, unidad de aplicación, fecha de vigencia y estado de cada tarifa; solo una tarifa vigente puede aplicarse a un mismo concepto y periodo.

### Definir bases semanales de viajes

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Alta
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder configurar la cantidad de viajes incluidos como base para días laborales y sábados** para **la liquidación distinga automáticamente los viajes base de los viajes adicionales**.

**Criterios de aceptación:**

- Permite establecer valores independientes para días laborales y sábados, validar que sean números enteros no negativos y consultar el historial de cambios.

### Configurar criterios de depuración de tiquetes

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Alta
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder administrar los criterios para excluir tiquetes cancelados y consumos internos** para **solo se consideren viajes válidos en la liquidación semanal**.

**Criterios de aceptación:**

- Permite activar o desactivar cada criterio y definir el volumen de consumo interno excluido, con validación numérica y registro de la configuración vigente.

### Establecer vigencia de tarifas y reglas

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Alta
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder definir fechas de inicio y fin para cada tarifa y regla** para **los periodos de liquidación utilicen la configuración que correspondía cuando se generaron los viajes**.

**Criterios de aceptación:**

- No permite periodos superpuestos para una misma tarifa o regla; las configuraciones históricas permanecen disponibles para consulta y no se pueden eliminar si ya fueron utilizadas.

### Previsualizar el impacto de una configuración

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder simular una liquidación con las tarifas y reglas configuradas** para **pueda validar el resultado antes de que la configuración se use en la nómina**.

**Criterios de aceptación:**

- La simulación muestra viajes base, viajes adicionales, tiquetes excluidos, tarifa aplicada y valor total; no modifica liquidaciones ni datos productivos.

### Consultar historial de cambios de configuración

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder consultar quién modificó cada tarifa o regla y cuándo lo hizo** para **exista trazabilidad sobre las decisiones que afectan la liquidación**.

**Criterios de aceptación:**

- Muestra usuario, fecha y hora, configuración anterior, configuración nueva y motivo del cambio; permite filtrar por tipo de configuración y rango de fechas.

### Validar configuraciones antes de publicarlas

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Crítica
- **Formato:** Como **Administrador de tarifas y reglas**, quiero **poder revisar y publicar una configuración válida antes de habilitarla** para **se eviten errores que alteren los cálculos de nómina**.

**Criterios de aceptación:**

- El sistema valida campos obligatorios, valores no negativos, vigencias coherentes y ausencia de conflictos; una configuración con errores no puede publicarse.

### Consultar resumen semanal de producción

- **Rol:** Operador de revolvedora
- **Prioridad:** Alta
- **Formato:** Como **Operador de revolvedora**, quiero **poder consultar el resumen semanal de mis viajes auditados, viajes base y viajes adicionales** para **pueda conocer cómo se determinó mi liquidación**.

**Criterios de aceptación:**

- El sistema muestra el periodo, total de viajes reportados, viajes excluidos, viajes base, viajes adicionales y estado de la liquidación asociados al operador autenticado.

### Revisar detalle de viajes auditados

- **Rol:** Operador de revolvedora
- **Prioridad:** Alta
- **Formato:** Como **Operador de revolvedora**, quiero **poder visualizar el detalle de los tiquetes considerados y excluidos de mi liquidación** para **pueda verificar que la información procesada corresponde a mi producción**.

**Criterios de aceptación:**

- Cada registro muestra fecha, número de tiquete, volumen, estado de inclusión o exclusión y motivo de exclusión cuando aplique.

### Procesar reportes PDF de SAP

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **recibir y procesar los archivos PDF diarios cargados por los usuarios autorizados** para **pueda convertir la información operativa en datos utilizables para la liquidación semanal**.

**Criterios de aceptación:**

- El sistema acepta archivos PDF válidos, identifica cada reporte y registra el resultado del procesamiento. Los archivos no compatibles generan un error descriptivo sin interrumpir el procesamiento de los demás archivos.

### Extraer datos de los tiquetes

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **extraer del PDF los datos relevantes de cada tiquete, incluyendo fecha, operador, vehículo, volumen, estado y número de viaje** para **pueda realizar auditorías y cálculos de nómina con información estructurada**.

**Criterios de aceptación:**

- Cada tiquete extraído conserva una referencia al archivo de origen. Los campos obligatorios faltantes o ilegibles quedan marcados como inconsistencias para revisión.

### Detectar tiquetes duplicados

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **identificar tiquetes repetidos entre los archivos procesados** para **no contabilice dos veces un mismo viaje en la liquidación**.

**Criterios de aceptación:**

- El sistema compara un identificador único del tiquete y, cuando no exista, utiliza una combinación de datos configurada para detectar duplicados. Los registros duplicados se excluyen del cálculo y quedan identificados en el resultado de auditoría.

### Excluir tiquetes cancelados

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **detectar y excluir automáticamente los tiquetes con estado cancelado** para **los viajes cancelados no sean considerados como viajes pagados**.

**Criterios de aceptación:**

- Los tiquetes cuyo estado sea cancelado se conservan para trazabilidad, pero se marcan como excluidos y no afectan los viajes base, adicionales ni el total de la liquidación.

### Excluir consumos internos

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **identificar y excluir los consumos internos de 0.5 m³** para **la nómina refleje únicamente los viajes que deben ser remunerados**.

**Criterios de aceptación:**

- Los registros clasificados como consumo interno y con volumen de 0.5 m³ se excluyen del cálculo. El sistema muestra la cantidad de registros excluidos y el motivo correspondiente.

### Aplicar viajes base por jornada

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **aplicar automáticamente la base de tres viajes entre semana y dos viajes los sábados por operador** para **pueda separar los viajes incluidos en la jornada de los viajes adicionales**.

**Criterios de aceptación:**

- El cálculo agrupa los viajes válidos por operador y fecha o jornada, aplica tres viajes de base en días entre semana y dos los sábados, y deja los excedentes como viajes adicionales.

### Calcular viajes adicionales y liquidación

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Crítica
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **calcular los viajes adicionales de cada operador usando las tarifas vigentes** para **pueda determinar el valor correspondiente de la nómina semanal**.

**Criterios de aceptación:**

- El sistema calcula los viajes adicionales como la cantidad de viajes válidos que excede la base y multiplica cada cantidad por la tarifa aplicable. La liquidación muestra viajes base, adicionales, tarifa, subtotales y total por operador.

### Consolidar la liquidación semanal

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **consolidar los resultados procesados de todos los días de una semana** para **pueda generar una liquidación única y consistente por operador**.

**Criterios de aceptación:**

- El sistema permite seleccionar una semana y genera un consolidado por operador con viajes válidos, excluidos, base aplicada, adicionales, tarifas y total a pagar. Los registros sin operador o con inconsistencias se separan del total liquidable.

### Aplicar reglas y tarifas versionadas

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **utilizar las reglas y tarifas vigentes para el período de liquidación** para **los cálculos puedan reproducirse incluso cuando las configuraciones cambien posteriormente**.

**Criterios de aceptación:**

- Cada liquidación almacena la versión o fecha de las reglas y tarifas utilizadas. Una liquidación cerrada no cambia automáticamente cuando se modifica una configuración futura.

### Validar inconsistencias de procesamiento

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **detectar datos incompletos, ambiguos o incompatibles durante la extracción y el cálculo** para **los responsables puedan corregir problemas antes de aprobar la nómina**.

**Criterios de aceptación:**

- El sistema genera un listado de inconsistencias con el tiquete afectado, tipo de error, archivo de origen y estado de atención. Los registros con errores críticos no se incluyen en el total hasta ser revisados.

### Mantener trazabilidad de los cálculos

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **registrar cada transformación aplicada a los tiquetes procesados** para **pueda explicar cómo se obtuvo el resultado de cada liquidación**.

**Criterios de aceptación:**

- Para cada registro el sistema conserva el estado original, los motivos de exclusión o inclusión, la base aplicada, la tarifa utilizada y el resultado final. La información puede consultarse junto con la liquidación semanal.

### Generar matriz y reporte exportable

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Alta
- **Formato:** Como **Motor de procesamiento y liquidación**, quiero **generar una matriz semanal y un reporte de liquidación con los resultados calculados** para **el personal de nómina pueda revisar y utilizar la información para el pago**.

**Criterios de aceptación:**

- El sistema genera un reporte con el detalle por operador y un resumen semanal, incluyendo totales y exclusiones. El resultado puede exportarse en un formato utilizable para la operación, como XLSX o CSV.

## Casos de uso (20)

### Cargar reportes diarios de SAP

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta cargar uno o varios reportes PDF diarios de SAP y consultar el estado de procesamiento de cada archivo.

**Pasos:**

1. El jefe de planta selecciona uno o varios archivos PDF o los arrastra al área de carga.
2. El sistema valida el formato y registra cada archivo asociado a la planta y fecha correspondiente.
3. El sistema inicia el procesamiento de los reportes cargados.
4. El sistema muestra el estado de cada reporte: pendiente, procesando, procesado con éxito o procesado con errores.
5. El sistema informa al jefe de planta los archivos rechazados y el motivo del rechazo.

### Consultar resultados de extracción

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta revisar los tiquetes extraídos de los reportes PDF y distinguir los registros excluidos por cancelación o consumo interno.

**Pasos:**

1. El jefe de planta selecciona un reporte procesado o un conjunto de reportes.
2. El sistema muestra los tiquetes extraídos con sus datos de producción y operador.
3. El jefe de planta filtra o consulta los registros según su estado de inclusión o exclusión.
4. El sistema identifica los tiquetes excluidos por cancelación y los correspondientes a consumos internos de 0.5 m³.
5. El sistema presenta el motivo de exclusión de cada registro y conserva el detalle del reporte de origen.

### Detectar inconsistencias de producción

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta identificar registros incompletos, duplicados o inconsistentes en la producción procesada.

**Pasos:**

1. El jefe de planta selecciona los reportes o el período semanal que desea revisar.
2. El sistema analiza los registros procesados según las reglas de integridad y consistencia.
3. El sistema identifica registros incompletos, duplicados o con datos contradictorios.
4. El sistema muestra cada inconsistencia con el registro afectado, su origen y una descripción del problema.
5. El jefe de planta revisa el listado para corregir o gestionar los registros observados antes de validar la producción.

### Consultar viajes liquidables por operador

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta consultar el cálculo de viajes base y adicionales de cada operador para la semana seleccionada.

**Pasos:**

1. El jefe de planta selecciona la planta, semana y operador que desea consultar.
2. El sistema obtiene la producción semanal válida del operador.
3. El sistema calcula los viajes base conforme a las reglas vigentes: 3 durante la semana y 2 el sábado.
4. El sistema determina los viajes adicionales y aplica las tarifas configuradas por la administración.
5. El sistema muestra el detalle de viajes considerados, excluidos, base, adicionales y el resultado liquidable.

### Validar matriz semanal de producción

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta revisar y confirmar la matriz semanal de producción de su planta.

**Pasos:**

1. El jefe de planta selecciona la semana y planta que desea validar.
2. El sistema genera y muestra la matriz semanal con los operadores, fechas, viajes y producción procesada.
3. El sistema destaca inconsistencias, registros pendientes y datos excluidos que requieran revisión.
4. El jefe de planta revisa la información y confirma la matriz semanal.
5. El sistema registra la confirmación, usuario, fecha y versión de la matriz validada.

### Exportar matriz semanal validada

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta exportar la matriz semanal confirmada y el detalle de producción validado.

**Pasos:**

1. El jefe de planta selecciona una matriz semanal previamente validada.
2. El sistema verifica que la matriz tenga estado confirmado y que no existan datos pendientes de validación.
3. El jefe de planta selecciona el formato de exportación disponible.
4. El sistema genera la matriz semanal y el detalle de producción validado.
5. El sistema entrega el archivo para descarga e identifica el período y la versión exportada.

### Consultar historial de cargas de la planta

- **Rol:** Jefe de planta
- **Prioridad:** Media

Permitir al jefe de planta consultar el historial de reportes cargados y sus resultados de procesamiento.

**Pasos:**

1. El jefe de planta accede al historial de cargas de su planta.
2. El sistema muestra los reportes cargados ordenados por fecha, período y estado.
3. El jefe de planta filtra el historial por rango de fechas, estado o usuario que realizó la carga.
4. El sistema muestra el resultado de procesamiento, cantidad de registros extraídos, excluidos y errores de cada carga.
5. El jefe de planta selecciona una carga para consultar su detalle y los reportes asociados.

### Gestionar tarifas de viajes adicionales

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador crear, consultar y modificar las tarifas aplicables a los viajes adicionales, definiendo su período de vigencia.

**Pasos:**

1. El administrador solicita consultar, crear o editar una tarifa de viajes adicionales.
2. El sistema muestra las tarifas existentes y sus estados de vigencia.
3. El administrador registra o modifica el valor, condiciones y fechas de inicio y fin de la tarifa.
4. El sistema valida que los datos sean completos, consistentes y que no existan solapamientos incompatibles de vigencia.
5. El sistema guarda la tarifa como configuración pendiente de validación o publicación.
6. El sistema registra el cambio realizado y confirma la operación.

### Configurar bases semanales de viajes

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador definir la cantidad de viajes incluidos en la base para días laborales y sábados, junto con su período de vigencia.

**Pasos:**

1. El administrador solicita consultar o modificar las bases semanales de viajes.
2. El sistema muestra las bases vigentes y futuras configuradas para días laborales y sábados.
3. El administrador indica la cantidad de viajes incluidos para cada tipo de día y las fechas de inicio y fin.
4. El sistema valida que las cantidades sean válidas y que la vigencia no genere conflictos con otras configuraciones.
5. El sistema guarda la base como configuración pendiente de validación o publicación.
6. El sistema registra el cambio y confirma la configuración.

### Configurar criterios de depuración de tiquetes

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador definir los criterios utilizados para excluir tiquetes cancelados y consumos internos durante el procesamiento de reportes.

**Pasos:**

1. El administrador solicita consultar o modificar los criterios de depuración.
2. El sistema muestra los criterios actuales para tiquetes cancelados y consumos internos.
3. El administrador define o actualiza las condiciones de exclusión y sus fechas de vigencia.
4. El sistema valida que los criterios estén completos y no sean contradictorios.
5. El sistema guarda los criterios como configuración pendiente de validación o publicación.
6. El sistema registra el cambio y confirma la operación.

### Simular impacto de configuración

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador previsualizar cómo las tarifas y reglas configuradas afectarían una liquidación antes de publicarlas.

**Pasos:**

1. El administrador selecciona las tarifas, bases y criterios de depuración que desea evaluar.
2. El administrador proporciona o selecciona un período y un conjunto de reportes de referencia.
3. El sistema procesa los datos aplicando la configuración seleccionada sin modificar la configuración vigente.
4. El sistema calcula los tiquetes depurados, viajes base, viajes adicionales y valores resultantes.
5. El sistema muestra una previsualización comparativa del impacto de la configuración.
6. El administrador revisa los resultados y decide si continúa con la validación o ajusta la configuración.

### Publicar configuración validada

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador revisar, validar y habilitar una configuración de tarifas o reglas que cumpla las condiciones de consistencia y vigencia.

**Pasos:**

1. El administrador solicita revisar una configuración pendiente de publicación.
2. El sistema muestra los valores, reglas, fechas de vigencia y resultados de las validaciones realizadas.
3. El administrador revisa la configuración y confirma su aprobación.
4. El sistema valida nuevamente la integridad, vigencia y ausencia de conflictos.
5. Si la configuración es válida, el sistema la publica y la habilita para los procesos aplicables desde la fecha definida.
6. El sistema registra la publicación y confirma el nuevo estado de la configuración.

### Consultar historial de cambios de configuración

- **Rol:** Administrador de tarifas y reglas
- **Prioridad:** Media

Permitir al administrador consultar la trazabilidad de las modificaciones realizadas sobre tarifas y reglas, incluyendo usuario, fecha, acción y valores afectados.

**Pasos:**

1. El administrador solicita el historial de una tarifa o regla específica, o de todas las configuraciones.
2. El sistema muestra los registros de cambios disponibles.
3. El administrador filtra el historial por configuración, usuario, tipo de acción o rango de fechas.
4. El sistema presenta quién realizó cada modificación, cuándo la realizó y qué valores fueron modificados.
5. El administrador consulta el detalle de un cambio seleccionado.

### Consultar resumen semanal de producción

- **Rol:** Operador de revolvedora
- **Prioridad:** Media

Permitir al operador consultar el resumen de sus viajes auditados, viajes base y viajes adicionales correspondientes a una semana de liquidación.

**Pasos:**

1. El operador selecciona la semana de liquidación que desea consultar.
2. El sistema valida que exista información procesada para el operador y la semana seleccionada.
3. El sistema muestra la cantidad de viajes auditados, viajes base y viajes adicionales.
4. El sistema muestra el periodo semanal y los datos utilizados para determinar la liquidación.
5. El operador revisa el resumen semanal de producción.

### Visualizar detalle de viajes auditados

- **Rol:** Operador de revolvedora
- **Prioridad:** Media

Permitir al operador revisar el detalle de los tiquetes considerados y excluidos durante la auditoría de su producción semanal.

**Pasos:**

1. El operador selecciona una semana de liquidación y solicita el detalle de viajes auditados.
2. El sistema recupera los tiquetes asociados al operador y al periodo seleccionado.
3. El sistema muestra los tiquetes considerados en la liquidación, incluyendo sus datos principales de producción.
4. El sistema muestra los tiquetes excluidos y el motivo de exclusión, como cancelación o consumo interno.
5. El operador compara la información procesada con su producción registrada.

### Procesar tiquetes desde reportes PDF

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Media

Recibir los reportes PDF diarios de SAP, extraer sus tiquetes, depurar registros no liquidables y señalar inconsistencias de procesamiento.

**Pasos:**

1. El sistema recibe un archivo PDF diario previamente cargado por un usuario autorizado.
2. El sistema valida que el archivo sea legible y tenga una estructura compatible con SAP.
3. El sistema extrae de cada tiquete la fecha, operador, vehículo, volumen, estado y número de tiquete.
4. El sistema compara los tiquetes extraídos con los registros previamente procesados para detectar duplicados.
5. El sistema identifica y excluye los tiquetes con estado cancelado.
6. El sistema identifica y excluye los consumos internos de 0.5 m³.
7. El sistema detecta datos incompletos, ambiguos o incompatibles y clasifica las inconsistencias.
8. El sistema conserva los tiquetes válidos y devuelve el resultado del procesamiento con sus advertencias e inconsistencias.

### Aplicar reglas y tarifas de liquidación

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Media

Aplicar las reglas vigentes del período para determinar los viajes base, los viajes adicionales y el valor correspondiente por operador.

**Pasos:**

1. El sistema identifica el período de liquidación asociado a los tiquetes válidos.
2. El sistema obtiene las reglas y tarifas versionadas vigentes para ese período.
3. El sistema agrupa los tiquetes válidos por operador y jornada.
4. El sistema aplica tres viajes base para cada jornada entre semana.
5. El sistema aplica dos viajes base para cada jornada de sábado.
6. El sistema determina los viajes que exceden la base aplicable.
7. El sistema calcula el valor de los viajes adicionales usando las tarifas vigentes.
8. El sistema registra los resultados y reporta cualquier incompatibilidad entre las reglas, tarifas y datos procesados.

### Consolidar liquidación semanal

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Media

Integrar los resultados diarios procesados en una liquidación semanal por operador.

**Pasos:**

1. El sistema recibe los resultados válidos de los días incluidos en la semana de liquidación.
2. El sistema verifica que cada resultado corresponda al período semanal seleccionado.
3. El sistema agrupa los viajes base, adicionales y valores calculados por operador.
4. El sistema acumula los importes diarios y calcula los totales semanales.
5. El sistema identifica jornadas o registros faltantes que puedan afectar la liquidación.
6. El sistema genera la liquidación semanal consolidada con sus observaciones e inconsistencias.

### Registrar trazabilidad de cálculos

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Media

Mantener el historial de las transformaciones y reglas aplicadas a cada tiquete y resultado de liquidación.

**Pasos:**

1. El sistema asigna un identificador de trazabilidad a cada archivo, tiquete y resultado calculado.
2. El sistema registra los datos extraídos y las normalizaciones aplicadas.
3. El sistema registra la detección de duplicados y las exclusiones realizadas.
4. El sistema registra las reglas, versiones y tarifas utilizadas en cada cálculo.
5. El sistema registra la asignación de viajes base y adicionales por operador.
6. El sistema relaciona cada total semanal con los tiquetes y cálculos que lo originaron.
7. El sistema conserva el historial para consulta y auditoría.

### Generar matriz y reporte de liquidación

- **Rol:** Motor de procesamiento y liquidación
- **Prioridad:** Media

Generar la matriz semanal y el reporte de liquidación exportable a partir de los resultados consolidados.

**Pasos:**

1. El sistema recibe una liquidación semanal consolidada y validada.
2. El sistema organiza los resultados por operador, fecha, jornada, viajes base, viajes adicionales y valores calculados.
3. El sistema construye la matriz semanal con los totales correspondientes.
4. El sistema genera el reporte de liquidación con inconsistencias y observaciones relevantes.
5. El sistema prepara la matriz y el reporte en formatos exportables.
6. El sistema entrega los archivos generados para su descarga o consulta por los usuarios autorizados.

## Modelo de datos (26 objetos)

### Planta

Centro operativo al que pertenecen las cargas, la producción y las liquidaciones semanales.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la planta. |
| name | text | — | Sí | Nombre de la planta o centro operativo. |
| code | text | — | Sí | Código único de identificación de la planta. |
| address | text | — | — | Dirección física de la planta. |
| isActive | boolean | — | Sí | Indica si la planta está activa para operar y procesar nómina. |

### Operador

Persona responsable de operar una revolvedora y a quien se asignan viajes y liquidaciones.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del operador. |
| plantaId | uuid | — | Sí | Identificador de la planta a la que pertenece el operador. |
| employeeCode | text | — | Sí | Código laboral o de empleado del operador. |
| fullName | text | — | Sí | Nombre completo del operador de revolvedora. |
| phone | phone | — | — | Teléfono de contacto del operador. |
| isActive | boolean | — | Sí | Indica si el operador está activo para asignaciones y liquidaciones. |

### CargaReporte

Registro de la recepción y procesamiento de un reporte diario de SAP.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la carga del reporte. |
| plantaId | uuid | — | Sí | Identificador de la planta asociada al reporte diario. |
| reportDate | date | — | Sí | Fecha operativa cubierta por el reporte diario de SAP. |
| fileUrl | url | — | Sí | Ubicación del archivo PDF cargado. |
| status | text | — | Sí | Estado del procesamiento del reporte, por ejemplo pendiente, procesado o error. |
| processedAt | datetime | — | — | Fecha y hora en que finalizó el procesamiento del reporte. |
| recordsCount | number | — | — | Cantidad de registros extraídos del reporte. |

### ReporteSAP

Documento PDF de SAP que contiene los registros de producción y tiquetes de una jornada.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del reporte SAP. |
| fileName | text | — | Sí | Nombre del archivo PDF cargado. |
| fileUrl | url | — | Sí | Ubicación del archivo PDF almacenado. |
| reportDate | date | — | Sí | Fecha de la jornada o reporte de producción. |
| processingStatus | text | — | Sí | Estado del procesamiento del reporte, por ejemplo pendiente, procesado o con errores. |
| uploadedAt | datetime | — | Sí | Fecha y hora de carga del reporte. |

### TiqueteProduccion

Registro extraído de SAP que representa un viaje o consumo asociado a la producción.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del tiquete de producción. |
| reporteSapId | uuid | — | Sí | Identificador del reporte SAP del que fue extraído el tiquete. |
| ticketNumber | text | — | Sí | Número o folio del tiquete en SAP. |
| ticketDate | date | — | Sí | Fecha asociada al viaje o consumo registrado. |
| operatorName | text | — | — | Nombre del operador de la revolvedora. |
| volumeM3 | decimal | — | Sí | Volumen transportado o consumido en metros cúbicos. |
| auditStatus | text | — | Sí | Resultado de auditoría del tiquete, como válido, cancelado, consumo interno o inconsistente. |

### ResultadoExtraccion

Resultado estructurado de la interpretación de los datos contenidos en un reporte PDF de SAP.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del resultado de extracción. |
| reporteSapId | uuid | — | Sí | Identificador del reporte SAP procesado. |
| processingStatus | text | — | Sí | Estado de la extracción estructurada. |
| processedAt | datetime | — | — | Fecha y hora en que finalizó el procesamiento. |
| ticketCount | number | — | Sí | Cantidad de tiquetes extraídos del reporte. |
| inconsistencyCount | number | — | Sí | Cantidad de inconsistencias detectadas durante la extracción. |
| errorDetails | textarea | — | — | Detalle de errores o advertencias generados durante el procesamiento. |

### ExclusionTiquete

Registro de la decisión y motivo por el que un tiquete queda fuera de la producción liquidable.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la exclusión. |
| tiqueteId | uuid | — | Sí | Identificador del tiquete excluido. |
| motivo | text | — | Sí | Motivo por el que el tiquete queda fuera de la producción liquidable. |
| tipoExclusion | text | — | Sí | Categoría de exclusión, como tiquete cancelado, consumo interno o duplicado. |
| observaciones | textarea | — | — | Detalles adicionales de la decisión de exclusión. |
| fechaDecision | datetime | — | Sí | Fecha y hora en que se registró la decisión. |

### InconsistenciaProduccion

Hallazgo que señala una anomalía en los datos extraídos o en la consolidación de la producción.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del hallazgo. |
| tiqueteId | uuid | — | — | Identificador del tiquete relacionado con la inconsistencia, cuando aplica. |
| tipoInconsistencia | text | — | Sí | Categoría de la anomalía detectada. |
| descripcion | textarea | — | Sí | Descripción detallada de la inconsistencia encontrada. |
| severidad | text | — | Sí | Nivel de impacto de la inconsistencia sobre la producción o liquidación. |
| estado | text | — | Sí | Estado de atención del hallazgo, como pendiente, validada o resuelta. |
| detectadaEn | datetime | — | Sí | Fecha y hora en que se detectó la inconsistencia. |

### ConfiguracionLiquidacion

Conjunto versionable de bases, tarifas y criterios utilizados para depurar y liquidar viajes.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la configuración. |
| version | number | — | Sí | Número de versión de la configuración. |
| viajesBaseSemana | number | — | Sí | Cantidad de viajes base aplicable durante los días de semana. |
| viajesBaseSabado | number | — | Sí | Cantidad de viajes base aplicable los sábados. |
| tarifaViajeAdicional | decimal | — | Sí | Tarifa aplicada a cada viaje adicional sobre la base establecida. |
| volumenConsumoInterno | decimal | — | Sí | Volumen considerado como consumo interno para depuración. |
| vigenciaDesde | date | — | Sí | Fecha inicial de vigencia de la configuración. |
| vigenciaHasta | date | — | — | Fecha final de vigencia de la configuración. |

### ViajeLiquidable

Viaje auditado que cumple los criterios para participar en el cálculo de la nómina.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del viaje liquidable. |
| operatorId | uuid | — | Sí | Identificador del operador de la revolvedora. |
| viajeDate | date | — | Sí | Fecha en que se realizó el viaje. |
| ticketNumber | text | — | Sí | Número del tiquete o viaje proveniente del reporte de SAP. |
| volumeM3 | decimal | — | Sí | Volumen transportado en metros cúbicos. |
| journeyType | text | — | Sí | Tipo de jornada o clasificación del viaje, como semana o sábado. |
| auditStatus | text | — | Sí | Estado del resultado de auditoría del viaje. |
| isAdditional | boolean | — | Sí | Indica si el viaje excede la base establecida y se considera adicional. |

### LiquidacionSemanal

Resultado semanal del cálculo de viajes base y adicionales aplicable a los operadores.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la liquidación semanal. |
| operatorId | uuid | — | Sí | Identificador del operador liquidado. |
| weekStartDate | date | — | Sí | Fecha de inicio de la semana liquidada. |
| weekEndDate | date | — | Sí | Fecha de finalización de la semana liquidada. |
| baseTrips | number | — | Sí | Cantidad de viajes base aplicables al operador. |
| additionalTrips | number | — | Sí | Cantidad de viajes adicionales calculados. |
| additionalRate | decimal | — | Sí | Tarifa configurada para cada viaje adicional. |
| totalAmount | decimal | — | Sí | Monto total de la liquidación semanal. |

### MatrizSemanalProduccion

Consolidado semanal validable que presenta la producción y los viajes liquidables por operador.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la matriz semanal. |
| weekStartDate | date | — | Sí | Fecha de inicio de la semana representada. |
| weekEndDate | date | — | Sí | Fecha de finalización de la semana representada. |
| operatorId | uuid | — | Sí | Identificador del operador incluido en la matriz. |
| totalTrips | number | — | Sí | Cantidad total de viajes registrados para el operador. |
| liquidableTrips | number | — | Sí | Cantidad de viajes que cumplen los criterios de liquidación. |
| validationStatus | text | — | Sí | Estado de validación de la matriz semanal. |
| validatedAt | datetime | — | — | Fecha y hora en que la matriz fue validada. |

### TrazabilidadCalculo

Evidencia auditable de las reglas, tarifas y operaciones aplicadas durante la liquidación.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del registro de trazabilidad. |
| periodoLiquidacion | date | — | Sí | Fecha de referencia de la liquidación auditada. |
| reglaAplicada | text | — | Sí | Regla de negocio aplicada durante el cálculo. |
| tarifaAplicada | decimal | — | Sí | Valor de la tarifa utilizada en la operación. |
| operacionRealizada | text | — | Sí | Descripción de la operación o cálculo ejecutado. |
| resultadoCalculo | decimal | — | Sí | Resultado numérico generado por el cálculo. |
| fechaRegistro | datetime | — | Sí | Fecha y hora en que se registró la evidencia. |

### Planta

Centro operativo al que pertenecen las cargas, la producción y las liquidaciones semanales.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la planta. |
| nombre | text | — | Sí | Nombre de la planta o centro operativo. |
| codigo | text | — | Sí | Código operativo de la planta. |
| ubicacion | text | — | — | Ubicación física de la planta. |
| activa | boolean | — | Sí | Indica si la planta está activa para operar. |

### Operador

Persona responsable de operar una revolvedora y a quien se asignan viajes y liquidaciones.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del operador. |
| plantaId | uuid | — | Sí | Identificador de la planta a la que pertenece el operador. |
| nombreCompleto | text | — | Sí | Nombre completo del operador de revolvedora. |
| documento | text | — | Sí | Número de documento o identificación del operador. |
| codigoEmpleado | text | — | — | Código interno del empleado. |
| activo | boolean | — | Sí | Indica si el operador está habilitado para asignaciones y liquidaciones. |

### CargaReporte

Registro de la recepción y procesamiento de un reporte diario de SAP.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la carga del reporte. |
| plantaId | uuid | — | Sí | Identificador de la planta asociada al reporte. |
| nombreArchivo | text | — | Sí | Nombre del archivo PDF de SAP cargado. |
| fechaReporte | date | — | Sí | Fecha operativa correspondiente al reporte diario. |
| fechaCarga | datetime | — | Sí | Fecha y hora en que se recibió el archivo. |
| estadoProcesamiento | text | — | Sí | Estado actual del procesamiento del reporte. |
| mensajeError | textarea | — | — | Detalle del error cuando el procesamiento no finaliza correctamente. |

### ReporteSAP

Documento PDF de SAP que contiene los registros de producción y tiquetes de una jornada.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del reporte SAP. |
| archivoUrl | url | — | Sí | Ubicación del archivo PDF cargado. |
| fechaJornada | date | — | Sí | Fecha de la jornada de producción reportada. |
| estadoProcesamiento | text | — | Sí | Estado actual del procesamiento del reporte. |
| fechaCarga | datetime | — | Sí | Fecha y hora en que se cargó el reporte. |
| mensajeInconsistencias | textarea | — | — | Detalle de inconsistencias detectadas durante el procesamiento. |

### TiqueteProduccion

Registro extraído de SAP que representa un viaje o consumo asociado a la producción.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del tiquete de producción. |
| reporteSapId | uuid | — | Sí | Identificador del reporte SAP del que fue extraído. |
| numeroTiquete | text | — | Sí | Número o código del tiquete registrado en SAP. |
| fechaTiquete | datetime | — | Sí | Fecha y hora asociadas al tiquete. |
| operadorNombre | text | — | — | Nombre del operador de la revolvedora asociado al tiquete. |
| volumenMetrosCubicos | decimal | — | Sí | Volumen de concreto registrado en metros cúbicos. |
| tipoRegistro | text | — | Sí | Clasificación del registro, como viaje, cancelado o consumo interno. |
| estadoAuditoria | text | — | Sí | Resultado de la auditoría del tiquete. |

### ResultadoExtraccion

Resultado estructurado de la interpretación de los datos contenidos en un reporte PDF de SAP.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del resultado de extracción. |
| reporteSapId | uuid | — | Sí | Identificador del reporte SAP procesado. |
| estadoExtraccion | text | — | Sí | Estado de la extracción de información del PDF. |
| cantidadTiquetesExtraidos | number | — | Sí | Cantidad total de tiquetes extraídos del reporte. |
| cantidadTiquetesValidos | number | — | Sí | Cantidad de tiquetes considerados válidos. |
| cantidadInconsistencias | number | — | Sí | Cantidad de inconsistencias encontradas en la extracción. |
| detalleErrores | textarea | — | — | Detalle de errores o advertencias producidos durante la extracción. |
| fechaProcesamiento | datetime | — | Sí | Fecha y hora en que se procesó el reporte. |

### ExclusionTiquete

Registro de la decisión y motivo por el que un tiquete queda fuera de la producción liquidable.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la exclusión. |
| tiqueteId | uuid | — | Sí | Identificador del tiquete excluido. |
| motivo | text | — | Sí | Motivo por el que el tiquete queda fuera de la producción liquidable. |
| tipoExclusion | text | — | Sí | Categoría de exclusión, como tiquete cancelado, consumo interno o duplicado. |
| observaciones | textarea | — | — | Notas adicionales sobre la decisión de exclusión. |
| fechaDecision | datetime | — | Sí | Fecha y hora en que se registró la exclusión. |
| decididoPor | uuid | — | — | Identificador del usuario que tomó o confirmó la decisión. |

### InconsistenciaProduccion

Hallazgo que señala una anomalía en los datos extraídos o en la consolidación de la producción.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del hallazgo. |
| tipoInconsistencia | text | — | Sí | Categoría de la anomalía detectada. |
| descripcion | textarea | — | Sí | Detalle de la inconsistencia encontrada en los datos o en la consolidación. |
| severidad | text | — | Sí | Nivel de impacto de la inconsistencia. |
| estado | text | — | Sí | Estado de atención del hallazgo, como pendiente, revisada o resuelta. |
| tiqueteId | uuid | — | — | Identificador del tiquete relacionado, si aplica. |
| fechaDeteccion | datetime | — | Sí | Fecha y hora en que se detectó la inconsistencia. |

### ConfiguracionLiquidacion

Conjunto versionable de bases, tarifas y criterios utilizados para depurar y liquidar viajes.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la versión de configuración. |
| nombre | text | — | Sí | Nombre descriptivo de la configuración. |
| viajesBaseSemana | number | — | Sí | Cantidad de viajes base aplicable durante los días de semana. |
| viajesBaseSabado | number | — | Sí | Cantidad de viajes base aplicable los sábados. |
| tarifaViajeAdicional | decimal | — | Sí | Valor pagado por cada viaje adicional sobre la base correspondiente. |
| criteriosDepuracion | textarea | — | Sí | Criterios configurados para excluir tiquetes cancelados, consumos internos y otros registros no liquidables. |
| vigenciaDesde | date | — | Sí | Fecha inicial de vigencia de la configuración. |
| vigenciaHasta | date | — | — | Fecha final de vigencia de la configuración. |

### ViajeLiquidable

Viaje auditado que cumple los criterios para participar en el cálculo de la nómina.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del viaje liquidable. |
| operadorId | uuid | — | Sí | Identificador del operador de la revolvedora. |
| fechaViaje | date | — | Sí | Fecha en que se realizó el viaje. |
| jornada | text | — | Sí | Jornada correspondiente al viaje, como semana o sábado. |
| numeroViaje | number | — | Sí | Número consecutivo del viaje dentro de la jornada. |
| volumenM3 | decimal | — | Sí | Volumen transportado en metros cúbicos. |
| estadoAuditoria | text | — | Sí | Resultado de la auditoría del viaje. |
| esViajeAdicional | boolean | — | Sí | Indica si el viaje excede la base aplicable y genera pago adicional. |

### LiquidacionSemanal

Resultado semanal del cálculo de viajes base y adicionales aplicable a los operadores.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la liquidación semanal. |
| operadorId | uuid | — | Sí | Identificador del operador liquidado. |
| semanaInicio | date | — | Sí | Fecha de inicio del periodo semanal. |
| semanaFin | date | — | Sí | Fecha de finalización del periodo semanal. |
| viajesBase | number | — | Sí | Cantidad de viajes incluidos como base de la liquidación. |
| viajesAdicionales | number | — | Sí | Cantidad de viajes adicionales liquidados. |
| tarifaViajeAdicional | decimal | — | Sí | Tarifa configurada para cada viaje adicional. |
| totalLiquidado | decimal | — | Sí | Valor total de la liquidación semanal. |

### MatrizSemanalProduccion

Consolidado semanal validable que presenta la producción y los viajes liquidables por operador.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único de la matriz semanal. |
| semanaInicio | date | — | Sí | Fecha de inicio de la semana consolidada. |
| semanaFin | date | — | Sí | Fecha de finalización de la semana consolidada. |
| operadorId | uuid | — | Sí | Identificador del operador incluido en la matriz. |
| totalViajes | number | — | Sí | Cantidad total de viajes reportados para el operador. |
| viajesLiquidables | number | — | Sí | Cantidad de viajes que cumplen los criterios de liquidación. |
| estadoValidacion | text | — | Sí | Estado de validación de la matriz semanal. |
| validadaEn | datetime | — | — | Fecha y hora en que la matriz fue validada. |

### TrazabilidadCalculo

Evidencia auditable de las reglas, tarifas y operaciones aplicadas durante la liquidación.

| Campo | Tipo | PK | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| id | uuid | Sí | Sí | Identificador único del registro de trazabilidad. |
| fechaCalculo | datetime | — | Sí | Fecha y hora en que se ejecutó el cálculo. |
| tipoOperacion | text | — | Sí | Tipo de operación registrada, como liquidación, aplicación de regla o ajuste. |
| reglasAplicadas | textarea | — | Sí | Detalle de las reglas aplicadas durante el cálculo. |
| tarifasAplicadas | textarea | — | Sí | Detalle de las tarifas y versiones utilizadas. |
| resultadoCalculo | textarea | — | Sí | Resultado generado por el proceso de liquidación. |
| usuarioResponsable | text | — | — | Usuario o proceso responsable de ejecutar la operación. |

## Épicas (4)

### Jefe de planta

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Jefe de planta.

### Administrador de tarifas y reglas

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Administrador de tarifas y reglas.

### Operador de revolvedora

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Operador de revolvedora.

### Motor de procesamiento y liquidación

- **Estado:** Abierta
- **Prioridad:** Media

Implementar capacidades para el rol Motor de procesamiento y liquidación.

---

_Fin de la especificación._