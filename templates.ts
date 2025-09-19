import { readFileSync } from 'fs';
import { join } from 'path';

interface TemplateVariables {
  [key: string]: string;
}

function renderTemplate(templateName: string, variables: TemplateVariables = {}): string {
  const templatePath = join(import.meta.dir, 'templates', `${templateName}.html`);
  let template = readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    template = template.replaceAll(placeholder, value);
  }

  return template;
}

export function getMainPage(isLoggedIn: boolean, config: any): string {
  const buttonText = isLoggedIn ? 'Logout' : 'Login with Concept2';
  const buttonAction = isLoggedIn ? 'logout()' : 'login()';
  const buttonClass = isLoggedIn ? 'logout-button' : '';

  return renderTemplate('main', {
    buttonText,
    buttonAction,
    buttonClass,
    clientId: config.concept2.clientId,
    redirectUri: config.concept2.redirectUri,
    apiBaseUrl: config.concept2.apiBaseUrl,
  });
}

export function getSuccessPage(): string {
  return renderTemplate('success');
}

export function getErrorPage(errorMessage: string): string {
  return renderTemplate('error', {
    errorMessage,
  });
}