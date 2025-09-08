import { Box, Flex, Input, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';

import config from '../../config';
import geocode from '../../services/transport/geocoder';
import { getLocation } from '../../utils/getLocation';
import { observer } from 'mobx-react-lite';
import sampleChatResponse from '../ScheduleTripModal/sample-chat-response.json';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { buildUserContext } from '../../types/MobilityAssistant';

//18 Goethe St, Buffalo, NY 14206
//to go
//208 Hayes Rd, Buffalo, NY 14260
//swan st diner

// Use assistant configuration from config
const url = config.SERVICES.assistant.url;
const key = config.SERVICES.assistant.xApiKey;

//token is the user's access token
const Tripbot = observer(({ setSelectedTrip, setStep, stagedTrip }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [location, setLocation] = useState([
    config.MAP.CENTER[1],
    config.MAP.CENTER[0],
  ]);
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const { hasSelectedPlan, setHasSelectedPlan } = useStore().uiStore;
  const [chat, setChat] = useState([]);
  const [chatState, setChatState] = useState({});
  const { accessToken, user } = useStore().authentication;

  useEffect(() => {
    setChat(() => [
      {
        bot: t('tripbot.greeting'),
        user: '',
      },
    ]);
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when chat updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isThinking]);

  useEffect(() => {
    (async () => {
      try {
        const userLocation = await getLocation();
        const center = userLocation?.center || null;
        if (center) {
          console.log('[tripbot] using user location\n', center);
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
          console.log('[tripbot] geocoded address\n', address[0]?.title);
          setAddress(address[0]?.title || '');
        }
      } catch (error) {
        console.log('[tripbot] error getting user address\n', error);
      }
    })();
  }, []);

  const fetchChat = async (message, token) => {
    try {
      setIsThinking(true);
      const body = {
        message: message,
        // Send current location data (from geolocation or fallback)
        currentLocation: location[0] && location[1] ? {
          lat: location[1],
          lng: location[0],
          address: address || ''
        } : null,
        center: {
          lat: config.MAP.CENTER[0],
          lng: config.MAP.CENTER[1],
        },
        userContext: buildUserContext(user), // Includes home address
        state: chatState,
        timezone: user?.organizations?.[0]?.timezone || 'America/New_York',
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
      console.log('[tripbot] - fetch error', error);
      return {};
    }
  };

  //TODO the bot is not sending back a trip plan in the response
  const selectTrip = async (stagedTrip, tripResponse) => {
    console.log('[tripbot] selecting trip \n', { tripResponse });
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
      throw new Error('[tripbot] Invalid trip response');

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
    setHasSelectedPlan(true); //NOTE this is used to triggger the next step
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
    console.log('[tripbot]', response);

    if (
      !response ||
      !response?.response ||
      (!response?.response?.state?.assistantAnswer &&
        !response?.isFinalResponse)
    ) {
      setIsThinking(false);
      if (errors > 2) {
        setChat(state => [
          ...state,
          {
            bot: t('tripbot.error1'),
            user: '',
          },
        ]);
        setTimeout(() => {
          setStep(0);
        }, 1000);
        return;
      }
      setErrors(e => e + 1);
      setChat(state => [
        ...state,
        {
          bot: t('tripbot.error2'),
          user: '',
        },
      ]);
      return;
    }
    if (response.isFinalResponse) {
      console.log('[tripbot] final response');
      console.log(response);
      try {
        selectTrip(stagedTrip, response?.response);
      } catch (error) {
        console.log('[tripbot] error\n', error);
        setErrors(e => e + 1);
        setChat(state => [
          ...state,
          {
            bot: t('tripbot.error2'),
            user: '',
          },
        ]);
      }
      return;
    } else {
      //TODO this could be optimized into one state but this will work for now
      setChat(state => [
        ...state,
        { bot: response.response?.state?.assistantAnswer, user: '' },
      ]);
      setChatState(() => ({ ...response.response?.state }));
    }
  };

  useEffect(() => {
    if (!hasSelectedPlan) return;
    console.log('[tripbot] has selected plan');
    console.log({ hasSelectedPlan });
    console.log({ stagedTrip });
    if (!stagedTrip?.request?.destination) {
      console.log('[tripbot] Trip has no destination!');
      setErrors(e => e + 1);
      return;
    }
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
      onClick={() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }}
      cursor="text"
      overflowY="auto"
      maxH="70vh"
    >
      {chat.map((message, i) => (
        <Flex flexDir="column" key={i.toString()} w="100%" mb={3}>
          {message.bot && (
            <Box
              alignSelf={'flex-start'}
              bg="gray.50"
              p={3}
              borderRadius="lg"
              maxW="85%"
            >
              <Text textAlign={'left'} whiteSpace="pre-wrap">
                {message.bot}
              </Text>
            </Box>
          )}
          {message.user && (
            <Box
              alignSelf={'flex-end'}
              bg="brand"
              color="white"
              p={3}
              borderRadius="lg"
              maxW="85%"
              mt={2}
            >
              <Text textAlign={'right'} whiteSpace="pre-wrap">
                {message.user}
              </Text>
            </Box>
          )}
        </Flex>
      ))}
      {isThinking && (
        <Spinner alignSelf={'flex-start'} size="sm" color="gray.500" />
      )}
      <div ref={chatEndRef} />
      <Box flex={1}></Box>
      <Box
        mt={10}
        as="form"
        width="100%"
        onClick={e => e.stopPropagation()}
        onSubmit={e => {
          e.preventDefault();
          const data = new FormData(e.target);
          const tripbot = data.get('tripbot');
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
          ref={inputRef}
          w="100%"
          type="text"
          placeholder={t('tripWizard.chatbotPlaceholder')}
          name="tripbot"
          autoFocus
        ></Input>
      </Box>
    </Flex>
  );
});

export { Tripbot };
