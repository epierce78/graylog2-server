// @flow strict
import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { Formik, Form, Field } from 'formik';

import { Alert, Button, ButtonToolbar, Row, Col, Panel } from 'components/graylog';
import { Icon, FormikFormGroup, Select } from 'components/common';
import { validateField, validation } from 'util/FormsUtils';
import AuthzRolesDomain from 'domainActions/roles/AuthzRolesDomain';
import { Input } from 'components/bootstrap';

import BackendWizardContext from './contexts/BackendWizardContext';

export type StepKeyType = 'user-synchronization';
export const STEP_KEY: StepKeyType = 'user-synchronization';
export const FORM_VALIDATION = {
  userSearchBase: { required: true },
  userSearchPattern: { required: true },
  userNameAttribute: { required: true },
  userFullNameAttribute: { required: true },
  defaultRoles: { required: true },
};

type Props = {
  help?: {
    userSearchBase?: React.Node,
    userSearchPattern?: React.Node,
    userNameAttribute?: React.Node,
    defaultRoles?: React.Node,
  },
  formRef: React.ElementRef<typeof Formik | null>,
  onSubmit: () => void,
  onSubmitAll: () => void,
  validateOnMount: boolean,
};

const defaultHelp = {
  userSearchBase: (
    <span>
      The base tree to limit the Active Directory search query to, e.g. <code>cn=users,dc=example,dc=com</code>.
    </span>
  ),
  userSearchPattern: (
    <span>
      For example <code className="text-nowrap">{'(&(objectClass=user)(sAMAccountName={0}))'}</code>.{' '}
      The string <code>{'{0}'}</code> will be replaced by the entered username.
    </span>
  ),
  userNameAttribute: (
    <span>
      Which Active Directory attribute to use for the username of the user in Graylog.<br />
      Try to load a test user using the sidebar form, if you are unsure which attribute to use.
    </span>
  ),
  userFullNameAttribute: (
    <span>
      Which Active Directory attribute to use for the full name of the user in Graylog, e.g. <code>displayName</code>.<br />
    </span>
  ),
  defaultRoles: (
    'The default Graylog role determines whether a user created via LDAP can access the entire system, or has limited access.'
  ),
};

const UserSyncStep = ({ help: propsHelp, onSubmit, onSubmitAll, formRef, validateOnMount }: Props) => {
  const help = { ...defaultHelp, ...propsHelp };
  const { setStepsState, ...stepsState } = useContext(BackendWizardContext);
  const [rolesOptions, setRolesOptions] = useState([]);

  const _onSubmitAll = (validateForm) => {
    validateForm().then((errors) => {
      if (!validation.hasErrors(errors)) {
        onSubmitAll();
      }
    });
  };

  useEffect(() => {
    const getUnlimited = [1, 0, ''];

    AuthzRolesDomain.loadRolesPaginated(...getUnlimited).then((roles) => {
      if (roles) {
        const options = roles.list.map((role) => ({ label: role.name, value: role.name })).toArray();
        setRolesOptions(options);
      }
    });
  }, []);

  return (
    // $FlowFixMe innerRef works as expected
    <Formik initialValues={stepsState.formValues}
            onSubmit={onSubmit}
            innerRef={formRef}
            validateOnMount={validateOnMount}
            validateOnBlur={false}
            validateOnChange={false}>
      {({ isSubmitting, validateForm }) => {
        return (
          <Form className="form form-horizontal">
            <FormikFormGroup label="Search Base DN"
                             name="userSearchBase"
                             placeholder="Search Base DN"
                             validate={validateField(FORM_VALIDATION.userSearchBase)}
                             help={help.userSearchBase} />

            <FormikFormGroup label="Search Pattern"
                             name="userSearchPattern"
                             placeholder="Search Pattern"
                             validate={validateField(FORM_VALIDATION.userSearchPattern)}
                             help={help.userSearchPattern} />

            <FormikFormGroup label="Name Attirbute"
                             name="userNameAttribute"
                             placeholder="Name Attirbute"
                             validate={validateField(FORM_VALIDATION.userNameAttribute)}
                             help={help.userNameAttribute} />

            <FormikFormGroup label="Full Name Attirbute"
                             name="userFullNameAttribute"
                             placeholder="Full Name Attirbute"
                             validate={validateField(FORM_VALIDATION.userFullNameAttribute)}
                             help={help.userFullNameAttribute} />

            <Row>
              <Col sm={9} smOffset={3}>
                <Panel bsStyle="info">
                  Changing the static role assignment will only affect to new users created via LDAP/Active Directory!<br />
                  Existing user accounts will be updated on their next login, or if you edit their roles manually.
                </Panel>
              </Col>
            </Row>

            <Field name="defaultRoles" validate={validateField(FORM_VALIDATION.defaultRoles)}>
              {({ field: { name, value, onChange, onBlur }, meta: { error } }) => (
                <Input id="default-roles-select"
                       label="Default Roles"
                       help={error ?? help.defaultRoles}
                       bsStyle={error ? 'error' : undefined}
                       labelClassName="col-sm-3"
                       wrapperClassName="col-sm-9">
                  <Select inputProps={{ 'aria-label': 'Search for roles' }}
                          onChange={(selectedRoles) => onChange({ target: { value: selectedRoles, name } })}
                          onBlur={onBlur}
                          options={rolesOptions}
                          placeholder="Search for roles"
                          multi
                          value={value} />
                </Input>
              )}
            </Field>

            <Row>
              <Col sm={9} smOffset={3}>
                <Alert bsStyle="info">
                  <Icon name="info-circle" />{' '}
                  We recommend you test your user login in the sidebar panel to verify your settings.
                </Alert>
              </Col>
            </Row>

            <ButtonToolbar className="pull-right">
              <Button type="button"
                      onClick={() => _onSubmitAll(validateForm)}
                      disabled={isSubmitting}>
                Finish & Save Identity Provider
              </Button>
              <Button bsStyle="primary"
                      type="submit"
                      disabled={isSubmitting}>
                Next: Group Synchronisation
              </Button>
            </ButtonToolbar>
          </Form>
        );
      }}
    </Formik>
  );
};

UserSyncStep.defaultProps = {
  help: {},
};

export default UserSyncStep;
