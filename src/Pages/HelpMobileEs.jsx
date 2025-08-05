import {
  Divider,
  Flex,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";

const HelpMobileEs = () => {
  return (
    <Flex direction="column" paddingX={20} paddingY={10}>
      <Flex align="center" justify="center">
        <img
          src="./buffalo_logo_full.png"
          alt="Buffalo All Access - In and Around BNMC"
          width={200}
        />
      </Flex>
      <Divider marginY={10} />
      <Flex direction="column" align="center" justify="center">
        <Heading as="h4" size="md">
          Centro de Llamadas
        </Heading>
        <p>
          Teléfono:{" "}
          <a href="tel:+17168884600" style={{ color: "dodgerblue" }}>
            716-888-4600
          </a>
        </p>
        <br />
        <p>Horario de Operación</p>
        <p>Lunes - Viernes, 6:00 AM a 7:00 PM EST</p>
      </Flex>


      <Divider marginY={10} />

      <Flex direction="column">
        <Link href="#sign-up" color="dodgerblue">
          Registrarse
        </Link>
        <Link href="#log-in" color="dodgerblue">
          Iniciar sesión
        </Link>
        <Link href="#nfta-community-shuttle" color="dodgerblue">
          Transporte Comunitario NFTA
        </Link>
        <Link href="#upcoming-trips" color="dodgerblue">
          Próximos Viajes
        </Link>
        <Link href="#trip-history" color="dodgerblue">
          Historial de Viajes
        </Link>
        <Link href="#find-nearby-routes" color="dodgerblue">
          Encontrar Rutas Cercanas
        </Link>
        <Link href="#schedule-new-trip" color="dodgerblue">
          Programar Nuevo Viaje
        </Link>
        <Link href="#schedule-new-trip-assistant" color="dodgerblue">
          Programar Nuevo Viaje - Asistente
        </Link>
        <Link href="#profile-and-settings" color="dodgerblue">
          Perfil y Configuración
        </Link>
      </Flex>

      <Divider marginY={10} />

      <Flex id="sign-up" direction="column">
        <Heading as="h4" size="md">
          Registrarse
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Si aún no tienes una cuenta, haz clic en Registrarse.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa tu información, acepta los términos y condiciones, y haz
              clic en Crear para hacer una cuenta.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa el código de 6 dígitos que se envió a tu correo
              electrónico y haz clic en Enviar.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Vuelve a enviar el código si no recibiste el correo electrónico.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture1.png" alt="Registrarse" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa tus credenciales y haz clic en Iniciar sesión para acceder a tu nueva cuenta.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Agrega tu información de contacto según se te indique y haz clic en Siguiente.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa tu dirección de casa y haz clic en Siguiente.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Si omites este paso, deberás ingresar tu dirección de casa al planificar viajes.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture2.png" alt="Iniciar sesión" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Existe la posibilidad de ingresar un coordinador principal para que pueda rastrear tus viajes. Si deseas eso, ingresa su información y haz clic en Siguiente. También puedes elegir Omitir esa opción.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Se pueden especificar opciones de accesibilidad. Haz clic en lo que corresponda y haz clic en Siguiente.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Si omites este paso, se pueden cambiar más tarde en la configuración.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>Ingresa el código de 6 dígitos que se envió por correo electrónico.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture3.png" alt="Ingresar Código" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>


      <Divider marginY={10} />

      <Flex id="log-in" direction="column">
        <Heading as="h4" size="md">
          Iniciar sesión
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Si ya has creado una cuenta, haz clic en Iniciar sesión.</Text>
          </ListItem>
          <ListItem>
            <Text>Ingresa tus credenciales y haz clic en Iniciar sesión.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Verifica tu identidad seleccionando un método para recibir un código.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Ingresa el código de 6 dígitos que se envió y haz clic en Enviar.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture4.png" alt="Iniciar sesión" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="nfta-community-shuttle" direction="column">
        <Heading as="h4" size="md">
          NFTA Community Shuttle
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              El NFTA Community Shuttle es un servicio de transporte a pedido
              operado por el NFTA. Te lleva dentro de las cercanías del Campus Médico Buffalo-Niagara.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Haz clic en el botón NTFA Community Shuttle.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Dentro del borde verde están las opciones de viaje. A medida que te mueves
              en la pantalla, la ubicación se moverá contigo.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Haz clic en Summon Shuttle cuando hayas seleccionado tu ubicación de recogida
              en el mapa.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa una ubicación donde serás dejado, el número de
              personas viajando y haz clic en Confirmar.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture5.png" alt="NFTA Shuttle" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>La información de tu viaje en el shuttle se mostrará.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Si tienes preguntas o necesitas asistencia con tu viaje en el shuttle,
              puedes llamar al NFTA presionando el
              <img
                src="./help_mobile_images/phone.png"
                alt="teléfono"
                class="teléfono"
              />{" "}
              botón, que mostrará el número en la parte inferior de la pantalla.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Cancela el viaje si decides que ya no necesitas los servicios del shuttle.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Si presionas el botón de salida, serás llevado a la pantalla principal.
            </Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture6.png" alt="NFTA Shuttle" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="upcoming-trips" direction="column">
        <Heading as="h4" size="md">
          Próximos Viajes
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Para ver el viaje reservado u otros viajes próximos, puedes hacer clic
              en el icono en la parte inferior izquierda de la pantalla.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Si haces clic en Ver detalles del viaje, te mostrará los detalles específicos.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Puedes marcar un viaje como favorito haciendo clic en la estrella, nombrando el viaje,
              y seleccionando Guardar.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Hacer clic en Ir muestra la navegación paso a paso.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture7.png" alt="Próximos Viajes" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="trip-history" direction="column">
        <Heading as="h4" size="md">
          Historial de Viajes
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Hacer clic en Historial de Viajes te llevará a tu registro de viajes.</Text>
          </ListItem>
          <ListItem>
            <Text>
              En la sección Actividad, se listarán todos los viajes que hayas realizado.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Los viajes marcados como favoritos se mostrarán en la sección Favoritos.
            </Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture8.png" alt="Historial de Viajes" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="find-nearby-routes" direction="column">
        <Heading as="h4" size="md">
          Buscar Rutas Cercanas
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Esta opción te permite explorar rápidamente sin programar nada.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Comienza moviendo el mapa hacia una ubicación.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Todas las rutas en las cercanías se mostrarán y se actualizarán si mueves el mapa a una ubicación diferente. Se listarán en la parte inferior.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Si haces clic en una ruta, se mostrarán todas las paradas en el mapa.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              El mapa se desplazará a una parada si haces clic en una de la lista.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture9.png"
              alt="Buscar Rutas Cercanas"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="schedule-new-trip" direction="column">
        <Heading as="h4" size="md">
          Programar Nuevo Viaje
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Haz clic en el botón Programar Nuevo Viaje para reservar transporte.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa las ubicaciones, fecha y hora y haz clic en Siguiente.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Los tiempos de viaje se pueden programar como:
                    <UnorderedList styleType="none" spacing={3}>
                      <ListItem>
                        <Text>Salir Ahora</Text>
                      </ListItem>
                      <ListItem>
                        <Text>Salir a las</Text>
                      </ListItem>
                      <ListItem>
                        <Text>Llegar Para</Text>
                      </ListItem>
                    </UnorderedList>
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Una ubicación se puede guardar y asignar un apodo para uso futuro.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture10.png"
              alt="Programar Nuevo Viaje"
            />
          </ListItem>
          <ListItem>
            <Text>
              Selecciona el/los modos de transporte que deseas para el viaje y haz clic en Enviar.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Se generarán rutas y se mostrará una lista de opciones. Puede ser necesario caminar y usar el autobús.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Puede ser necesario caminar y usar el autobús.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>Puedes seleccionar una ruta para previsualizarla antes de programarla.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Los detalles del viaje se mostrarán en forma de lista y también en el mapa. Haz clic en Programar Viaje o regresa si deseas revisar otras opciones.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture11.png"
              alt="Programar Nuevo Viaje"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="schedule-new-trip-assistant" direction="column">
        <Heading as="h4" size="md">
          Programar Nuevo Viaje - Asistente
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              En el área de Programar un Viaje, tienes la opción de utilizar el reconocimiento de voz para reservar viajes.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Haz clic en la herramienta de reconocimiento de voz azul para utilizar ese servicio.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Permite que el Viaje Completo acceda tanto al reconocimiento de voz como al micrófono.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Presiona el botón de reconocimiento de voz para comenzar a hablar e interactuar con el bot.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture12.png"
              alt="Programar Nuevo Viaje – Asistente"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="profile-and-settings" direction="column">
        <Heading as="h4" size="md">
          Perfil y Configuración
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Información del Perfil
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Haz clic en Información del Perfil y se mostrará tu información.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Haz clic en Editar y Guardar para realizar cambios en tu información personal.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Tu cuenta puede ser eliminada haciendo clic en Eliminar Cuenta, escribiendo la confirmación y haciendo clic en Eliminar Cuenta una vez más.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture13.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Coordinadores
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Esta página mostrará los coordinadores asociados con la cuenta.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Pendiente significa que la persona aún no ha aceptado esta solicitud por correo electrónico.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Para eliminar un coordinador, haz clic en el icono de la papelera y confirma tu solicitud seleccionando Eliminar.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Se pueden invitar coordinadores adicionales haciendo clic en Invitar a un Coordinador, ingresando la información necesaria y seleccionando Invitar.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture14.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Favoritos
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Aquí es donde aparecerán los viajes y ubicaciones favoritas.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <Text display="flex" alignItems="center">
                      Al hacer clic en el{" "}
                      <img
                        src="./help_mobile_images/trash.png"
                        alt="papelera"
                        class="papelera"
                      />{" "}
                      se eliminará de la lista.
                    </Text>
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture15.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Usuarios Directos de la Línea de Acceso al Paratránsito (PAL) de NFTA
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Esto proporcionará un enlace directo para programar un viaje de PAL para los usuarios que sean elegibles.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture16.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Términos y Condiciones
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Los términos y condiciones de uso se enumerarán en esta página.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture17.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Ayuda
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Serás dirigido a este documento si necesitas alguna asistencia.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img
                src="./help_mobile_images/Picture18.png"
                alt="Perfil y Configuración"
              />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Preferencias de Viaje
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Aquí puedes especificar si tienes necesidades especiales que deben tenerse en cuenta al reservar un viaje, como accesibilidad para silla de ruedas, la necesidad de caminar mínimamente y/o tener un animal de servicio.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Se puede modificar el número de trasbordos por viaje, así como el/los modo(s) de transporte preferido(s).
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture19.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Accesibilidad
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Se puede activar o desactivar la opción de direcciones verbales, así como especificar el idioma de visualización preferido.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture20.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Notificaciones
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Aquí puedes personalizar las preferencias sobre las notificaciones de viaje.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture21.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
          <ListItem>
            <Text>
              Contraseña
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Tu contraseña se puede cambiar a una nueva en esta página ingresando la información solicitada y haciendo clic en Enviar.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture22.png"
              alt="Perfil y Configuración"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

    </Flex>
  );
};

export default HelpMobileEs;
