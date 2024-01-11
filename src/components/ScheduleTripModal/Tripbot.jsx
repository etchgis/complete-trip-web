import { Box, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import config from '../../config';
import geocode from '../../services/transport/geocoder';
import { getLocation } from '../../utils/getLocation';
import { observer } from 'mobx-react-lite';
import sampleChatResponse from './sample-chat-response.json';
import { useStore } from '../../context/RootStore';

//18 Goethe St, Buffalo, NY 14206
//to go
//208 Hayes Rd, Buffalo, NY 14260
//swan st diner

const url = 'https://staging.lambda.etch.app/assistant/chat';
const key = 'yLrNscPcue6wga2Q8fijx4gqAkL6LHUvZkJi63Hi';

//token is the user's access token
const Tripbot = observer(({ setSelectedTrip, setStep, stagedTrip }) => {
  const [location, setLocation] = useState([
    config.MAP.CENTER[1],
    config.MAP.CENTER[0],
  ]);
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const { hasSelectedPlan, setHasSelectedPlan } = useStore().uiStore;
  const [chat, setChat] = useState([
    {
      bot: "Hello! I'm here to help you schedule your ride. Let's get started.",
      user: '',
    },
  ]);
  const { accessToken } = useStore().authentication;

  useEffect(() => {
    (async () => {
      try {
        const userLocation = await getLocation();
        const center = userLocation?.center || null;
        if (center) {
          console.log('[tripbot] using user location', center);
          setLocation(center);
        }
      } catch (error) {
        console.log('[tripbot] error getting user location', error);
      }
      try {
        const address = await geocode.reverse({
          lng: location[0],
          lat: location[1],
        });
        if (address && address.length) {
          console.log(
            "[tripbot] using user's geocoded address\n",
            address[0]?.title
          );
          setAddress(address[0]?.title || '');
        }
      } catch (error) {
        console.log('[tripbot] error getting user address', error);
      }
    })();
  }, []);

  const fetchChat = async (message, token) => {
    try {
      setIsThinking(true);
      const body = {
        message: message,
        origin: {
          lat: location[1],
          lng: location[0],
          address: address || '',
          // lat: config.MAP.CENTER[0],
          // lng: config.MAP.CENTER[1],
        },
        center: {
          lat: config.MAP.CENTER[0],
          lng: config.MAP.CENTER[1],
        },
      };
      if (chat.length === 1) {
        body.shouldReset = true;
      }
      //8 John Paul Ct, Buffalo, NY 14206
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': key,
        },
        body: JSON.stringify(body),
      });
      setIsThinking(false);
      return await response.json();
    } catch (error) {
      console.log('{tripbot} - fetch error', error);
      return {};
    }
  };

  const selectTrip = async (stagedTrip, tripResponse) => {
    console.log(stagedTrip);
    console.log(tripResponse);
    if (
      !tripResponse ||
      !tripResponse?.request ||
      !tripResponse?.request?.origin ||
      !tripResponse?.request?.destination ||
      !tripResponse?.plan ||
      !tripResponse?.request?.when ||
      !tripResponse?.plan?.legs ||
      !tripResponse?.plan?.legs?.length
    )
      throw new Error('Invalid trip response');

    if (!tripResponse?.request?.origin?.title) {
      tripResponse.request.origin.title =
        tripResponse?.request?.origin?.address ||
        tripResponse?.request?.origin?.text ||
        '';
    }
    if (!tripResponse?.request?.destination?.title) {
      tripResponse.request.destination.title =
        tripResponse?.request?.destination?.address ||
        tripResponse?.request?.destination?.text ||
        '';
    }
    if (!tripResponse?.request?.origin?.description) {
      tripResponse.request.origin.description = '';
    }
    if (!tripResponse?.request?.destination?.description) {
      tripResponse.request.destination.description = '';
    }

    stagedTrip.updateOrigin(tripResponse?.request?.origin);
    stagedTrip.updateDestination(tripResponse?.request?.destination);
    // stagedTrip.updateWhenAction(null); //TODO add leave, arrive
    stagedTrip.updateWhen(tripResponse?.request?.when);
    // if (data.get('riders')) {
    //   trip.updateProperty('riders', +data.get('riders'));
    // }
    // if (data.get('caretaker')) {
    //   trip.updateProperty('caretaker', data.get('caretaker'));
    // }

    setSelectedTrip(tripResponse?.plan);
    setHasSelectedPlan(true);
  };

  const handleChat = async input => {
    if (!input) return;
    //NOTE temp testing patch for non-working chat API
    if (input.toLowerCase().trim() === 'use sample trip') {
      // setChatbot(chat); //not we are now not saving the chat
      setHasSelectedPlan(false);
      selectTrip(stagedTrip, sampleChatResponse);
      return;
    }

    const response = await fetchChat(input, accessToken);
    console.log(response);

    if (!response || !response?.response) {
      setIsThinking(false);
      if (errors > 2) {
        setChat(state => [
          ...state,
          {
            bot: 'Sorry, the bot is experiencing issues. Please try again later.',
            user: '',
          },
        ]);
        setTimeout(() => {
          setStep(0);
        }, 1000);
        return;
      }
      setErrors(e => e + 1);
      console.log({ errors });
      setChat(state => [
        ...state,
        {
          bot: 'Sorry, I am having trouble. Can you try again?',
          user: '',
        },
      ]);
      return;
    }
    if (response.isFinalResponse) {
      console.log('{tripbot} -- final response');
      console.log(response);
      try {
        selectTrip(stagedTrip, response?.response);
      } catch (error) {
        console.log('{tripbot} - ', error);
        setErrors(e => e + 1);
        setChat(state => [
          ...state,
          {
            bot: 'Sorry, I am having trouble. Can you please try again?',
            user: '',
          },
        ]);
      }
      return;
    } else {
      setChat(state => [...state, { bot: response.response, user: '' }]);
    }
  };
  console.log(chat);

  useEffect(() => {
    console.log({ hasSelectedPlan });
    console.log({ stagedTrip });
    if (!hasSelectedPlan) return;
    if (!stagedTrip?.request?.destination) return;
    setStep(3);
    //eslint-disable-next-line
  }, [hasSelectedPlan]);

  return (
    <Flex
      flex={1}
      flexDir={'column'}
      alignItems={'flex-start'}
      p={6}
      border="solid thin"
      borderColor="gray.200"
      m={10}
      borderRadius={10}
      w="600px"
      maxW={'calc(100% - 6rem)'}
    >
      {chat.map((message, i) => (
        <Flex flexDir="column" key={i.toString()} w="100%">
          {message.bot && (
            <Text alignSelf={'flex-start'} textAlign={'left'}>
              {message.bot}
            </Text>
          )}
          {message.user && (
            <Text as="em" alignSelf={'flex-end'} textAlign={'right'} py={2}>
              {message.user}
            </Text>
          )}
        </Flex>
      ))}
      {isThinking && (
        <Spinner alignSelf={'flex-start'} size="sm" color="gray.500" />
      )}
      <Box flex={1}></Box>
      <Box
        mt={10}
        as="form"
        width="100%"
        onSubmit={e => {
          e.preventDefault();
          const data = new FormData(e.target);
          const tripbot = data.get('tripbot');
          console.log(tripbot);
          if (!tripbot) return;
          e.target.reset();
          setChat([
            ...chat,
            {
              bot: '',
              user: tripbot,
            },
          ]);
          handleChat(tripbot);
        }}
      >
        <Input
          w="100%"
          type="text"
          placeholder="Where would you like to go?"
          name="tripbot"
        ></Input>
      </Box>
    </Flex>
  );
});

export { Tripbot };
