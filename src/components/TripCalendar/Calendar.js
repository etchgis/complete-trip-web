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

export const Calendar = observer(() => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tabIndex, setTabIndex] = useState(new Date().getMonth() + 1);
  const { colorMode } = useColorMode();
  const { trips } = useStore().schedule;

  const FullMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const header = weekdays.map(weekday => (
      <Th key={weekday} textAlign={'center'}>
        {weekday}
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
                colorScheme={selectedDates.includes(day) ? 'blue' : 'gray'}
                maxW="43px"
                backgroundColor={
                  selectedDates.includes(day)
                    ? 'facebook'
                    : colorMode === 'light'
                    ? 'white'
                    : 'transparent'
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
      background={colorMode === 'light' ? 'white' : 'gray.800'}
      borderRadius="md"
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.300' : 'gray.400'}
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
          {FullMonths[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <Flex>
          <IconButton
            aria-label="Previous month"
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
            aria-label="Next month"
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
