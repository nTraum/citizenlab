import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BogusButton from './components/BogusButton';
import VerificationFormBogus from './components/VerificationFormBogus';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'bogus';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      onClick,
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        const onMethodSelected = () => onClick(verificationMethodName);

        return (
          <BogusButton
            method={method}
            last={last}
            onMethodSelected={onMethodSelected}
          />
        );
      }

      return null;
    },
    'app.components.VerificationModal.methodSteps': ({
      method,
      activeStep,
      ...otherProps
    }) => {
      if (activeStep === 'method-step' && method?.attributes.name === 'bogus') {
        return <VerificationFormBogus {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
