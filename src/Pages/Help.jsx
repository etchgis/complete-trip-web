import { Divider, Flex, Heading, Link, List, ListItem, Text, UnorderedList } from "@chakra-ui/react";

const Help = () => {
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
        <br />
        <p>Hours of Operation</p>
        <p>Monday - Friday, 6:00 AM to 7:00 PM EST</p>
      </Flex>

      <Divider marginY={10} />

      <Flex
        direction="column"
      >
        <Link href="#location" color="dodgerblue">Location</Link>
        <Link href="#sign-up" color="dodgerblue">Sign Up</Link>
        <Link href="#login" color="dodgerblue">Login</Link>
        <Link href="#forgot-password" color="dodgerblue">Forgot Password</Link>
        <Link href="#continue-as-guest" color="dodgerblue">Continue as Guest</Link>
        <Link href="#find-nearby-routes" color="dodgerblue">Find Nearby Routes</Link>
        <Link href="#schedule-a-trip" color="dodgerblue">Schedule a Trip</Link>
        <Link href="#home" color="dodgerblue">Home</Link>
        <Link href="#trip-activity" color="dodgerblue">Trip Activity</Link>
        <Link href="#profile-and-settings" color="dodgerblue">Profile and Settings</Link>
        <Link href="#feedback" color="dodgerblue">Feedback</Link>
        <Link href="#accessibility" color="dodgerblue">Accessibility</Link>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="location"
        direction="column"
      >
        <Heading as="h4" size="md">Location</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>
              Visit <Link href="https://completetrip.etch.app" color="red" fontWeight="bold">https://completetrip.etch.app</Link> to access the website.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Once on the website, allow location services by clicking <Text as="span" color="red" fontWeight="bold">Allow on every visit</Text>.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture1.png" alt="Location" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="sign-up"
        direction="column"
      >
        <Heading as="h4" size="md">Sign Up</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you don't already have an account, click <Text as="span" color="red" fontWeight="bold">Login/Sign Up</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>On the pop-up screen, click <Text as="span" color="red" fontWeight="bold">Sign Up</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter your personal information to create an account.</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Your password must meet certain requirements to move forward. As shown below, the unmet requirements will begin as red and will turn green as they are met, indicating success.</Text>
              </ListItem>
              <ListItem>
                <Text display="flex" alignItems="center">Toggling the <img src="./help_images/eye.png" alt="eye" class="trash" /> button will either show or hide your password.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text>Click <Text as="span" color="red" fontWeight="bold">terms and conditions</Text> and once you click <Text as="span" color="red" fontWeight="bold">Accept</Text>, the box will automatically check.</Text>
          </ListItem>
          <ListItem>
            <Text>Click <Text as="span" color="red" fontWeight="bold">Create Account</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>If you remember that you had previously created an account, you can click <Text as="span" color="red" fontWeight="bold">Login</Text> at the bottom of the pop-up screen.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture2.png" alt="Login/Sign Up" />
          </ListItem>
          <ListItem>
            <Text>Enter the 6-digit code that was sent to your email account.</Text>
          </ListItem>
          <ListItem>
            <Text>You will be prompted to login once your account has been created. Enter your credentials and click <Text as="span" color="red" fontWeight="bold">Login</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Add contact information for two-step verification purposes. Your email address will pre-populate and you will just need to enter your phone number and click <Text as="span" color="red" fontWeight="bold">Next</Text>.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture3.png" alt="Verify" />
          </ListItem>
          <ListItem>
            <Text>The next screen will prompt you to add your home address and click <Text as="span" color="red" fontWeight="bold">Next</Text>.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>If you skip this step, you will have to enter your home address when planning trips.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <Text>There is an ability to enter a primary coordinator for them to be able to track your trips. If that is wanted, enter their information and click <Text as="span" color="red" fontWeight="bold">Next</Text>. You may also choose to <Text as="span" color="red" fontWeight="bold">Skip</Text> that option.</Text>
          </ListItem>
          <ListItem>
            <Text>Accessibility options can be specified. Click what is applicable and click <Text as="span" color="red" fontWeight="bold">Next</Text>.
              <UnorderedList styleType="none" spacing={3}>
                <ListItem>
                  <Text>If you skip this step, they can be changed later in settings.</Text>
                </ListItem>
              </UnorderedList>
            </Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture4.png" alt="Address and Coordinator" />
          </ListItem>
          <ListItem>
            <Text>The next screen will confirm your information and that of your primary coordinator. <Text as="span" color="red" fontWeight="bold">Click Verify your phone number to continue</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Once that is verified, a 6-digit code will be sent to your email. Enter the code.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture5.png" alt="Verify" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="login"
        direction="column"
      >
        <Heading as="h4" size="md">Login</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you have already created an account, click <Text as="span" color="red" fontWeight="bold">Login/Sign Up</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>On the pop-up screen, click <Text as="span" color="red" fontWeight="bold">Login</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter your credentials and click <Text as="span" color="red" fontWeight="bold">Login</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Toggling the <img src="./help_images/eye.png" alt="eye" class="trash" /> button will either show or hide your password.</Text>
          </ListItem>
          <ListItem>
            <Text>If you remember that you haven’t previously created an account, you can click <Text as="span" color="red" fontWeight="bold">Create Account</Text> at the bottom of the pop-up screen.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture6.png" alt="Login" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="forgot-password"
        direction="column"
      >
        <Heading as="h4" size="md">Forgot Password</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you have forgotten your password when trying to log in, click <Text as="span" color="red" fontWeight="bold">Forgot Password</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter the email address you have created an account with, choose a method to receive the code, and click <Text as="span" color="red" fontWeight="bold">Send Code</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter the 6-digit code that you received and enter a new password according to the requirements. Click <Text as="span" color="red" fontWeight="bold">Submit</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>If you did not receive a message with a code, click <Text as="span" color="red" fontWeight="bold">Send Another Code</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>If you still did not receive the code, go through the process again and confirm the information to contact you is correct.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture7.png" alt="Forgot Password" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="continue-as-guest"
        direction="column"
      >
        <Heading as="h4" size="md">Continue as Guest</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>By clicking <Text as="span" color="red" fontWeight="bold">Continue as Guest</Text> allows a user to preview routes, but they will be unable to schedule a trip.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture8.png" alt="Guest Trip Planning" />
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
            <Text>This option allows you to explore quickly without scheduling anything.</Text>
          </ListItem>
          <ListItem>
            <Text>Start by panning to a location on the map or by entering it in the search box.</Text>
          </ListItem>
          <ListItem>
            <Text>All routes in the vicinity will be shown and will update if panned to a different location on the map. They will be listed on the left.</Text>
          </ListItem>
          <ListItem>
            <Text>If you click a route, all the stops will show on the map and listed on the left side with details.</Text>
          </ListItem>
          <ListItem>
            <Text>The map will pan to a stop if you click on one from the list.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture9.png" alt="Find Nearby Routes" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="schedule-a-trip"
        direction="column"
      >
        <Heading as="h4" size="md">Schedule a Trip</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Click the <Text as="span" color="red" fontWeight="bold">Schedule a Trip</Text> button to book transportation.</Text>
          </ListItem>
          <ListItem>
            <Text>Enter the locations, date, and time and click <Text as="span" color="red" fontWeight="bold">Next</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Travel times can be booked as:</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Leave Now (ASAP)</Text>
              </ListItem>
              <ListItem>
                <Text>Leave At</Text>
              </ListItem>
              <ListItem>
                <Text>Arrive By</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text>A location can be saved and assigned a nickname for future use.</Text>
          </ListItem>
          <ListItem display="flex" alignItems="center">
            <img src="./help_images/Picture10.png" alt="Save a Location" />
            <img src="./help_images/Picture11.png" alt="Trip Assistant" />
          </ListItem>
          <ListItem>
            <Text>Select the mode(s) of transportation you want for travel and click <Text as="span" color="red" fontWeight="bold">Next</Text>.</Text>
          </ListItem>
          <ListItem>
            <Text>Routes will be generated and show a list of options.</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Some walking with use of the bus may be required.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text>You can select a route to preview it before scheduling.</Text>
          </ListItem>
          <ListItem>
            <Text>The details of the trip will be displayed in a list form as well as shown on the map. Click <Text as="span" color="red" fontWeight="bold">Schedule a Trip</Text> or <Text as="span" color="red" fontWeight="bold">Previous</Text> if you’d like to review other options.</Text>
          </ListItem>
          <ListItem>
            <Text>A notification will show that the trip was successfully scheduled.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture12.png" alt="Schedule a Trip" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="home"
        direction="column"
      >
        <Heading as="h4" size="md">Home</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>On the home page, any scheduled trips will be displayed.</Text>
          </ListItem>
          <ListItem>
            <Text>Trips can be favorited by clicking the star next to the trip.</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Give the trip a name and click <Text as="span" color="red" fontWeight="bold">Save as Favorite</Text>.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <Text>You can click on the trip to preview the details or cancel it.</Text>
          </ListItem>
          <ListItem display="flex" alignItems="center">
            <img src="./help_images/Picture13.png" alt="Save as Favorite" />
            <img src="./help_images/Picture14.png" alt="View Saved Trip" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="trip-activity"
        direction="column"
      >
        <Heading as="h4" size="md">Trip Activity</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>On this screen, you’ll be able to view past and upcoming trips.</Text>
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
            <Text>Profile Information</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Your information will be displayed here.</Text>
              </ListItem>
              <ListItem>
                <Text>Click <Text as="span" color="red" fontWeight="bold">Edit Profile</Text> and <Text as="span" color="red" fontWeight="bold">Save</Text> for changes to your personal information.</Text>
              </ListItem>
              <ListItem>
                <Text>Your account can be deleted by clicking <Text as="span" color="red" fontWeight="bold">Delete Account</Text>, typing the prompt, and clicking <Text as="span" color="red" fontWeight="bold">Delete Account</Text> once more.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem display="flex" alignItems="center">
            <img src="./help_images/Picture15.png" alt="Profile Information" />
          </ListItem>
          <ListItem>
            <Text>Coordinators</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>This page will show coordinators associated with the account.</Text>
              </ListItem>
              <ListItem>
                <Text>Pending means that the person has not accepted this request yet via email.</Text>
              </ListItem>
              <ListItem>
                <Text>To remove a coordinator, click <Text as="span" color="red" fontWeight="bold">Remove this Coordinator</Text> and confirm your request by selecting <Text as="span" color="red" fontWeight="bold">Remove</Text>.</Text>
              </ListItem>
              <ListItem>
                <Text>Additional coordinators can be invited by clicking <Text as="span" color="red" fontWeight="bold">Invite a Coordinator</Text>, entering the necessary information, and selecting <Text as="span" color="red" fontWeight="bold">Invite a Coordinator</Text> once more.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture16.png" alt="Coordinators" />
          </ListItem>
          <ListItem>
            <Text>Favorites</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>This is where favorited trips and locations will appear.</Text>
              </ListItem>
              <ListItem>
                <Text>Clicking the <img src="./help_images/trash.png" alt="trash" /> button will remove it from the list.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture17.png" alt="Favorites" />
          </ListItem>
          <ListItem>
            <Text>NFTA PAL Direct Users</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>This will provide a direct link to schedule a PAL trip for users who are eligible.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture18.png" alt="NFTA PAL Direct Users" />
          </ListItem>
          <ListItem>
            <Text>Terms and Conditions</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>The terms and conditions will be listed on this page.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture19.png" alt="Terms and Conditions" />
          </ListItem>
          <ListItem>
            <Text>Trip Preferences</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>This is where you can specify if you have special accommodations that need to be accounted for when booking a trip, such as wheelchair accessibility, the need for minimal walking, and/or having a service animal.</Text>
              </ListItem>
              <ListItem>
                <Text>The number of transfers per trip can be modified, as well as the preferred mode(s) of transportation.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture20.png" alt="Trip Preferences" />
          </ListItem>
          <ListItem>
            <Text>Accessibility</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>The option for verbal directions can be turned on or off, as well as specifying the preferred display language.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture21.png" alt="Accessibility" />
          </ListItem>
          <ListItem>
            <Text>Notifications</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>This is where you can customize preferences about trip notifications.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture22.png" alt="Notifications" />
          </ListItem>
          <ListItem>
            <Text>Password</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Your password may be changed to something new on this page by entering the prompted information and clicking <Text as="span" color="red" fontWeight="bold">Change Password</Text>.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture23.png" alt="Password" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="feedback"
        direction="column"
      >
        <Heading as="h4" size="md">Feedback</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>If you wish to suggest changes to the website or report any issues, you may do so by filling out the feedback tool.</Text>
          </ListItem>
          <ListItem>
            <Text>Check whether or not you’d like to be contacted if there are any additional questions.</Text>
          </ListItem>
          <ListItem>
            <Text>Select the appropriate section from the drop-down menu.</Text>
          </ListItem>
          <ListItem>
            <Text>Type the necessary information and click <Text as="span" color="red" fontWeight="bold">Submit</Text>.</Text>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture24.png" alt="Feedback" />
          </ListItem>
        </UnorderedList>
      </Flex>

      <Divider marginY={10} />

      <Flex
        id="accessibility"
        direction="column"
      >
        <Heading as="h4" size="md">Accessibility</Heading>
        <UnorderedList styleType="none" spacing={3}>
          <ListItem>
            <Text>Settings</Text>
            <UnorderedList styleType="none" spacing={3}>
              <ListItem>
                <Text>Things like contrast, cursor and font size, letter spacing, and language can be modified quickly for better usability.</Text>
              </ListItem>
            </UnorderedList>
          </ListItem>
          <ListItem>
            <img src="./help_images/Picture25.png" alt="Accessibility" />
          </ListItem>
        </UnorderedList>
      </Flex>

    </Flex>
  )
};

export default Help;