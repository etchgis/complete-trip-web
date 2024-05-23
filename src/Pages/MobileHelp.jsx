import { ListItem, UnorderedList } from "@chakra-ui/react";

const MobileHelp = () => {
  return (
    <div>
      <p>Phone number of Call Center: <a href="tel:+17168884600" style={{ color: 'dodgerblue' }}>716-888-4600</a></p>
      <p>Hours of Operation: Monday -Friday, from 6:00 AM to 7:00 PM EST</p>
      <UnorderedList>
        <ListItem>
          Sign Up
          <UnorderedList>
            <ListItem>If you don’t already have an account, click Sign Up.</ListItem>
            <ListItem>
              Enter your information, agree to the terms and conditions, and click
              Create to make an account.
            </ListItem>
            <ListItem>
              Enter the 6-digit code that was sent to your email and click Submit.
              <UnorderedList>
                <ListItem>Resend the code if you did not receive the email.</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture1.png" alt="Sign Up" />
            </ListItem>
            <ListItem>
              Enter your credentials and click Log In to access your new account.
            </ListItem>
            <ListItem>Add your contact information as prompted and click Next.</ListItem>
            <ListItem>
              Enter your home address and click Next.
              <UnorderedList>
                <ListItem>
                  If you skip this step, you will have to enter your home address
                  when planning trips.
                </ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
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
              <UnorderedList>
                <ListItem>
                  If you skip this step, they can be changed later in settings.
                </ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>Enter the 6-digit code that was sent via email.</ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture3.png" alt="Enter Code" />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Log In
          <UnorderedList>
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
        </ListItem>
        <ListItem>
          NFTA Community Shuttle
          <UnorderedList>
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
            <ListItem>
              Click Summon Shuttle when you have selected your pick-up location on
              the map.
            </ListItem>
            <ListItem>
              Enter a location where you will be dropped off, the number of people
              riding, and click Confirm.
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture5.png" alt="NFTA Shuttle" />
            </ListItem>
            <ListItem>Your Your shuttle trip information will be displayed.</ListItem>
            <ListItem>
              If you have questions or need assistance regarding your shuttle
              trip, you may call NFTA by pushing the
              <img src="./mobile_help_images/phone.png" alt="phone" class="phone" /> button,
              which will display the number on the bottom of the screen.
            </ListItem>
            <ListItem>
              Cancel the trip if you decide you no longer need shuttle services.
            </ListItem>
            <ListItem>
              If you push the exit button, you will be brought to the main screen.
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture6.png" alt="NFTA Shuttle" />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Upcoming Trips
          <UnorderedList>
            <ListItem>
              To view the booked trip or any other upcoming trips, you can click
              the icon on the bottom left of the screen.
            </ListItem>
            <ListItem>If you click See trip details, it will show you specifics.</ListItem>
            <ListItem>
              You may favorite a trip by clicking on the star, naming the trip,
              and selecting Save.
            </ListItem>
            <ListItem>Clicking Go shows turn-by-turn navigation.</ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture7.png" alt="Upcoming Trips" />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Trip History
          <UnorderedList>
            <ListItem>Clicking Trip History will take you to your trip log.</ListItem>
            <ListItem>
              Under the Activity section, all trips you have taken will be listed.
            </ListItem>
            <ListItem>
              Trips that have been favorited will be shown in the Favorites
              section.
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img src="./mobile_help_images/Picture8.png" alt="Trip History" />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Find Nearby Routes
          <UnorderedList>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture9.png"
                alt="Find Nearby Routes"
              />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Schedule New Trip
          <UnorderedList>
            <ListItem>Click the Schedule New Trip button to book transportation.</ListItem>
            <ListItem>
              Enter the locations, date, and time and click Next.
              <UnorderedList>
                <ListItem>
                  Travel times can be booked as:
                  <UnorderedList>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture10.png"
                alt="Schedule New Trip"
              />
            </ListItem>
            <ListItem>
              Select the mode(s) of transportation you want for travel and click
              Submit.
            </ListItem>
            <ListItem>
              Routes will be generated and show a list of options. Some walking
              with use of the bus may be required.
              <UnorderedList>
                <ListItem>Some walking with use of the bus may be required.</ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem>You can select a route to preview it before scheduling.</ListItem>
            <ListItem>
              The details of the trip will be displayed in a list form as well as
              shown on the map. Click Schedule Trip or go back if you’d like to
              review other options.
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture11.png"
                alt="Schedule New Trip"
              />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Schedule New Trip – Assistant
          <UnorderedList>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture12.png"
                alt="Schedule New Trip – Assistant"
              />
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Profile and Settings
          <UnorderedList>
            <ListItem>
              Profile Information
              <UnorderedList>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture13.png"
                alt="Profile and Settings"
              />
            </ListItem>
            <ListItem>
              Coordinators
              <UnorderedList>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture14.png"
                alt="Profile and Settings"
              />
            </ListItem>
            <ListItem>
              Favorites
              <UnorderedList>
                <ListItem>This is where favorited trips and locations will appear.</ListItem>
                <ListItem>
                  Clicking the
                  <img src="./mobile_help_images/trash.png" alt="trash" class="trash" /> button
                  will remove it from the list.
                </ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture15.png"
                alt="Profile and Settings"
              />
            </ListItem>
            <ListItem>
              NFTA Paratransit Access Line (PAL) Direct Users
              <UnorderedList>
                <ListItem>
                  o This will provide a direct link to schedule a PAL trip for
                  users who are eligible.
                </ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture16.png"
                alt="Profile and Settings"
              />
            </ListItem>
            <ListItem>
              Terms and Conditions
              <UnorderedList>
                <ListItem>
                  The terms and conditions of usage will be listed on this page.
                </ListItem>
              </UnorderedList>
            </ListItem>
            <ListItem style={{ listStyle: 'none' }}>
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
            <ListItem style={{ listStyle: 'none' }}>
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
            <ListItem style={{ listStyle: 'none' }}>
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
            <ListItem style={{ listStyle: 'none' }}>
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
            <ListItem style={{ listStyle: 'none' }}>
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
            <ListItem style={{ listStyle: 'none' }}>
              <img
                src="./mobile_help_images/Picture22.png"
                alt="Profile and Settings"
              />
            </ListItem>
          </UnorderedList>
        </ListItem>
      </UnorderedList>
    </div>
  )
};

export default MobileHelp;