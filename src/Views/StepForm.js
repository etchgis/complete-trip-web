import * as Yup from 'yup';

import {
  ButtonGroup,
  Field,
  StepForm as Form,
  FormLayout,
  FormStep,
  FormStepper,
  FormValue,
  Loader,
  NextButton,
  PrevButton,
  Property,
  PropertyList,
  StepperCompleted,
} from '@saas-ui/react';

import { Spacer } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';

export const StepForm = () => {
  const schemas = {
    project: Yup.object().shape({
      name: Yup.string().required().label('Name'),
      description: Yup.string().label('Description'),
    }),
    members: Yup.object().shape({
      members: Yup.string().label('Members'),
    }),
  };

  const onSubmit = params => {
    console.log(params);
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  };

  return (
    <Form
      defaultValues={{
        name: '',
        email: '',
        password: '',
      }}
      onSubmit={onSubmit}
    >
      <FormLayout>
        <FormStepper>
          <FormStep
            name="project"
            title="Project details"
            resolver={yupResolver(schemas.project)}
          >
            <FormLayout>
              <Field name="name" isRequired label="Name" />
              <Field name="description" label="Description" />
            </FormLayout>
          </FormStep>
          <FormStep
            name="members"
            title="Invite your team"
            resolver={yupResolver(schemas.members)}
          >
            <FormLayout>
              <Field
                name="members"
                type="textarea"
                label="Invite people"
                placeholder="hello@saas-ui.dev, etc"
                autoFocus
              />
            </FormLayout>
          </FormStep>
          <FormStep name="confirm" title="Confirm">
            <FormLayout>
              <Text>Please confirm that your information is correct.</Text>
              <PropertyList>
                <Property label="Name" value={<FormValue name="name" />} />
                <Property
                  label="Description"
                  value={<FormValue name="description" />}
                />
              </PropertyList>
            </FormLayout>
          </FormStep>

          <StepperCompleted>
            <Loader>We are setting up your project, just a moment...</Loader>
          </StepperCompleted>
        </FormStepper>
        <ButtonGroup w="full">
          <PrevButton variant="ghost" />
          <Spacer />
          <NextButton />
        </ButtonGroup>
      </FormLayout>
    </Form>
  );
};
