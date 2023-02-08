import { Box, Heading } from '@chakra-ui/react';
import {
  DatePickerCalendar,
  DatePickerStatic,
  getLocalTimeZone,
  today,
} from '@saas-ui/date-picker';

import { useEffect } from 'react';
import { useState } from 'react';

export const Trips = ({ testDate }) => {
  const [value, setValue] = useState(testDate || today(getLocalTimeZone()));
  console.log(value);
  useEffect(() => {
    const days = document.querySelectorAll('tr th');
    days.forEach((e, i) => {
      if (i === 0) {
        e.innerHTML = 'SUN';
      } else if (i === 1) {
        e.innerHTML = 'MON';
      } else if (i === 2) {
        e.innerHTML = 'TUE';
      } else if (i === 3) {
        e.innerHTML = 'WED';
      } else if (i === 4) {
        e.innerHTML = 'THU';
      } else if (i === 5) {
        e.innerHTML = 'FRI';
      } else if (i === 6) {
        e.innerHTML = 'SAT';
      }
    });
  }, []);
  return (
    <Box p={10}>
      <Heading mb={10}>Trips</Heading>
      <Box className="etch-calendar" width="100%" maxW="700px" ml={-2}>
        <DatePickerStatic value={value} onChange={setValue}>
          <DatePickerCalendar />
        </DatePickerStatic>
      </Box>
    </Box>
  );
};
