export interface TemplateProps {
  title: string;
  description?: string;
  theme?: 'light' | 'dark';
  logo?: string;
  background?: string;
  textColor?: string;
  fontSize?: number;
}

type TemplateElement = {
  type: string;
  props: Record<string, unknown>;
};

type TemplateFn = (props: TemplateProps) => TemplateElement;

interface TemplateConfig {
  name: string;
  description: string;
  fn: TemplateFn;
}

// Default template - Clean gradient background
const defaultTemplate: TemplateFn = ({ title, description, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '90%',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                    margin: 0,
                    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                  },
                  children: title,
                },
              },
              description && {
                type: 'p',
                props: {
                  style: {
                    fontSize: '28px',
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: '24px',
                    lineHeight: 1.4,
                  },
                  children: description,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
};

// Minimal template - Simple solid color
const minimalTemplate: TemplateFn = ({ title, description, theme = 'dark', background, textColor }) => {
  const isDark = theme === 'dark';
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: background || (isDark ? '#000000' : '#ffffff'),
        padding: '60px',
      },
      children: [
        {
          type: 'h1',
          props: {
            style: {
              fontSize: '72px',
              fontWeight: 700,
              color: textColor || (isDark ? '#ffffff' : '#000000'),
              lineHeight: 1.1,
              margin: 0,
            },
            children: title,
          },
        },
        description && {
          type: 'p',
          props: {
            style: {
              fontSize: '32px',
              color: textColor || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'),
              marginTop: '16px',
            },
            children: description,
          },
        },
      ].filter(Boolean),
    },
  };
};

// Card template - Centered card look
const cardTemplate: TemplateFn = ({ title, description, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#0a0a0a' : '#f5f5f5',
        padding: '40px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: isDark ? '#1a1a1a' : '#ffffff',
              borderRadius: '24px',
              padding: '60px 80px',
              boxShadow: isDark
                ? '0 25px 50px -12px rgba(0,0,0,0.5)'
                : '0 25px 50px -12px rgba(0,0,0,0.15)',
              maxWidth: '85%',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '56px',
                    fontWeight: 700,
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    lineHeight: 1.2,
                    margin: 0,
                  },
                  children: title,
                },
              },
              description && {
                type: 'p',
                props: {
                  style: {
                    fontSize: '26px',
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    marginTop: '20px',
                    lineHeight: 1.4,
                  },
                  children: description,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
};

// Split template - Left-aligned with accent bar
const splitTemplate: TemplateFn = ({ title, description, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        background: isDark ? '#0f0f0f' : '#ffffff',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '12px',
              background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px 80px',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '64px',
                    fontWeight: 700,
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    lineHeight: 1.15,
                    margin: 0,
                  },
                  children: title,
                },
              },
              description && {
                type: 'p',
                props: {
                  style: {
                    fontSize: '28px',
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    marginTop: '24px',
                    lineHeight: 1.4,
                  },
                  children: description,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
};

// Gradient border template
const borderTemplate: TemplateFn = ({ title, description, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
        padding: '8px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: isDark ? '#0a0a0a' : '#ffffff',
              padding: '60px',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: '60px',
                    fontWeight: 700,
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    lineHeight: 1.2,
                    margin: 0,
                  },
                  children: title,
                },
              },
              description && {
                type: 'p',
                props: {
                  style: {
                    fontSize: '26px',
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    marginTop: '20px',
                    lineHeight: 1.4,
                  },
                  children: description,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
};

export const templates: Record<string, TemplateConfig> = {
  default: {
    name: 'Default',
    description: 'Clean gradient background with centered text',
    fn: defaultTemplate,
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple solid color with bottom-aligned text',
    fn: minimalTemplate,
  },
  card: {
    name: 'Card',
    description: 'Centered card with shadow',
    fn: cardTemplate,
  },
  split: {
    name: 'Split',
    description: 'Left-aligned with gradient accent bar',
    fn: splitTemplate,
  },
  border: {
    name: 'Border',
    description: 'Gradient border effect',
    fn: borderTemplate,
  },
};

export function getTemplate(name: string): TemplateFn {
  return templates[name]?.fn || templates.default.fn;
}
