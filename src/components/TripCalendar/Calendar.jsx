import {
  Box,
  Button,
  Flex,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const Calendar = observer(() => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tabIndex, setTabIndex] = useState(new Date().getMonth() + 1);
  const { colorMode } = useColorMode();
  const { trips } = useStore().schedule;
  const { t } = useTranslation();

  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  // const Months = [
  //   'JAN',
  //   'FEB',
  //   'MAR',
  //   'APR',
  //   'MAY',
  //   'JUN',
  //   'JUL',
  //   'AUG',
  //   'SEP',
  //   'OCT',
  //   'NOV',
  //   'DEC',
  // ];

  //TODO add actual saved trip dates
  const dates = [];

  trips.forEach(trip => {
    dates.push(new Date(trip.plan.startTime));
  });

  // const dates = [
  //   new Date('2023-03-15'),
  // ];
  // console.log({ dates });
  //const pad = num => (num < 10 ? `0${num}` : num.toString().slice(0, 2));

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  // useEffect(() => {
  //   console.log(currentMonth.getMonth() + 1);
  //   console.log(tabIndex);
  //   console.log(currentMonth.getFullYear());
  // }, [tabIndex]);

  const renderDays = () => {
    const days = [];

    const datesInMonth = dates.filter(d => {
      return (
        d.getMonth() === currentMonth.getMonth() &&
        d.getFullYear() === currentMonth.getFullYear()
      );
    });

    const selectedDates = datesInMonth.map(d => d.getDate());

    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const startDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    // Generate table header with day abbreviations
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const header = weekdays.map(weekday => (
      <Th key={weekday} textAlign={'center'} fontSize={'sm'}>
        {t(`time.${weekday}`)}
      </Th>
    ));

    // Generate table rows with days of the month
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const cells = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDayOfMonth) {
          cells.push(<Td key={`${i}-${j}`} />);
        } else if (day > daysInMonth) {
          break;
        } else {
          cells.push(
            <Td key={`${i}-${j}`} textAlign="center" px={1} py={2}>
              <Button
                fontSize={{ base: 'sm', lg: 'lg' }}
                variant={selectedDates.includes(day) ? 'brand' : 'outline'}
                border="none"
                maxW="43px"
                aria-label={
                  t(`time.${months[currentMonth.getMonth()]}`) + ' ' + day
                }
              >
                {day}
              </Button>
            </Td>
          );
          day++;
        }
      }
      days.push(<Tr key={i}>{cells}</Tr>);
      if (day > daysInMonth) {
        break;
      }
    }

    return (
      <Table size="sm">
        <Thead>
          <Tr>{header}</Tr>
        </Thead>
        <Tbody>{days}</Tbody>
      </Table>
    );
  };

  return (
    <Box
      id="static-calendar"
      maxW="540px"
      display={{ base: 'none', sm: 'block' }}
      background={colorMode === 'light' ? 'white' : 'gray.900'}
      borderRadius="md"
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.300' : 'gray.700'}
      height="fit-content"
    >
      <Flex
        justifyContent={'space-between'}
        alignItems="center"
        py={3}
        pl={5}
        pr={3}
      >
        <Text fontWeight={'bold'}>
          {t(`time.${months[currentMonth.getMonth()]}`)}{' '}
          {currentMonth.getFullYear()}
        </Text>
        <Flex>
          <IconButton
            aria-label={t('global.prevMonth')}
            icon={<ChevronLeftIcon boxSize={8} />}
            onClick={() => {
              if (tabIndex === 0) {
                setTabIndex(11);
              } else if (tabIndex === 11) {
                setTabIndex(0);
              } else {
                setTabIndex(tabIndex - 1);
              }
              prevMonth();
            }}
            variant="ghost"
          />
          <IconButton
            aria-label={t('global.nextMonth')}
            icon={<ChevronRightIcon boxSize={8} />}
            onClick={() => {
              if (tabIndex === 11) {
                setTabIndex(0);
              } else {
                setTabIndex(tabIndex + 1);
              }
              nextMonth();
            }}
            variant="ghost"
          />
        </Flex>
      </Flex>
      {renderDays()}
    </Box>
  );
});
