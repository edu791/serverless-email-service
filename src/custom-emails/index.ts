import { WelcomeEmail } from './webapp/welcome.email';

export function getCustomEmailClass(app: string, type: string): any {
  let classObject;
  if (app) {
    if (!customEmailClasses[app]) {
      throw new Error(`app: '${app}' not defined in custom-emails/index.ts`);
    }
    classObject = customEmailClasses[app][type];
  } else {
    classObject = customEmailClasses[type];
  }

  if (typeof classObject !== 'function') {
    throw new Error(
      `No class defined for app: '${app}' and type: '${type}' in custom-emails/index.ts`,
    );
  }

  return classObject;
}

const customEmailClasses = {
  webapp: {
    welcome: WelcomeEmail,
  },
};
