// Problem detail codes the app reacts to, beyond showing their text. Same values as ErrorCodes in mentor-mentee-core.
export const API_ERROR_CODES = {
  core: {
    /** ErrorCodes.CONSENT_OUTDATED: the document sent is no longer the one in force. */
    consentOutdated: 'core.consent.outdated',
    /** ErrorCodes.TERMS_NOT_ACCEPTED: the terms in force have no acceptance yet. */
    termsNotAccepted: 'core.profile.termsNotAccepted',
  },
} as const;
