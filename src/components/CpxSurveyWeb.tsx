import { useRef, useEffect, useState } from 'react';

// Define props interface
interface CpxSurveyWebProps {
  appId: string | number;
  userId: string | null;
  surveyStyle?: number;
  onLoad?: () => void;
}

const CpxSurveyWeb = ({ appId, userId, surveyStyle = 3 }: CpxSurveyWebProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight] = useState<number>(surveyStyle === 1 ? 400 : 200);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    // Generate HTML content with the CPX script
    const generateHTML = (): string => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; }
            #cpx-container { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="cpx-container"></div>
          
          <script>
            // CPX Configuration
            const scriptConfig = {
              div_id: "cpx-container",
              theme_style: ${surveyStyle},
              order_by: 2,
              limit_surveys: 7
            };

            const config = {
              general_config: {
                app_id: ${appId},
                ext_user_id: "${userId || ''}",
                email: "",
                username: "",
                secure_hash: "",
                subid_1: "",
                subid_2: "",
              },
              style_config: {
                text_color: "#2b2b2b",
                survey_box: {
                  topbar_background_color: "#ffaf20",
                  box_background_color: "white",
                  rounded_borders: true,
                  stars_filled: "black",
                },
              },
              script_config: [scriptConfig],
              debug: false,
              useIFrame: false,
              functions: {
                no_surveys_available: () => {
                  window.parent.postMessage(JSON.stringify({
                    type: 'no_surveys'
                  }), "*");
                },
                count_new_surveys: (count: number) => {
                  window.parent.postMessage(JSON.stringify({
                    type: 'survey_count',
                    count: count
                  }), "*");
                },
                get_all_surveys: (surveys: any[]) => {
                  window.parent.postMessage(JSON.stringify({
                    type: 'all_surveys',
                    surveys: surveys
                  }), "*");
                },
                get_transaction: (transactions: any) => {
                  window.parent.postMessage(JSON.stringify({
                    type: 'transaction',
                    transactions: transactions
                  }), "*");
                }
              }
            };

            window.config = config;

            // Load CPX script
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js';
            script.onload = function() {
              // Notify parent that iframe content is loaded
              window.parent.postMessage(JSON.stringify({
                type: 'iframe_loaded'
              }), "*");
            };
            script.onerror = function() {
              window.parent.postMessage(JSON.stringify({
                type: 'script_load_error'
              }), "*");
            };
            document.head.appendChild(script);
          </script>
        </body>
        </html>
      `;
    };

    setHtmlContent(generateHTML());
  }, [appId, userId, surveyStyle]);

  const handleIframeError = (): void => {
    console.error('Failed to load iframe');
  };

  return (
    <div style={{ height: iframeHeight, width: '100%' }}>
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="CPX Surveys"
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
};

export default CpxSurveyWeb;