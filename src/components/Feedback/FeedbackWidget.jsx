import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';

import { EditLanguage } from '../Settings/EditAccessibility';
import { FaRegCommentDots } from 'react-icons/fa';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import config from '../../config';
import { useRef, useState } from 'react';
import { set } from 'lodash';
import feedback from '../../services/transport/feedback';

const FeedbackWidget = ({ showTitle }) => {
  const { t } = useTranslation();
  const store = useStore();
  const [includeEmail, setIncludeEmail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(config.FEEDBACK.categories[0]);
  const [feedbackText, setFeedbackText] = useState('');

  const { onOpen, onClose, isOpen } = useDisclosure();
  const popoverRef = useRef();

  const handleSubmitPress = async () => {
    const accessToken = await store.authentication.fetchToken();
    const email = await store.authentication?.user?.email;
    feedback.add(
      feedbackText,
      'general',
      includeEmail ? email : null,
      null,
      selectedCategory,
      null,
      null,
      accessToken
    );
    setFeedbackText('');
    setSelectedCategory(config.FEEDBACK.categories[0]);
    setIncludeEmail(false);
  }

  return (
    <Tooltip label={t('sidebar.feedback')}>
      <Box>
        <Popover
          placement={showTitle ? 'bottom' : 'right-end'}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          closeOnBlur={false}
          initialFocusRef={popoverRef}
        >
          <PopoverTrigger>
            <Button
              className="icon-button"
              aria-label={t('sidebar.feedback')}
              variant={'ghost'}
              width="100%"
              color="brand"
              fontSize="22px"
              _hover={{
                background: 'gray.50',
                boxShadow: '0 0 0 3px rgba(0, 91, 204, 0.5)',
              }}
              justifyContent={showTitle ? 'flex-start' : 'center'}
              leftIcon={
                <FaRegCommentDots
                  fontSize="32px"
                  style={{ marginRight: showTitle ? 0 : '-0.5rem' }}
                />
              }
            >
              {showTitle && t('sidebar.feedback')}
            </Button>
          </PopoverTrigger>
          <PopoverContent boxShadow="xl" w={500}>
            {/* <FocusLock returnFocus persistentFocus={false}> */}
            <PopoverArrow />
            <PopoverCloseButton fontSize={'16px'} m={1} />
            <PopoverHeader>
              <Heading as="h3" size="md" margin="0.5">
                {t('feedbackWidget.title')}
              </Heading>
            </PopoverHeader>
            <PopoverBody>
              <SimpleGrid columns={1} spacing={2}>
                <Checkbox
                  name={'includeEMail'}
                  value={'includeEMail'}
                  isChecked={includeEmail}
                  onChange={() => { setIncludeEmail(!includeEmail); }}
                >
                  {t('feedbackWidget.checkbox')}
                </Checkbox>
                <FormControl display={'flex'} justifyContent={'space-between'}>
                  <Select
                    width={'100%'}
                    size={'md'}
                    defaultValue={selectedCategory}
                    onChange={e => {
                      setSelectedCategory(e.target.value);
                    }}
                  >
                    {config.FEEDBACK.categories.map((c, i) => {
                      return (
                        <option key={i} value={c}>
                          {t(`feedbackWidget.categories.${c}`)}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                <Textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
                <Divider aria-hidden={true} pt={2} mb={2} />
                <Button
                  variant={'brand'}
                  className="fontsize-lg-btn"
                  style={{
                    fontSize: '22px',
                  }}
                  onClick={() => {
                    handleSubmitPress();
                    onClose();
                  }}
                  ref={popoverRef}
                >
                  {t('global.submit')}
                </Button>
              </SimpleGrid>
            </PopoverBody>
            {/* </FocusLock> */}
            {/* <PopoverFooter></PopoverFooter> */}
          </PopoverContent>
        </Popover>
      </Box>
    </Tooltip>
  );
};

export { FeedbackWidget };
