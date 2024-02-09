import {
  Box,
  Button,
  Divider,
  Heading,
  IconButton,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';

import { EditLanguage } from '../Settings/EditAccessibility';
import { FaUniversalAccess } from 'react-icons/fa';
import FocusLock from 'react-focus-lock';
import { useRef } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

const AccessibilityWidget = ({ showTitle }) => {
  const ref = useRef();
  const { setUI } = useStore().uiStore;
  const { t } = useTranslation();
  return (
    <Box>
      <Popover placement={showTitle ? 'bottom' : 'right-end'}>
        <PopoverTrigger>
          <Button
            className="icon-button"
            aria-label={t('sidebar.accessibility')}
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
              <FaUniversalAccess
                fontSize="32px"
                style={{ marginRight: showTitle ? 0 : '-0.5rem' }}
              />
            }
          >
            {showTitle && t('sidebar.accessibility')}
          </Button>
        </PopoverTrigger>
        <PopoverContent boxShadow="xl">
          {/* <FocusLock returnFocus persistentFocus={false}> */}
          <PopoverArrow />
          <PopoverCloseButton fontSize={'16px'} m={1} />
          <PopoverHeader>
            <Heading as="h3" size="md" margin="0.5">
              {t('ariaWidget.settings')}
            </Heading>
          </PopoverHeader>
          <PopoverBody>
            <SimpleGrid columns={1} spacing={2}>
              <Heading as="h4" margin="0.5">
                <Box style={{ fontSize: '16px' }}>
                  {t('ariaWidget.fontSize')} (16px)
                </Box>
              </Heading>
              <Button
                variant={'outline'}
                className="fontsize-md-btn"
                onClick={() => {
                  if (document.body.classList.contains('fontsize-md')) {
                    setUI({
                      fontSize: 'normal',
                    });
                  } else {
                    setUI({
                      fontSize: 'med',
                    });
                  }
                }}
              >
                {t('ariaWidget.medium')} (18px)
              </Button>
              <Button
                variant={'outline'}
                className="fontsize-lg-btn"
                style={{
                  fontSize: '22px',
                }}
                onClick={() => {
                  if (document.body.classList.contains('fontsize-lg')) {
                    setUI({
                      fontSize: 'normal',
                    });
                  } else {
                    setUI({
                      fontSize: 'lg',
                    });
                  }
                }}
              >
                {t('ariaWidget.large')} (22px)
              </Button>
              <Heading as="h4" size="sm" margin="0.5">
                {t('ariaWidget.contrast')}
              </Heading>
              <Button
                variant={'outline'}
                className="contrast-btn"
                onClick={() => {
                  if (document.body.classList.contains('contrast')) {
                    setUI({
                      contrast: false,
                    });
                  } else {
                    setUI({
                      contrast: true,
                    });
                  }
                }}
              >
                {t('ariaWidget.contrast')}
              </Button>

              <Heading as="h4" size="sm" margin="0.5">
                {t('ariaWidget.letterSpacing')}
              </Heading>
              <Button
                variant={'outline'}
                className="letter-spacing-lg-btn"
                onClick={() => {
                  if (document.body.classList.contains('letter-spacing-lg')) {
                    setUI({
                      letterSpacing: 'normal',
                    });
                  } else {
                    setUI({
                      letterSpacing: 'lg',
                    });
                  }
                }}
              >
                <Box letterSpacing={'0.1rem'}>{t('ariaWidget.expanded')}</Box>
                <Box letterSpacing={'inherit'}>/{t('ariaWidget.normal')}</Box>
              </Button>

              {/* <Heading as="h4" size="sm" margin="0.5">
                Helper Icons
              </Heading>
              <Button
                isDisabled
                variant={'outline'}
                className="hide-images-btn"
                onClick={() => {
                  if (document.body.classList.contains('hide-images')) {
                    setUI({
                      hideImages: false,
                    });
                  } else {
                    setUI({
                      hideImages: true,
                    });
                  }
                }}
              >
                Show/Hide Icons
              </Button> */}

              <Heading as="h4" size="sm" margin="0.5">
                {t('ariaWidget.cursorSize')}
              </Heading>
              <Button
                variant={'outline'}
                className="cursor-lg-btn"
                onClick={() => {
                  if (document.body.classList.contains('cursor-lg')) {
                    setUI({
                      cursor: 'normal',
                    });
                  } else {
                    setUI({
                      cursor: 'lg',
                    });
                  }
                }}
              >
                {t('ariaWidget.largeCursor')}
              </Button>
              <Divider pt={2} mb={2} />
              <EditLanguage />
            </SimpleGrid>
          </PopoverBody>
          {/* </FocusLock> */}
          {/* <PopoverFooter></PopoverFooter> */}
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default AccessibilityWidget;
