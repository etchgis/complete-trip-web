export const sampleForm = () => {
  return (
    <Stack spacing={4}>
      <FormControl id="email" isRequired>
        <FormLabel>Email address</FormLabel>
        <Input type="email" />
      </FormControl>
    </Stack>
  );
};
