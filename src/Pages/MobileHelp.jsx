import { Center, Divider, Flex, Heading, Link, ListItem, UnorderedList } from "@chakra-ui/react";

const MobileHelp = () => {
  return (
    <Flex
      direction="column"
      paddingX={20}
      paddingY={10}
    >
      <Flex
        align="center"
        justify="center"
      >
        <img src="./buffalo_logo_full.png" alt="Buffalo All Access - In and Around BNMC" width={200} />
      </Flex>
      <Divider marginY={10} />
      <Flex
        direction="column"
        align="center"
        justify="center"
      >
        <Heading as="h4" size="md">Call Center</Heading>
        <p>Phone: <a href="tel:+17168884600" style={{ color: 'dodgerblue' }}>716-888-4600</a></p>
        <br/>
        <p>Hours of Operation</p>
        <p>Monday - Friday, 6:00 AM to 7:00 PM EST</p>
      </Flex>

      <Divider marginY={10} />

      <Flex
        direction="column"
      >
        <Link href="#sign-up" color="dodgerblue">Sign Up</Link>
        <Link href="#log-in" color="dodgerblue">Log In</Link>
        <Link href="#nfta-community-shuttle" color="dodgerblue">NFTA Community Shuttle</Link>
        <Link href="#upcoming-trips" color="dodgerblue">Upcoming Trips</Link>
        <Link href="#trip-history" color="dodgerblue">Trip History</Link>
        <Link href="#find-nearby-routes" color="dodgerblue">Find Nearby Routes</Link>
        <Link href="#schedule-new-trip" color="dodgerblue">Schedule New Trip</Link>
        <Link href="#schedule-new-trip-assistant" color="dodgerblue">Schedule New Trip - Assistant</Link>
        <Link href="#profile-and-settings" color="dodgerblue">Profile and Settings</Link>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="sign-up"
        direction="column"
      >
        <Heading as="h4" size="md">Sign Up</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>If you don’t already have an account, click Sign Up.</ListItem>
          <ListItem>
            Enter your information, agree to the terms and conditions, and click
            Create to make an account.
          </ListItem>
          <ListItem>
            Enter the 6-digit code that was sent to your email and click Submit.
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>Resend the code if you did not receive the email.</ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture1.png" alt="Sign Up" />
          </ListItem>
          <ListItem>
            Enter your credentials and click Log In to access your new account.
          </ListItem>
          <ListItem>Add your contact information as prompted and click Next.</ListItem>
          <ListItem>
            Enter your home address and click Next.
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                If you skip this step, you will have to enter your home address
                when planning trips.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture2.png" alt="Log In" />
          </ListItem>
          <ListItem>
            There is an ability to enter a primary coordinator for them to be
            able to track your trips. If that is wanted, enter their information
            and click Next. You may also choose to Skip that option.
          </ListItem>
          <ListItem>
            Accessibility options can be specified. Click what is applicable and
            click Next.
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                If you skip this step, they can be changed later in settings.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>Enter the 6-digit code that was sent via email.</ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture3.png" alt="Enter Code" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="log-in"
        direction="column"
      >
        <Heading as="h4" size="md">Log In</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>If you have already created an account, click Log In.</ListItem>
          <ListItem>Enter your credentials and click Log In.</ListItem>
          <ListItem>
            Verify your identity by selecting a method of receiving a code.
          </ListItem>
          <ListItem>Enter the 6-digit code that was sent and click Submit.</ListItem>
          <ListItem style={{ listStyle: 'none' }}>
            <img src="./mobile_help_images/Picture4.png" alt="Log In" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="nfta-community-shuttle"
        direction="column"
      >
        <Heading as="h4" size="md">NFTA Community Shuttle</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            The NFTA Community Shuttle is an on-demand shuttle service operated
            by the NFTA. It takes you within the Buffalo-Niagara Medical Campus
            vicinity.
          </ListItem>
          <ListItem>Click the NTFA Community Shuttle button.</ListItem>
          <ListItem>
            Inside the green border are the options for travel. As you move
            around on the screen, the location will move with it.
          </ListItem>
          <ListItem>Click Summon Shuttle when you have selected your pick-up location on the map.</ListItem>
          <ListItem>
            Enter a location where you will be dropped off, the number of people
            riding, and click Confirm.
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture5.png" alt="NFTA Shuttle" />
          </ListItem>
          <ListItem>Your Your shuttle trip information will be displayed.</ListItem>
          <ListItem>
            If you have questions or need assistance regarding your shuttle
            trip, you may call NFTA by pushing the
            <img src="./mobile_help_images/phone.png" alt="phone" class="phone" /> button,
            which will display the number on the bottom of the screen.
          </ListItem>
          <ListItem>Cancel the trip if you decide you no longer need shuttle services.</ListItem>
          <ListItem>If you push the exit button, you will be brought to the main screen.</ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture6.png" alt="NFTA Shuttle" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="upcoming-trips"
        direction="column"
      >
        <Heading as="h4" size="md">Upcoming Trips</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            To view the booked trip or any other upcoming trips, you can click
            the icon on the bottom left of the screen.
          </ListItem>
          <ListItem>If you click See trip details, it will show you specifics.</ListItem>
          <ListItem>
            You may favorite a trip by clicking on the star, naming the trip, and
            selecting Save.
          </ListItem>
          <ListItem>Clicking Go shows turn-by-turn navigation.</ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture7.png" alt="Upcoming Trips" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="trip-history"
        direction="column"
      >
        <Heading as="h4" size="md">Trip History</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>Clicking Trip History will take you to your trip log.</ListItem>
          <ListItem>
            Under the Activity section, all trips you have taken will be listed.
          </ListItem>
          <ListItem>
            Trips that have been favorited will be shown in the Favorites section.
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture8.png" alt="Trip History" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="find-nearby-routes"
        direction="column"
      >
        <Heading as="h4" size="md">Find Nearby Routes</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            This option allows you to explore quickly without scheduling
            anything.
          </ListItem>
          <ListItem>Start by panning to a location on the map.</ListItem>
          <ListItem>
            All routes in the vicinity will be shown and will update if panned
            to a different location on the map. They will be listed on the
            bottom.
          </ListItem>
          <ListItem>If you click a route, all the stops will show on the map.</ListItem>
          <ListItem>The map will pan to a stop if you click on one from the list.</ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture9.png" alt="Find Nearby Routes" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="schedule-new-trip"
        direction="column"
      >
        <Heading as="h4" size="md">Schedule New Trip</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>Click the Schedule New Trip button to book transportation.</ListItem>
          <ListItem>
            Enter the locations, date, and time and click Next.
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                Travel times can be booked as:
                <UnorderedList styleType="none" spacing={3}>
                  <ListItem>Leave Now</ListItem>
                  <ListItem>Leave At</ListItem>
                  <ListItem>Arrive By</ListItem>
                </UnorderedList>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            A location can be saved and assigned a nickname for future use.
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture10.png" alt="Schedule New Trip" />
          </ListItem>
          <ListItem>
            Select the mode(s) of transportation you want for travel and click
            Submit.
          </ListItem>
          <ListItem>
            Routes will be generated and show a list of options. Some walking
            with use of the bus may be required.
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>Some walking with use of the bus may be required.</ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>You can select a route to preview it before scheduling.</ListItem>
          <ListItem>
            The details of the trip will be displayed in a list form as well as
            shown on the map. Click Schedule Trip or go back if you’d like to
            review other options.
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture11.png" alt="Schedule New Trip" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="schedule-new-trip-assistant"
        direction="column"
      >
        <Heading as="h4" size="md">Schedule New Trip - Assistant</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            In the Schedule a Trip area, you have an option to use speech
            recognition to book trips.
          </ListItem>
          <ListItem>
            Click the blue speech recognition tool to utilize that service.
          </ListItem>
          <ListItem>
            Allow Complete Trip to access both speech recognition and the
            microphone.
          </ListItem>
          <ListItem>
            Push the speech recognition button to begin speaking and interacting
            with the bot.
          </ListItem>
          <ListItem>
            <img src="./mobile_help_images/Picture12.png" alt="Schedule New Trip – Assistant" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="profile-and-settings"
        direction="column"
      >
        <Heading as="h4" size="md">Profile and Settings</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            Profile Information
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                Click Profile Information and it will display your information.
              </ListItem>
              <ListItem>
                Click Edit and Save for changes to your personal information.
              </ListItem>
              <ListItem>
                Your account can be deleted by clicking Delete Account, typing
                the prompt, and clicking Delete Account once more.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture13.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Coordinators
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                This page will show coordinators associated with the account.
              </ListItem>
              <ListItem>
                Pending means that the person has not accepted this request yet
                via email.
              </ListItem>
              <ListItem>
                To remove a coordinator, click the trash can icon and confirm
                your request by selecting Delete.
              </ListItem>
              <ListItem>
                Additional coordinators can be invited by clicking Invite a
                Coordinator, entering the necessary information, and selecting
                Invite.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture14.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Favorites
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>This is where favorited trips and locations will appear.</ListItem>
              <ListItem>
                Clicking the
                <img src="./mobile_help_images/trash.png" alt="trash" class="trash" /> button
                will remove it from the list.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture15.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            NFTA Paratransit Access Line (PAL) Direct Users
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                This will provide a direct link to schedule a PAL trip for
                users who are eligible.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture16.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Terms and Conditions
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                The terms and conditions of usage will be listed on this page.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture17.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Help
            <UnorderedList>
              <ListItem>
                You will be directed to this document if you need any
                assistance.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture18.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Trip Preferences
            <UnorderedList>
              <ListItem>
                This is where you can specify if you have special accommodations
                that need to be accounted for when booking a trip, such as
                wheelchair accessibility, the need for minimal walking, and/or
                having a service animal.
              </ListItem>
              <ListItem>
                The number of transfers per trip can be modified, as well as the
                preferred mode(s) of transport.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture19.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            Accessibility
            <UnorderedList>
              <ListItem>
                The option for verbal directions can be turned on or off, as
                well as specifying the preferred display language.
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture20.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>Notifications
            <UnorderedList>
              <ListItem>This is where you can customize preferences about trip notifications.</ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture21.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>Password
            <UnorderedList>
              <ListItem>Your password may be changed to something new on this page by entering the prompted information and clicking Submit.</ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img
              src="./mobile_help_images/Picture22.png"
              alt="Profile and Settings"
            />
          </ListItem>
        </UnorderedList>
      </Flex>
    </Flex>
  )
};

export default MobileHelp;