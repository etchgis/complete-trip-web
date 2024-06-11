import {
  Box,
  Divider,
  Flex,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useStore } from "zustand";

const HelpMobile = () => {

  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  const { mode } = params;

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
        <Text>
          Looking for help for the website? Click{" "}
          <Link
            href="/help"
            color="dodgerblue"
            role="link"
            aria-label="Mobile app help"
          >
            here
          </Link>
          .
        </Text>
      </Flex>
      <Divider marginY={10} />
      <Flex direction="column" align="center" justify="center">
        <Heading as="h4" size="md">
          Call Center
        </Heading>
        <p>
          Phone:{" "}
          <a href="tel:+17168884600" style={{ color: "dodgerblue" }}>
            716-888-4600
          </a>
        </p>
        <br />
        <p>Hours of Operation</p>
        <p>Monday - Friday, 6:00 AM to 7:00 PM EST</p>
      </Flex>

      <Divider marginY={10} />

      <Flex direction="column">
        {mode === 'callcenter' &&
          <Link href="#faq" color="dodgerblue" role="link">
            All Access App Troubleshooting FAQ
          </Link>
        }
        <Link href="#sign-up" color="dodgerblue" role="link">
          Sign Up
        </Link>
        <Link href="#log-in" color="dodgerblue" role="link">
          Log In
        </Link>
        {mode === 'callcenter' &&
          <Link href="#forgot-password" color="dodgerblue" role="link">
            Forgot Password
          </Link>
        }
        <Link href="#nfta-community-shuttle" color="dodgerblue" role="link">
          NFTA Community Shuttle
        </Link>
        <Link href="#upcoming-trips" color="dodgerblue" role="link">
          Upcoming Trips
        </Link>
        <Link href="#trip-history" color="dodgerblue" role="link">
          Trip History
        </Link>
        <Link href="#find-nearby-routes" color="dodgerblue" role="link">
          Find Nearby Routes
        </Link>
        <Link href="#schedule-new-trip" color="dodgerblue" role="link">
          Schedule New Trip
        </Link>
        <Link href="#schedule-new-trip-assistant" color="dodgerblue" role="link">
          Schedule New Trip - Assistant
        </Link>
        <Link href="#profile-and-settings" color="dodgerblue" role="link">
          Profile and Settings
        </Link>
        {mode === 'callcenter' &&
          <Link href="#accessibility" color="dodgerblue" role="link">
            Accessibility
          </Link>
        }
      </Flex>

      <Divider marginY={10} />

      <Flex id="faq" direction="column" aria-label="FAQ">
        <Heading as="h4" size="md">
          All Access App Troubleshooting FAQ
        </Heading>
        <Heading as="h5" size="sm">
          How to I download the app?
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Apple - link will be provided once in app store
            </Text>
          </ListItem>
          <ListItem>
            <Text>Android - link will be provided once in play store
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Advise travelers to allow notifications and location while using the application upon opening the downloaded app.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler needs assistance creating account and coordinator account
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Guide traveler to the <Link href="#sign-up" color="dodgerblue" role="link">Sign Up</Link> help section.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler has a login error
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Determine if it is a password error or user email error.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Advise the traveler to create new password.  Guide the traveler to the <Link href="#forgot-password" color="dodgerblue" role="link">Forgot Password</Link> help section if it is a password error.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Verify that the email they are providing is correct.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler cannot find the address or location while searching in the app or website.
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Verify that traveler is typing the address in the correct location in the mobile app or website - the From or To.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              If they cannot see the address, open Google to verify the address exists. If it does not, then direct the traveler to a nearby location with a valid place name or address; if it does, then notify Etch via the Issues Log to add the missing address in the geolocator.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler cannot track his/her location.
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Have the traveler go to location services on the settings of the mobile device.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Apple: Settings - Location Services (set to ON) - Complete Trip - While Using the App
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Android: Settings - Location - App Permissions (set to ON) - Complete Trip - Allowed Only While in Use
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Confirm that the traveler is using cellular data if WiFi is not available - note that cellular data is preferred over WiFi for more precise location.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler cannot hear voice commands.
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Have the traveler confirm that sound is on within the device.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Have the traveler confirm in the Accessibility settings that the "Voice On" is selected.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              For visually impaired users have the traveler confirm that the Voice Over feature is set within the traveler's device.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler needs to enlarge text on screen.
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              For mobile devices, this is done in the device Settings.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              For the website, guide the traveler to little blue button with the person on it to modify the settings.  Guide the traveler to the <Link href="#accessibility" color="dodgerblue" role="link">Accessibility</Link> help section.
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler is lost
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Ask if they set up travel coordinator then direct them to the coordinator.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              If they don’t then do the following:
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Ask the traveler where the closest intersection is that s/he can see.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    View public transit or Community Shuttle stops available near the location.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Direct the traveler to the closest transit stop with the route and schedule information to continue his/her trip by looking at the "routes near me" feature.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Direct the traveler, if close, to the Community Shuttle corridor and help book a trip.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Call <Link href="tel:+17168532222" color="dodgerblue" role="none">716-853-2222</Link>.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Traveler has problems with the kiosk
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text fontWeight="bold">Booking Community Shuttle</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  Verify that the traveler has a user account. If not, guide the traveler to create one.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Ask if the traveler has a phone number and PIN associated with the account.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Make sure the destination is within the service area of the shuttle (click …..).
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Guide the traveler on booking a trip in the <Link href="#nfta-community-shuttle" color="dodgerblue" role="link">Community Shuttle</Link> help section.
                </Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Traveler cannot book a trip.</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  Notify traveler that trips can only be planned and not booked unless utilizing the Community Shuttle only.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Notify traveler that trips with Community Shuttle can only be booked by registered users and follow steps for this in the previous section.
                </Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Traveler cannot see nearby transit information</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  Have traveler pan around the screen to see if results appear.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Have traveler exit the website and reopen.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  If no results, report to Etch (Issues log) to determine GTFS errors.
                </Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
        </UnorderedList>
        <Heading as="h5" size="sm" mt={10}>
          Community Shuttle
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text fontWeight="bold">
              Traveler cannot use the Community Shuttle.
            </Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  Verify that the traveler has booked a trip viewing the Community Shuttle software link.
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Verify that the origin and destination are within the service area by viewing the Community Shuttle software link at...
                </Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">
              Traveler thinks s/he missed the Community Shuttle
            </Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  Verify location of the shuttle by viewing the Community Shuttle software link… and notify the traveler of the shuttle location.
                </Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="sign-up" direction="column" aria-label="Sign Up">
        <Heading as="h4" size="md">
          Sign Up
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you don’t already have an account, click Sign Up.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter your information, agree to the terms and conditions, and
              click Create to make an account.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter the 6-digit code that was sent to your email and click
              Submit.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Resend the code if you did not receive the email.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture1.png" alt="Sign Up" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter your credentials and click Log In to access your new
              account.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Add your contact information as prompted and click Next.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter your home address and click Next.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    If you skip this step, you will have to enter your home
                    address when planning trips.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture2.png" alt="Log In" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              There is an ability to enter a primary coordinator for them to be
              able to track your trips. If that is wanted, enter their
              information and click Next. You may also choose to Skip that
              option.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Accessibility options can be specified. Click what is applicable
              and click Next.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    If you skip this step, they can be changed later in
                    settings.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>Enter the 6-digit code that was sent via email.</Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture3.png" alt="Enter Code" />
            </Text>
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="log-in" direction="column" aria-label="Login">
        <Heading as="h4" size="md">
          Log In
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you have already created an account, click Log In.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter your credentials and click Log In.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Verify your identity by selecting a method of receiving a code.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Enter the 6-digit code that was sent and click Submit.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture4.png" alt="Log In" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      {mode === 'callcenter' &&
        <>
          <Flex
            id="forgot-password"
            direction="column"
            aria-label="Forgot Password"
          >
            <Heading as="h4" size="md">
              Forgot Password
            </Heading>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>
                  If you have forgotten your password when trying to log in, click{" "}
                  <Text as="span" color="red" fontWeight="bold">
                    Forgot Password
                  </Text>
                  .
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Enter the email address you have created an account with, choose a
                  method to receive the code, and click{" "}
                  <Text as="span" color="red" fontWeight="bold">
                    Send Code
                  </Text>
                  .
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  Enter the 6-digit code that you received and enter a new password
                  according to the requirements. Click{" "}
                  <Text as="span" color="red" fontWeight="bold">
                    Submit
                  </Text>
                  .
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  If you did not receive a message with a code, click{" "}
                  <Text as="span" color="red" fontWeight="bold">
                    Send Another Code
                  </Text>
                  .
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  If you still did not receive the code, go through the process
                  again and confirm the information to contact you is correct.
                </Text>
              </ListItem>
              <ListItem>
                <Box>
                  <img src="./help_images/Picture7.png" alt="Forgot Password" />
                </Box>
              </ListItem>
            </UnorderedList>
          </Flex>

          <Divider marginY={10} />
        </>
      }

      <Flex id="nfta-community-shuttle" direction="column" aria-label="NFTA Community Shuttle">
        <Heading as="h4" size="md">
          NFTA Community Shuttle
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              The NFTA Community Shuttle is an on-demand shuttle service
              operated by the NFTA. It takes you within the Buffalo-Niagara
              Medical Campus vicinity.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Click the NTFA Community Shuttle button.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Inside the green border are the options for travel. As you move
              around on the screen, the location will move with it.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click Summon Shuttle when you have selected your pick-up location
              on the map.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter a location where you will be dropped off, the number of
              people riding, and click Confirm.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img src="./help_mobile_images/Picture5.png" alt="NFTA Shuttle" />
            </Text>
          </ListItem>
          <ListItem>
            <Text>Your Your shuttle trip information will be displayed.</Text>
          </ListItem>
          <ListItem>
            <Text>
              If you have questions or need assistance regarding your shuttle
              trip, you may call NFTA by pushing the
              <img
                src="./help_mobile_images/phone.png"
                alt="phone"
                class="phone"
              />{" "}
              button, which will display the number on the bottom of the screen.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Cancel the trip if you decide you no longer need shuttle services.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              If you push the exit button, you will be brought to the main
              screen.
            </Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture6.png" alt="NFTA Shuttle" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="upcoming-trips" direction="column" aria-label="Upcoming Trips">
        <Heading as="h4" size="md">
          Upcoming Trips
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              To view the booked trip or any other upcoming trips, you can click
              the icon on the bottom left of the screen.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              If you click See trip details, it will show you specifics.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              You may favorite a trip by clicking on the star, naming the trip,
              and selecting Save.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Clicking Go shows turn-by-turn navigation.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture7.png" alt="Upcoming Trips" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="trip-history" direction="column" aria-label="Trip History">
        <Heading as="h4" size="md">
          Trip History
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Clicking Trip History will take you to your trip log.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Under the Activity section, all trips you have taken will be
              listed.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Trips that have been favorited will be shown in the Favorites
              section.
            </Text>
          </ListItem>
          <ListItem>
            <img src="./help_mobile_images/Picture8.png" alt="Trip History" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="find-nearby-routes" direction="column" aria-label="Find Nearby Routes">
        <Heading as="h4" size="md">
          Find Nearby Routes
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              This option allows you to explore quickly without scheduling
              anything.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Start by panning to a location on the map.</Text>
          </ListItem>
          <ListItem>
            <Text>
              All routes in the vicinity will be shown and will update if panned
              to a different location on the map. They will be listed on the
              bottom.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              If you click a route, all the stops will show on the map.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              The map will pan to a stop if you click on one from the list.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture9.png"
              alt="Find Nearby Routes"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="schedule-new-trip" direction="column" aria-label="Schedule New Trip">
        <Heading as="h4" size="md">
          Schedule New Trip
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Click the Schedule New Trip button to book transportation.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Enter the locations, date, and time and click Next.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Travel times can be booked as:
                    <UnorderedList styleType="none" spacing={3}>
                      <ListItem>
                        <Text>Leave Now</Text>
                      </ListItem>
                      <ListItem>
                        <Text>Leave At</Text>
                      </ListItem>
                      <ListItem>
                        <Text>Arrive By</Text>
                      </ListItem>
                    </UnorderedList>
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              A location can be saved and assigned a nickname for future use.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture10.png"
              alt="Schedule New Trip"
            />
          </ListItem>
          <ListItem>
            <Text>
              Select the mode(s) of transportation you want for travel and click
              Submit.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Routes will be generated and show a list of options. Some walking
              with use of the bus may be required.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>Some walking with use of the bus may be required.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>You can select a route to preview it before scheduling.</Text>
          </ListItem>
          <ListItem>
            <Text>
              The details of the trip will be displayed in a list form as well
              as shown on the map. Click Schedule Trip or go back if you’d like
              to review other options.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture11.png"
              alt="Schedule New Trip"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="schedule-new-trip-assistant" direction="column" aria-label="Schedule New Trip Assistant">
        <Heading as="h4" size="md">
          Schedule New Trip - Assistant
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              In the Schedule a Trip area, you have an option to use speech
              recognition to book trips.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click the blue speech recognition tool to utilize that service.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Allow Complete Trip to access both speech recognition and the
              microphone.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Push the speech recognition button to begin speaking and
              interacting with the bot.
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture12.png"
              alt="Schedule New Trip – Assistant"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex id="profile-and-settings" direction="column" aria-label="Profile and Settings">
        <Heading as="h4" size="md">
          Profile and Settings
        </Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Profile Information
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Click Profile Information and it will display your
                    information.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Click Edit and Save for changes to your personal
                    information.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Your account can be deleted by clicking Delete Account,
                    typing the prompt, and clicking Delete Account once more.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture13.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Coordinators
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    This page will show coordinators associated with the
                    account.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Pending means that the person has not accepted this request
                    yet via email.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    To remove a coordinator, click the trash can icon and
                    confirm your request by selecting Delete.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    Additional coordinators can be invited by clicking Invite a
                    Coordinator, entering the necessary information, and
                    selecting Invite.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture14.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Favorites
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    This is where favorited trips and locations will appear.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    <Text display="flex" alignItems="center">
                      Clicking the{" "}
                      <img
                        src="./help_mobile_images/trash.png"
                        alt="trash"
                        class="trash"
                      />{" "}
                      button will remove it from the list.
                    </Text>
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture15.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              NFTA Paratransit Access Line (PAL) Direct Users
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    This will provide a direct link to schedule a PAL trip for
                    users who are eligible.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture16.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Terms and Conditions
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    The terms and conditions of usage will be listed on this
                    page.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture17.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Help
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    You will be directed to this document if you need any
                    assistance.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              <img
                src="./help_mobile_images/Picture18.png"
                alt="Profile and Settings"
              />
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Trip Preferences
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    This is where you can specify if you have special
                    accommodations that need to be accounted for when booking a
                    trip, such as wheelchair accessibility, the need for minimal
                    walking, and/or having a service animal.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text>
                    The number of transfers per trip can be modified, as well as
                    the preferred mode(s) of transport.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture19.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Accessibility
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    The option for verbal directions can be turned on or off, as
                    well as specifying the preferred display language.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture20.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Notifications
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    This is where you can customize preferences about trip
                    notifications.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture21.png"
              alt="Profile and Settings"
            />
          </ListItem>
          <ListItem>
            <Text>
              Password
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>
                    Your password may be changed to something new on this page
                    by entering the prompted information and clicking Submit.
                  </Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img
              src="./help_mobile_images/Picture22.png"
              alt="Profile and Settings"
            />
          </ListItem>
        </UnorderedList>
      </Flex>

      {mode === 'callcenter' &&
        <>
          <Divider marginY={10} />

          <Flex id="accessibility" direction="column" aria-label="Accessibility">
            <Heading as="h4" size="md">
              Accessibility
            </Heading>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Settings</Text>
                <UnorderedList styleType="none" spacing={3}>
                  <ListItem>
                    <Text>
                      Things like contrast, cursor and font size, letter spacing,
                      and language can be modified quickly for better usability.
                    </Text>
                  </ListItem>
                </UnorderedList>
              </ListItem>
              <ListItem>
                <Box>
                  <img src="./help_images/Picture25.png" alt="Accessibility" />
                </Box>
              </ListItem>
            </UnorderedList>
          </Flex>
        </>
      }

    </Flex>
  );
};

export default HelpMobile;
