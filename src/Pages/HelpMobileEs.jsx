import { Divider, Flex, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";

const HelpMobile = () => {
  return (
    <Flex direction="column" px={20} py={10}>
      <Flex align="center" justify="center">
        <img
          src="./buffalo_logo_full.png"
          alt="Buffalo All Access - In and Around BNMC"
          width={200}
        />
      </Flex>
      <Divider my={10} />
      <Flex direction="column" align="center" justify="center">
        <Heading as="h4" size="md">Centro de Llamadas</Heading>
        <Text>Teléfono: <Link href="tel:+17168884600" color="dodgerblue">716-888-4600</Link></Text>
        <Text mt={2}>Horas de Operación</Text>
        <Text>Lunes - Viernes, 6:00 AM a 7:00 PM EST</Text>
      </Flex>

      <Divider my={10} />

      <Flex direction="column">
        <Link href="#sign-up" color="dodgerblue">Registrarse</Link>
        <Link href="#log-in" color="dodgerblue">Iniciar Sesión</Link>
        <Link href="#nfta-community-shuttle" color="dodgerblue">Transporte Comunitario NFTA</Link>
        <Link href="#upcoming-trips" color="dodgerblue">Próximos Viajes</Link>
        <Link href="#trip-history" color="dodgerblue">Historial de Viajes</Link>
        <Link href="#find-nearby-routes" color="dodgerblue">Encontrar Rutas Cercanas</Link>
        <Link href="#schedule-new-trip" color="dodgerblue">Programar Nuevo Viaje</Link>
        <Link href="#schedule-new-trip-assistant" color="dodgerblue">Programar Nuevo Viaje - Asistente</Link>
        <Link href="#profile-and-settings" color="dodgerblue">Perfil y Configuraciones</Link>
      </Flex>

      <Divider my={10} />

      <Flex id="sign-up" direction="column">
        <Heading as="h4" size="md">Registrarse</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Si no tienes una cuenta, haz clic en Registrarse.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa tu información, acepta los términos y condiciones, y haz clic
              en Crear para hacer una cuenta.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa el código de 6 dígitos que fue enviado a tu correo electrónico y haz clic en Enviar.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Reenvía el código si no recibiste el correo electrónico.</Text>
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
              Ingresa tus credenciales y haz clic en Iniciar Sesión para acceder a tu nueva cuenta.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Añade tu información de contacto según se te solicite y haz clic en Siguiente.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa tu dirección de casa y haz clic en Siguiente.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Si omites este paso, tendrás que ingresar tu dirección de casa cuando planifiques viajes.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture2.png" alt="Iniciar Sesión" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Tienes la opción de ingresar un coordinador principal para que pueda
              rastrear tus viajes. Si lo deseas, ingresa su información y haz clic en Siguiente. También puedes elegir omitir esa opción.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Las opciones de accesibilidad pueden ser especificadas. Haz clic en lo que sea aplicable y haz clic en Siguiente.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Si omites este paso, pueden ser cambiadas más tarde en configuraciones.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa el código de 6 dígitos que fue enviado por correo electrónico.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture3.png" alt="Ingresar Código" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="log-in" direction="column">
        <Heading as="h4" size="md">Iniciar Sesión</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Si ya has creado una cuenta, haz clic en Iniciar Sesión.</Text>
          </ListItem>
          <ListItem>
            <Text>Ingresa tus credenciales y haz clic en Iniciar Sesión.</Text>
          </ListItem>
          <ListItem>
            <Text>Verifica tu identidad seleccionando un método para recibir un código.</Text>
          </ListItem>
          <ListItem>
            <Text>Ingresa el código de 6 dígitos que fue enviado y haz clic en Enviar.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture4.png" alt="Iniciar Sesión" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="nfta-community-shuttle" direction="column">
        <Heading as="h4" size="md">Transporte Comunitario NFTA</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              El Transporte Comunitario NFTA es un servicio de transporte a demanda operado
              por NFTA. Te lleva dentro de la vecindad del Buffalo-Niagara Medical Campus.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Haz clic en el botón Transporte Comunitario NFTA.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Dentro del borde verde están las opciones para viajar. A medida que te muevas
              en la pantalla, la ubicación se moverá contigo.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Haz clic en Solicitar Transporte cuando hayas seleccionado tu ubicación de recogida en el mapa.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa una ubicación donde serás dejado, el número de personas
              viajando, y haz clic en Confirmar.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture5.png" alt="Transporte NFTA" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>Tu información del viaje en transporte será mostrada.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Si tienes preguntas o necesitas asistencia con respecto a tu viaje en transporte,
              puedes llamar a NFTA presionando el
              <img src="./help_mobile_images/phone.png" alt="teléfono" className="phone" /> botón,
              que mostrará el número en la parte inferior de la pantalla.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Cancela el viaje si decides que ya no necesitas los servicios de transporte.</Text>
          </ListItem>
          <ListItem>
            <Text>Si presionas el botón de salir, serás llevado a la pantalla principal.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture6.png" alt="Transporte NFTA" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="upcoming-trips" direction="column">
        <Heading as="h4" size="md">Próximos Viajes</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Para ver el viaje reservado o cualquier otro próximo viaje, puedes hacer clic
              en el ícono en la parte inferior izquierda de la pantalla.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Si haces clic en Ver detalles del viaje, te mostrará los detalles del viaje.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Si haces clic en Programar nuevamente, duplicará ese viaje para ahorrar
              tiempo al ingresar información de viaje.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture7.png" alt="Próximos Viajes" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="trip-history" direction="column">
        <Heading as="h4" size="md">Historial de Viajes</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Haz clic en el ícono en la parte inferior derecha de la pantalla para ver el historial
              de viajes.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Haz clic en Ver detalles del viaje para mostrar los detalles.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Si haces clic en Programar nuevamente, duplicará ese viaje para ahorrar
              tiempo al ingresar información de viaje.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture8.png" alt="Historial de Viajes" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="find-nearby-routes" direction="column">
        <Heading as="h4" size="md">Encontrar Rutas Cercanas</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Si deseas encontrar rutas cercanas, haz clic en el botón de encontrar rutas cercanas.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Esto te llevará a una pantalla mostrando todas las posibles rutas cercanas. Selecciona una de las rutas para ver más detalles sobre ella.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture9.png" alt="Encontrar Rutas Cercanas" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="schedule-new-trip" direction="column">
        <Heading as="h4" size="md">Programar Nuevo Viaje</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Haz clic en Programar Nuevo Viaje en la Pantalla de Inicio.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Ingresa la información del viaje, incluyendo origen, destino, y hora de
              viaje.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Haz clic en Confirmar para programar el viaje.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture10.png" alt="Programar Nuevo Viaje" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="schedule-new-trip-assistant" direction="column">
        <Heading as="h4" size="md">Programar Nuevo Viaje - Asistente</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Haz clic en Programar Nuevo Viaje en la Pantalla de Inicio.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Cuando se abra el planificador de viajes, puedes hacer clic en Asistente en la esquina
              inferior izquierda de la pantalla.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Responde las preguntas según se te solicite para ayudar a programar tu viaje.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture11.png" alt="Programar Nuevo Viaje Asistente" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex id="profile-and-settings" direction="column">
        <Heading as="h4" size="md">Perfil y Configuraciones</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Haz clic en Perfil y Configuraciones en la Pantalla de Inicio.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Esto te llevará a una pantalla donde puedes cambiar tu información personal,
              información de contacto, dirección de casa, y opciones de accesibilidad.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture12.png" alt="Perfil y Configuraciones" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider my={10} />

      <Flex direction="column">
        <Text>
          Para obtener más asistencia, por favor llama a nuestro Centro de Llamadas o visita nuestro sitio web.
        </Text>
        <Link href="https://www.buffaloallaccess.com" color="dodgerblue">Buffalo All Access</Link>
      </Flex>
    </Flex>
  );
};

export default HelpMobile;
